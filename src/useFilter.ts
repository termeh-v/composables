import {
    isArray,
    isCompoundType,
    isNumber,
    isNumeric,
    isObject,
    isString,
    type CompoundType,
    type PrimitiveType,
} from "@termeh-v/utils";
import { computed, reactive } from "vue";
import { useSigner } from "./useSigner";
import { useStorage } from "./useStorage";

type OrderType = "asc" | "desc";
type StorableType = "limit" | "sorts";
type FilterType = Record<string, CompoundType>;
type Callback = (params: Record<string, unknown>, urlEncoded: string) => void;

export interface Sort {
    field: string;
    order: OrderType;
}

export interface Filters {
    page: number;
    limit: number;
    search: string;
    sorts: Sort[];
    filters: FilterType;
}

/**
 * Composable to manage and persist filter state including pagination, sorting, search, and custom filters.
 * Integrates with storage, encoding, and signing utilities.
 *
 * @template TRecord - Type of individual records.
 * @template TMeta - Type of metadata.
 * @param storagePrefix - Prefix used for storage keys.
 * @param options - Optional configuration including storables and default filter values.
 * @returns An object with reactive filter state, computed properties, and methods to apply, parse, and manage filters.
 */
export function useFilter<TRecord extends object, TMeta extends object>(
    storagePrefix: string,
    options?: {
        storables?: StorableType[] | "all";
        defaults?: Partial<Filters>;
    }
) {
    const utils = useUtils();
    const signer = useSigner();
    const encoder = useEncoder();
    const storage = useStorage(localStorage, storagePrefix);
    const response = useResponse<TRecord, TMeta>();

    options = {
        storables: "all",
        ...utils.removeZero({ storables: options?.storables }),
        defaults: {
            page: 1,
            limit: 20,
            search: "",
            sorts: [],
            filters: {},
            ...utils.removeZero(options?.defaults),
            ...utils.removeZero({
                limit: utils.isValidOption("limit", options?.storables)
                    ? storage.number("limit")
                    : undefined,
                sort: utils.isValidOption("sorts", options?.storables)
                    ? encoder.decodeSorts(storage.string("sorts") || "") ||
                      undefined
                    : undefined,
            }),
        },
    };

    const stats = reactive<{
        sign: string;
        locked: boolean;
        callback?: Callback;
        page: number;
        limit: number;
        search: string;
        sorts: Sort[];
        filters: FilterType;
    }>({
        sign: "",
        locked: false,
        callback: undefined,
        page: utils.positiveSafe(options?.defaults?.page, 0)!,
        limit: utils.positiveSafe(options?.defaults?.limit, 0)!,
        search: utils.stringSafe(options?.defaults?.search, "")!,
        sorts: utils.arraySafe<Sort>(options?.defaults?.sorts, [])!,
        filters: utils.objectSafe<FilterType>(options?.defaults?.filters, {})!,
    });

    const page = computed(() => stats.page);
    const limit = computed(() => stats.limit);
    const search = computed(() => stats.search);
    const sort = computed(() => stats.sorts?.[0]);
    const sorts = computed(() => stats.sorts);
    const filters = computed(() => ({ ...utils.removeZero(stats.filters) }));
    const isFiltered = computed(() => Object.keys(filters.value).length > 0);

    function filter<T extends CompoundType>(key: string) {
        return computed<T | undefined>(() => stats.filters?.[key] as T);
    }

    /**
     * Registers a callback triggered when filters are applied.
     * @param callback - Function invoked with current params and URL-encoded string.
     */
    function onApply(callback: Callback) {
        stats.callback = callback;
    }

    /**
     * Parses URL-encoded filter string and applies the resulting filter state.
     * @param encoded - Encoded filter string.
     */
    function parseURL(encoded: string) {
        apply(encoder.decode(encoded));
    }

    /**
     * Parses an API response and applies the resulting filter state.
     * @param r - Raw response object.
     */
    function parseResponse(r: unknown) {
        apply(response.parse(r));
    }

    /**
     * Applies filter values, updates reactive state, persists storables, and triggers callback if state changed.
     * @param filters - Partial filter values to apply.
     */
    async function apply(filters: Partial<Filters>) {
        if (stats.locked) return;
        stats.locked = true;
        try {
            if (utils.positiveSafe(filters?.page, 0)! > 0)
                stats.page = Number(filters.page);
            if (utils.positiveSafe(filters?.limit, 0)! > 0)
                stats.limit = Number(filters.limit);
            if (isString(filters.search) && filters.search != "")
                stats.search = filters.search;
            if (isArray(filters.sorts)) stats.sorts = filters.sorts;
            if (isObject(filters.filters))
                stats.filters = utils.removeZero(filters.filters) as FilterType;

            const params = {
                page: stats.page,
                limit: stats.limit,
                search: stats.search,
                sorts: stats.sorts,
                filters: { ...stats.filters },
            };

            const isSame = await signer.validate(params, stats.sign);
            if (!isSame) {
                stats.sign = await signer.sign(params);
                stats.callback?.(params, encoder.encode(params));
                const limitValue = utils.positiveSafe(stats.limit, 0)!;
                const sortsValue = utils.arraySafe<Sort>(stats.sorts, [])!;
                if (
                    utils.isValidOption("limit", options?.storables) &&
                    limitValue > 0
                )
                    storage.set("limit", limitValue.toString());
                if (
                    utils.isValidOption("sorts", options?.storables) &&
                    sortsValue.length
                )
                    storage.set("sorts", encoder.encodeSorts(sortsValue));
            }
        } finally {
            stats.locked = false;
        }
    }

    return {
        page,
        limit,
        search,
        sort,
        sorts,
        filters,
        isFiltered,
        filter,
        total: response.total,
        from: response.from,
        to: response.to,
        pages: response.pages,
        meta: response.meta,
        records: response.records,
        onApply,
        parseURL,
        parseResponse,
        apply,
    };
}

/**
 * Composable to manage and parse paginated API response data reactively.
 *
 * @template TRecord - Type of records array.
 * @template TMeta - Type of meta object.
 */
function useResponse<TRecord, TMeta>() {
    const utils = useUtils();
    const response = reactive<Record<string, unknown>>({});

    const total = computed(() => utils.positiveSafe(response.total));
    const from = computed(() => utils.positiveSafe(response.from));
    const to = computed(() => utils.positiveSafe(response.to));
    const pages = computed(() => utils.positiveSafe(response.pages));
    const meta = computed(() => utils.objectSafe<TMeta>(response.meta));
    const records = computed(() => utils.arraySafe<TRecord>(response.data, []));
    const isEmpty = computed(() => records.value!.length <= 0);

    function getPage() {
        return utils.positiveSafe(response.page);
    }
    function getLimit() {
        return utils.positiveSafe(response.limit);
    }
    function getSearch() {
        return utils.stringSafe(response.search);
    }
    function getSorts() {
        return utils.arraySafe<Sort>(response.sorts);
    }
    function getFilters() {
        return utils.objectSafe<FilterType>(response.filters);
    }

    function parse(r: unknown): Partial<Filters> {
        if (isObject(r)) {
            Object.assign(response, r);
            return utils.removeZero({
                page: getPage(),
                limit: getLimit(),
                search: getSearch(),
                sorts: getSorts(),
                filters: getFilters(),
            });
        } else {
            Object.keys(response).forEach((k) => delete response[k]);
            return {};
        }
    }

    return {
        total,
        from,
        to,
        pages,
        meta,
        records,
        isEmpty,
        getPage,
        getLimit,
        getSearch,
        getSorts,
        getFilters,
        parse,
    };
}

/**
 * Encodes and decodes Filters objects to/from URL query strings.
 */
function useEncoder() {
    const utils = useUtils();

    function encodeValue(v: PrimitiveType): string {
        return v == null
            ? encodeURIComponent("[null]")
            : encodeURIComponent(String(v));
    }
    function decodeValue(v: string): string {
        return decodeURIComponent(v);
    }
    function inferType(value: string): PrimitiveType {
        value = decodeValue(value);
        if (value === "true") return true;
        if (value === "false") return false;
        if (value === "[null]") return null;
        if (isNumeric(value)) return Number(value);
        return value;
    }
    function encodeArray(value: PrimitiveType[]): string {
        return value.map(encodeValue).join(",");
    }
    function decodeArray(encoded: string): PrimitiveType[] {
        return encoded.split(",").map(inferType);
    }
    function encodeObject(value: Record<string, PrimitiveType>): string {
        return Object.entries(value)
            .map(([k, v]) => `${encodeValue(k)}:${encodeValue(v)}`)
            .join(",");
    }
    function decodeObject(encoded: string): Record<string, PrimitiveType> {
        const obj: Record<string, PrimitiveType> = {};
        encoded.split(",").forEach((part) => {
            const [k, v] = part.split(":");
            if (k.trim() && v) obj[decodeValue(k.trim())] = inferType(v);
        });
        return obj;
    }
    function encodeSorts(sorts: Sort[]): string {
        return sorts
            .map((s) => `${encodeValue(s.field)}:${encodeValue(s.order)}`)
            .join(",");
    }
    function decodeSorts(encoded: string): Sort[] {
        return encoded
            .split(",")
            .filter((i) => i && i.includes(":"))
            .map((i) => {
                const [field, order] = i.split(":");
                if (!field.trim() || !order) return undefined;
                const f = decodeValue(field.trim());
                const o = decodeValue(order);
                return f && utils.isOrderType(o)
                    ? { field: f, order: o }
                    : undefined;
            })
            .filter((i): i is Sort => i !== undefined);
    }
    function encode(state: Filters): string {
        const params = new URLSearchParams();
        if (isNumber(state.page) && state.page > 0)
            params.set("page", String(state.page));
        if (isNumber(state.limit) && state.limit > 0)
            params.set("limit", String(state.limit));
        if (isString(state.search) && state.search != "")
            params.set("search", state.search);
        if (isArray(state.sorts) && state.sorts.length > 0)
            params.set("sorts", encodeSorts(state.sorts));
        if (isObject(state.filters)) {
            for (const [k, v] of Object.entries(state.filters)) {
                if (isArray(v)) params.set(k, encodeArray(v));
                else if (isObject(v)) params.set(k, encodeObject(v));
                else params.set(k, encodeValue(v));
            }
        }
        return params.toString();
    }
    function decode(query: string): Filters {
        const params = new URLSearchParams(query);
        const state: Filters = {
            page: 0,
            limit: 0,
            search: "",
            sorts: [],
            filters: {},
        };
        if (
            params.has("page") &&
            utils.positiveSafe(params.get("page"), 0)! > 0
        )
            state.page = Number(params.get("page"));
        if (
            params.has("limit") &&
            utils.positiveSafe(params.get("limit"), 0)! > 0
        )
            state.limit = Number(params.get("limit"));
        if (params.has("search")) state.search = params.get("search") ?? "";
        if (params.has("sorts"))
            state.sorts = decodeSorts(params.get("sorts")?.trim() ?? "");
        for (const [key, value] of params.entries()) {
            if (["page", "limit", "search", "sorts"].includes(key)) continue;
            const filter = decodeValue(key).trim();
            if (filter) {
                if (value.includes(",") && !value.includes(":"))
                    state.filters[filter] = decodeArray(value);
                else if (value.includes(":"))
                    state.filters[filter] = decodeObject(value);
                else state.filters[filter] = inferType(value);
            }
        }
        return state;
    }

    return {
        encode,
        decode,
        encodeArray,
        decodeArray,
        encodeObject,
        decodeObject,
        encodeSorts,
        decodeSorts,
    };
}

/**
 * Utility functions for filtering, sorting, and general safe operations.
 */
function useUtils() {
    function isOrderType(v: unknown): v is OrderType {
        return v === "asc" || v === "desc";
    }
    function isSortType(v: unknown): v is Sort {
        return (
            isObject(v) &&
            "field" in v &&
            isString(v?.field) &&
            "order" in v &&
            isOrderType(v.order)
        );
    }
    function isFilterType(v: unknown): v is FilterType {
        return isObject(v) && Object.values(v).every(isCompoundType);
    }
    function isValidOption<T = any>(key: T, options?: T[] | "all"): boolean {
        return (isArray(options) && options.includes(key)) || options === "all";
    }
    function removeZero<T extends Record<string, unknown>>(
        v?: T
    ): Record<string, unknown> {
        if (isObject(v))
            return Object.fromEntries(
                Object.entries(v).filter(
                    ([_, v]) =>
                        !(
                            v === undefined ||
                            (isArray(v) && !v.length) ||
                            (isObject(v) && !Object.keys(v).length)
                        )
                )
            );
        return {};
    }
    function alter<T>(alt: T, ...values: T[]): T {
        for (const v of values) {
            if (
                v != null &&
                ((isArray(v) && v.length > 0) ||
                    (isObject(v) && Object.keys(v).length > 0) ||
                    !!v)
            )
                return v;
        }
        return alt;
    }
    function safe<T>(
        v: unknown,
        check: (v: unknown) => boolean,
        map: (v: unknown) => T,
        fallback?: T
    ): T | undefined {
        return check(v) ? map(v) : fallback;
    }
    function stringSafe(v: unknown, fallback?: string): string | undefined {
        return safe(
            v,
            (x) => isString(x) && x !== "",
            (x) => x as string,
            fallback
        );
    }
    function stringTrimSafe(v: unknown, fallback?: string): string | undefined {
        return safe(
            v,
            (x) => isString(x) && x.trim() !== "",
            (x) => (x as string).trim(),
            fallback
        );
    }
    function positiveSafe(v: unknown, fallback?: number): number | undefined {
        return safe(
            v,
            (x) => isNumeric(x) && Number(x) > 0,
            (x) => Number(x),
            fallback
        );
    }
    function arraySafe<T>(v: unknown, fallback?: T[]): T[] | undefined {
        return safe(
            v,
            (x) => Array.isArray(x) && x.length > 0,
            (x) => x as T[],
            fallback
        );
    }
    function objectSafe<T>(v: unknown, fallback?: T): T | undefined {
        return safe(
            v,
            (x) => isObject(x),
            (x) => x as T,
            fallback
        );
    }

    return {
        isOrderType,
        isSortType,
        isFilterType,
        isValidOption,
        removeZero,
        alter,
        stringSafe,
        stringTrimSafe,
        positiveSafe,
        arraySafe,
        objectSafe,
    };
}
