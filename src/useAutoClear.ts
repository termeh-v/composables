import { onMounted, onUnmounted, type TemplateRef } from "vue";

/**
 * Element type for inputs that can be cleared via Escape key.
 */
type ClearableElement = Pick<
    HTMLInputElement,
    | "addEventListener"
    | "removeEventListener"
    | "selectionStart"
    | "setRangeText"
    | "dispatchEvent"
    | "value"
>;

/**
 * Hook that clears the input value when the Escape key is pressed.
 * Supports clearing only the portion around a separator if provided.
 *
 * @param inputRef Ref to a clearable input element
 * @param separator Optional character to determine selection boundaries
 */
export function useAutoClear(
    inputRef: TemplateRef<ClearableElement | null>,
    separator?: string
) {
    if (!inputRef) return;

    /** Keyboard event handler for clearing input */
    const handler = (ev: KeyboardEvent) => {
        if (ev.code !== "Escape") return;

        const el = inputRef.value;
        if (!el) return;

        let start = 0;
        let end = el.value.length;

        if (separator) {
            const pos = el.selectionStart || 0;

            // Find start boundary
            for (let i = pos - 1; i >= 0; i--) {
                if (el.value[i] === separator) {
                    start = i;
                    break;
                }
            }

            // Find end boundary
            for (let i = pos; i < el.value.length; i++) {
                if (el.value[i] === separator) {
                    end = i;
                    break;
                }
            }
        }

        el.setRangeText("", start, end);
        el.dispatchEvent(
            new Event("input", { bubbles: true, cancelable: true })
        );
    };

    onMounted(() => {
        inputRef.value?.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
        inputRef.value?.removeEventListener("keydown", handler);
    });
}
