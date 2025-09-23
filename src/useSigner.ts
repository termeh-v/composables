/**
 * Composable for generating and validating checksums for objects.
 * Useful to detect changes in state regardless of key order.
 */
export function useSigner() {
    /**
     * Checks if a value is an array.
     * @param v - Value to check.
     * @returns True if the value is an array.
     */
    function isArray<T>(v: unknown): v is T[] {
        return Array.isArray(v);
    }

    /**
     * Checks if a value is a plain object (not null or array).
     * @param v - Value to check.
     * @returns True if the value is a plain object.
     */
    function isObject(v: unknown): v is Record<string, unknown> {
        return v != null && typeof v === "object" && !Array.isArray(v);
    }

    /**
     * Encodes a value into a string representation.
     * @param v - Value to encode.
     * @returns Encoded string ("[null]", "[undefined]", or String value).
     */
    function encodeValue(v: unknown): string {
        if (v === null) return "[null]";
        if (v === undefined) return "[undefined]";
        return String(v);
    }

    /**
     * Flattens an object or array into an array of "key:value" strings.
     * @param obj - Object to flatten.
     * @param prefix - Key prefix for nested values.
     * @returns Array of flattened key:value strings.
     */
    function flatten(obj: unknown, prefix: string = ""): string[] {
        if (!isObject(obj) && !isArray(obj)) {
            return [`${prefix || "value"}:${encodeValue(obj)}`];
        }

        let result: string[] = [];

        for (const [k, v] of Object.entries(obj)) {
            const key = prefix ? `${prefix}.${k}` : k;

            if (isObject(v)) {
                result = result.concat(flatten(v, key));
            } else if (isArray(v)) {
                for (const el of v) {
                    result = result.concat(flatten(el, key));
                }
            } else {
                result.push(`${key}:${encodeValue(v)}`);
            }
        }

        return result.sort();
    }

    /**
     * Generates a SHA-256 checksum for an object.
     * @param data - Object to sign.
     * @returns Hexadecimal checksum string.
     */
    async function sign(data: unknown): Promise<string> {
        const flatted = flatten(data).join("|");
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(flatted);
        const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }

    /**
     * Validates if an object's checksum matches a given signature.
     * @param data - Object to validate.
     * @param signature - Signature to compare.
     * @returns True if the signature matches.
     */
    async function validate(
        data: unknown,
        signature: string
    ): Promise<boolean> {
        return (await sign(data)) === signature;
    }

    return { sign, validate };
}
