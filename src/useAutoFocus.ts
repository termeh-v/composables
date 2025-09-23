import { onMounted, type TemplateRef } from "vue";

/**
 * Element type that supports focus.
 */
type FocusableElement = Pick<HTMLElement, "focus">;

/**
 * Hook that automatically focuses the given element when the component mounts.
 *
 * @param inputRef Ref to a focusable element (input, textarea, etc.)
 */
export function useAutoFocus(inputRef: TemplateRef<FocusableElement | null>) {
    onMounted(() => {
        inputRef.value?.focus();
    });
}
