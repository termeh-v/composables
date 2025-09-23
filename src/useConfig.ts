import {
    deepClone,
    mergeConfig,
    type DeepPartial,
    type MergeOptions,
} from "@termeh-v/utils";
import { reactive, toValue } from "vue";

/**
 * Composable for managing a reactive configuration object with path-based updates.
 *
 * @template T - Type of the configuration object
 * @param defaultConfig The base configuration object, cloned internally
 * @returns An object with:
 *  - `config`: Reactive configuration object
 *  - `set`: Function to merge a partial configuration
 */
export function useConfig<T extends Record<string, any>>(defaultConfig: T) {
    const config = reactive(deepClone(defaultConfig));

    /**
     * Merge a new partial configuration into the reactive config.
     *
     * @param newConfig Partial configuration object
     * @param options Optional map of paths to merge strategies
     */
    function set(newConfig: DeepPartial<T>, options?: MergeOptions) {
        const mergedResult = mergeConfig(toValue(config), newConfig, options);
        Object.assign(config, mergedResult);
    }

    return { config, set };
}
