import { onMounted, onUnmounted, type TemplateRef } from "vue";

/**
 * Element type that supports text selection.
 */
type SelectableElement = Pick<
    HTMLInputElement,
    | "addEventListener"
    | "removeEventListener"
    | "selectionStart"
    | "setSelectionRange"
    | "value"
>;

/**
 * Hook that auto-selects the input value when clicked.
 * Optionally restricts selection boundaries using a separator.
 *
 * @param inputRef Ref to an input or textarea element
 * @param separator Optional string to determine selection boundaries
 */
export function useAutoSelect(
    inputRef: TemplateRef<SelectableElement | null>,
    separator?: string
) {
    if (!inputRef) return;

    const handler = () => {
        const el = inputRef.value;
        if (!el) return;

        let start = 0;
        let end = el.value.length;

        if (separator) {
            const pos = el.selectionStart || 0;

            for (let i = pos - 1; i >= 0; i--) {
                if (el.value[i] === separator) {
                    start = i + 1;
                    break;
                }
            }

            for (let i = pos; i < el.value.length; i++) {
                if (el.value[i] === separator) {
                    end = i;
                    break;
                }
            }
        }

        el.setSelectionRange(start, end, "forward");
    };

    onMounted(() => {
        inputRef.value?.addEventListener("click", handler);
    });

    onUnmounted(() => {
        inputRef.value?.removeEventListener("click", handler);
    });
}
