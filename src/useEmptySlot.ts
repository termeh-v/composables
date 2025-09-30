import {
    Comment,
    computed,
    Fragment,
    ref,
    Text,
    useSlots,
    type VNode,
    type VNodeChild,
} from "vue";

/**
 * Composable to determine whether a Vue slot is empty.
 *
 * A slot is considered empty if it contains only Comments, empty Text nodes,
 * or empty Fragments. Provides error tracking in case the slot evaluation fails.
 *
 * @param slot - Optional Vue slot to check.
 * @returns An object with:
 * - `hasError`: computed boolean indicating if an error occurred during evaluation.
 * - `isEmpty`: computed boolean indicating if the slot is empty.
 * - `hasErrorOrEmpty`: computed boolean indicating if an error occurred or slot is empty.
 */
export function useEmptySlot(name: string) {
    const slots = useSlots();
    const error = ref<Error | null>(null);

    /**
     * Recursively checks if a VNode is empty.
     * @param node - The VNode to check.
     * @returns True if the VNode is empty, false otherwise.
     */
    const isVNodeEmpty = (node: VNode): boolean => {
        if (node.type === Comment) return true;

        if (node.type === Text) {
            if (node.children == null) return true;

            if (typeof node.children === "string") {
                return !node.children.trim();
            }

            return false;
        }

        if (node.type === Fragment) {
            const children = node.children as VNodeChild;

            if (children == null) return true;

            if (typeof children === "string") return !children.trim();

            if (Array.isArray(children)) {
                return !children.some((child) => {
                    if (child == null) return false;

                    if (typeof child === "string")
                        return child.trim().length > 0;

                    if (typeof child === "object")
                        return !isVNodeEmpty(child as VNode);

                    return true;
                });
            }

            if (typeof children === "object") {
                return isVNodeEmpty(children as VNode);
            }

            return false;
        }

        return false;
    };

    const hasError = computed(() => !!error.value);

    const isEmpty = computed(() => {
        error.value = null;
        if (!slots[name]) return true;

        try {
            const nodes: VNode[] | undefined = slots[name]?.();
            if (!nodes || !Array.isArray(nodes) || nodes.length === 0)
                return true;
            return !nodes.some((node) => !isVNodeEmpty(node));
        } catch (err) {
            console.warn("Error evaluating slot:", err);
            error.value = err as Error;
            return true;
        }
    });

    const hasErrorOrEmpty = computed(() => hasError.value || isEmpty.value);

    return { hasError, isEmpty, hasErrorOrEmpty };
}
