import { onMounted, onUnmounted } from "vue";

/**
 * Registers global keyboard shortcuts and executes a handler when matched.
 * @param shortcut - A string (e.g., "ctrl+s") or an array of shortcut strings.
 * @param handler - Callback executed when the shortcut is pressed.
 * @param options - Optional settings for event handling.
 */
export function useShortcut(
    shortcut: string | string[],
    handler: (e: KeyboardEvent) => void,
    options: { prevent?: boolean; stop?: boolean } = {}
) {
    // Parse shortcuts into modifier keys and main key
    const shortcuts = (Array.isArray(shortcut) ? shortcut : [shortcut])
        .map((s) => s.toLowerCase().split("+"))
        .map((parts) => ({
            ctrl: parts.includes("ctrl"),
            shift: parts.includes("shift"),
            alt: parts.includes("alt"),
            meta: parts.includes("meta"),
            key: parts.find(
                (k) => !["ctrl", "shift", "alt", "meta"].includes(k)
            ),
        }));

    // Event listener to match shortcuts and trigger handler
    const listener = (e: KeyboardEvent) => {
        for (const sc of shortcuts) {
            const isMatch =
                e.ctrlKey === sc.ctrl &&
                e.shiftKey === sc.shift &&
                e.altKey === sc.alt &&
                e.metaKey === sc.meta &&
                e.key.toLowerCase() === (sc.key ?? "").toLowerCase();

            if (isMatch) {
                if (options.prevent) e.preventDefault();
                if (options.stop) e.stopPropagation();
                handler(e);
                break;
            }
        }
    };

    onMounted(() => window.addEventListener("keydown", listener));
    onUnmounted(() => window.removeEventListener("keydown", listener));
}
