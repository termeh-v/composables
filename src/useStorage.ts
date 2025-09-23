/**
 * Creates a namespaced storage utility.
 *
 * Provides safe access to a Storage object (localStorage, sessionStorage, or custom).
 *
 * @param storage - A Storage-like object (localStorage, sessionStorage, or custom object).
 * @param prefix - Optional prefix for all keys (trimmed). Empty prefix is allowed.
 * @returns Methods to read, write, and remove items safely.
 */
export function useStorage(storage: Storage, prefix?: string) {
    prefix = (prefix || "").trim();

    /**
     * Normalizes key parts by trimming, replacing spaces with '::', and collapsing duplicates.
     * @param keys - One or more key segments.
     * @returns Normalized key string, or empty string if invalid.
     */
    function normalize(...keys: string[]): string {
        const result: string[] = [];
        for (let key of keys) {
            key = (key || "").trim().replace(/\s+/g, "::");
            if (key) result.push(key);
        }
        return result.join("::").replace(/(::)+/g, "::");
    }

    /**
     * Checks if the storage object is available and usable.
     * @returns True if storage exists and has required methods.
     */
    function isValid(): boolean {
        try {
            return (
                !!storage &&
                typeof storage.getItem === "function" &&
                typeof storage.setItem === "function" &&
                typeof storage.removeItem === "function"
            );
        } catch {
            return false;
        }
    }

    /**
     * Reads a string value by key.
     * @param key - Key to read.
     * @returns Trimmed string value or undefined if missing/invalid.
     */
    function string(key: string): string | undefined {
        key = normalize(key);
        if (!isValid() || !key) return undefined;

        try {
            const value = storage.getItem(normalize(prefix!, key));
            return value?.trim() || undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Reads a numeric value by key.
     * @param key - Key to read.
     * @returns Parsed number or undefined if invalid/unavailable.
     */
    function number(key: string): number | undefined {
        const value = Number(string(key));
        return isFinite(value) ? value : undefined;
    }

    /**
     * Reads a boolean value by key.
     * Accepts "true" or "1" as true, "false" or "0" as false.
     * @param key - Key to read.
     * @returns Boolean or undefined if invalid/unavailable.
     */
    function boolean(key: string): boolean | undefined {
        const value = string(key);
        if (value === "true" || value === "1") return true;
        if (value === "false" || value === "0") return false;
        return undefined;
    }

    /**
     * Stores a string value under a key.
     * Empty, null, or undefined values are ignored.
     * @param key - Key to store.
     * @param value - Value to store.
     * @returns True if stored successfully, false otherwise.
     */
    function set(key: string, value?: string): boolean {
        key = normalize(key);
        value = (value || "").trim();
        if (!isValid() || !key || !value) return false;

        try {
            storage.setItem(normalize(prefix!, key), value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Removes a key/value pair.
     * @param key - Key to remove.
     * @returns True if removed successfully, false otherwise.
     */
    function remove(key: string): boolean {
        key = normalize(key);
        if (!isValid() || !key) return false;

        try {
            storage.removeItem(normalize(prefix!, key));
            return true;
        } catch {
            return false;
        }
    }

    return { isValid, string, number, boolean, set, remove };
}
