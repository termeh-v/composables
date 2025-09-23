import {
    Maskito,
    maskitoTransform,
    type MaskitoMask,
    type MaskitoOptions,
    type MaskitoElement,
} from "@maskito/core";
import {
    maskitoNumberOptionsGenerator,
    type MaskitoNumberParams,
} from "@maskito/kit";
import { onMounted, onUnmounted, type TemplateRef } from "vue";

/** Maps custom string tokens to RegExp patterns. */
export type MaskTokenMap = Record<string, RegExp>;

/** A mask definition: string, MaskitoMask array, or function. */
export type MaskDefinition = string | MaskitoMask;

/** Represents a Maskito pattern with optional options and mask. */
export interface MaskOption {
    options?: MaskitoOptions;
    mask?: MaskDefinition;
}

/** Create a MaskOption from a pattern string or MaskitoMask. */
export function patternMask(pattern: MaskDefinition): MaskOption {
    return { mask: pattern };
}

/** Create a numeric MaskOption using MaskitoNumberParams. */
export function numericMask(options: MaskitoNumberParams): MaskOption {
    return { options: maskitoNumberOptionsGenerator(options) };
}

/** Create a custom MaskOption from MaskitoOptions. */
export function customMask(option: MaskitoOptions): MaskOption {
    return { options: option };
}

/** Main composable to handle Maskito masking in Vue. */
export function useMask(
    globalOptions?: MaskitoOptions,
    customTokens?: MaskTokenMap
) {
    const defaultTokens: MaskTokenMap = {
        "#": /[0-9]/,
        A: /[a-z]/i,
        N: /[a-z0-9]/i,
        X: /./,
        ...customTokens,
    };
    const defaultOptions = { ...globalOptions } as MaskitoOptions;

    /** Mask a string with a given MaskOption. */
    function mask(value: string, option: MaskOption): string {
        const resolvedOptions = resolveOptions(
            defaultTokens,
            defaultOptions,
            option
        );
        return maskitoTransform(value, resolvedOptions);
    }

    /** Attach a mask directly to a HTML input element. */
    function attachToInput(input: MaskitoElement, option: MaskOption) {
        const resolvedOptions = resolveOptions(
            defaultTokens,
            defaultOptions,
            option
        );
        const instance = new Maskito(input, resolvedOptions);
        return {
            destroy() {
                instance.destroy();
            },
        };
    }

    /** Vue composable to attach mask to a template ref. */
    function useInputMask(
        inputRef: TemplateRef<MaskitoElement | null>,
        option: MaskOption
    ) {
        let instance: { destroy: () => void } | null = null;

        function attach(opt: MaskOption) {
            if (inputRef.value) instance = attachToInput(inputRef.value, opt);
        }

        /** Update mask/options dynamically. */
        function update(opt?: MaskOption) {
            destroy();
            attach(opt ?? option);
        }

        /** Destroy mask instance and cleanup. */
        function destroy() {
            if (instance) {
                instance.destroy();
                instance = null;
            }
        }

        onMounted(() => attach(option));
        onUnmounted(() => destroy());

        return { update, destroy };
    }

    return { mask, attachToInput, useInputMask };
}

/** Parse a MaskDefinition into a MaskitoMask array or function. */
function parseMask(tokens: MaskTokenMap, mask: MaskDefinition): MaskitoMask {
    if (typeof mask === "function" || mask instanceof RegExp) return mask;

    let mustEscape = false;
    return (Array.isArray(mask) ? mask : `${mask}`.split(""))
        .map((item) => {
            if (item instanceof RegExp) return item;
            if (mustEscape) {
                mustEscape = false;
                return item;
            }
            if (item === "!") {
                mustEscape = true;
                return "";
            }
            return tokens[item] || item;
        })
        .filter(Boolean);
}

/** Resolve MaskitoOptions from global options and a MaskOption. */
function resolveOptions(
    tokens: MaskTokenMap,
    globalOptions: MaskitoOptions,
    option: MaskOption
): MaskitoOptions {
    const mergedOptions = { ...globalOptions, ...(option.options ?? {}) };
    return option.mask
        ? { ...mergedOptions, mask: parseMask(tokens, option.mask) }
        : mergedOptions;
}
