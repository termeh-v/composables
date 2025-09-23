import {
    computed,
    ref,
    Comment,
    Text,
    Fragment,
    type Slot,
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
 * - `isEmpty`: computed boolean indicating if the slot is empty.
 * - `hasError`: computed boolean indicating if an error occurred during evaluation.
 */
export function useEmptySlot(slot?: Slot) {
    const error = ref<Error | null>(null);

    /**
     * Recursively checks if a VNode is empty.
     * @param node - The VNode to check.
     * @returns True if the VNode is empty, false otherwise.
     */
    const isVNodeEmpty = (node: VNode): boolean => {
        if (node.type === Comment) return true;

        if (node.type === Text) {
            return node.children == null || !String(node.children).trim();
        }

        if (node.type === Fragment) {
            const children = node.children as VNodeChild;
            if (!children) return true;

            if (Array.isArray(children)) {
                return !children.some((child) => {
                    if (typeof child === "string" || child == null) {
                        return !!String(child).trim();
                    }
                    return !isVNodeEmpty(child as VNode);
                });
            }

            if (typeof children === "string") {
                return !children.trim();
            }
            if (children && typeof children === "object") {
                return isVNodeEmpty(children as VNode);
            }
            return true;
        }

        return false;
    };

    const isEmpty = computed(() => {
        error.value = null;
        if (!slot) return true;

        try {
            const nodes: VNode[] | undefined = slot();
            if (!nodes || !Array.isArray(nodes) || nodes.length === 0)
                return true;
            return !nodes.some((node) => !isVNodeEmpty(node));
        } catch (err) {
            console.warn("Error evaluating slot:", err);
            error.value = err as Error;
            return true;
        }
    });

    const hasError = computed(() => !!error.value);

    return { isEmpty, hasError };
}
