import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    toValue,
    type TemplateRef,
} from "vue";

/**
 * Defines the types of observers that can be used to trigger scroll state updates.
 * - 'scroll': Native scroll event listener on the container (triggered by user scroll).
 * - 'resize': ResizeObserver (triggered by container size changes).
 * - 'mutation': MutationObserver (triggered by content/DOM structure changes).
 */
type ScrollObserver = "scroll" | "resize" | "mutation";

/**
 * Type for the scrollable HTML element reference.
 */
type ScrollableElement = HTMLElement | null | undefined;

/**
 * Options for the useScroll composable.
 */
interface ScrollStateOptions {
    /**
     * The pixel distance from the edge considered "arrived".
     * @default 0
     */
    threshold?: number;
    /**
     * An array of observers to activate. By default, all are active.
     */
    observers?: ScrollObserver[];
}

/**
 * A composable to track the scroll status of a DOM element in all four directions (Top, Bottom, Left, Right).
 * It uses native events and observers (Resize/Mutation) for robustness and accurate state tracking.
 *
 * @param container - A TemplateRef or Ref to the scrollable HTML element.
 * @param options - Configuration options for the scroll state and observers.
 * @returns An object containing comprehensive reactive scroll state properties.
 */
export function useScroll(
    container: TemplateRef<ScrollableElement>,
    options: ScrollStateOptions = {}
) {
    // Fallback logic for options
    const threshold = options?.threshold || 0;
    const observers = options?.observers || ["scroll", "resize", "mutation"];

    // Internal raw state variables for scroll position
    const atTop = ref(true);
    const atBottom = ref(true);
    const atLeft = ref(true);
    const atRight = ref(true);

    // Raw state variables for scroll coordinates
    const scrollX = ref(0);
    const scrollY = ref(0);

    // Internal raw state variables for scrollability
    const scrollableX = ref(false);
    const scrollableY = ref(false);

    // Observer references
    const resizeObserver = ref<ResizeObserver | null>(null);
    const mutationObserver = ref<MutationObserver | null>(null);

    /**
     * Recalculates all scroll and scrollability states based on the container's current DOM properties
     * (scrollTop, scrollHeight, etc.).
     */
    function measure() {
        const el = toValue(container);
        if (!el) return;

        const {
            scrollTop,
            scrollHeight,
            clientHeight,
            scrollLeft,
            scrollWidth,
            clientWidth,
        } = el;

        // Update Scroll Coordinates
        scrollY.value = scrollTop;
        scrollX.value = scrollLeft;

        // Vertical (Y-axis) calculations
        scrollableY.value = scrollHeight > clientHeight;
        atTop.value = scrollTop <= threshold;
        atBottom.value = scrollTop + clientHeight >= scrollHeight - threshold;

        // Horizontal (X-axis) calculations
        scrollableX.value = scrollWidth > clientWidth;
        atLeft.value = scrollLeft <= threshold;
        atRight.value = scrollLeft + clientWidth >= scrollWidth - threshold;
    }

    onMounted(() => {
        const el = toValue(container);
        if (!el) return;

        // 1. Setup Scroll Listener
        if (observers.includes("scroll")) {
            el.addEventListener("scroll", measure);
        }

        // 2. Setup ResizeObserver (tracks element size changes)
        if (observers.includes("resize")) {
            resizeObserver.value = new ResizeObserver(measure);
            resizeObserver.value.observe(el);
        }

        // 3. Setup MutationObserver (tracks content/structure changes that affect scroll size)
        if (observers.includes("mutation")) {
            mutationObserver.value = new MutationObserver(measure);
            mutationObserver.value.observe(el, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }

        // Initial measurement after the DOM is ready to ensure correct initial state
        nextTick(() => measure());
    });

    onUnmounted(() => {
        const el = toValue(container);
        if (!el) return;

        // 1. Cleanup Scroll Listener
        if (observers.includes("scroll")) {
            el.removeEventListener("scroll", measure);
        }

        // 2. Cleanup ResizeObserver
        if (observers.includes("resize") && resizeObserver.value) {
            resizeObserver.value.disconnect();
            resizeObserver.value = null;
        }

        // 3. Cleanup MutationObserver
        if (observers.includes("mutation") && mutationObserver.value) {
            mutationObserver.value.disconnect();
            mutationObserver.value = null;
        }
    });

    return {
        /** Manually triggers a recalculation of the scroll state. */
        measure,

        // --- Scroll Coordinates ---
        /** Reactive number indicating the current horizontal scroll offset (scrollLeft). */
        x: computed(() => scrollX.value),
        /** Reactive number indicating the current vertical scroll offset (scrollTop). */
        y: computed(() => scrollY.value),

        // --- Scrollability ---
        /** Reactive boolean indicating if the content is vertically scrollable. */
        isScrollableY: computed(() => scrollableY.value),
        /** Reactive boolean indicating if the content is horizontally scrollable. */
        isScrollableX: computed(() => scrollableX.value),

        // --- Has Scroll Status (Content Exists) ---
        /** Reactive boolean indicating if the scroll is not at the top AND is scrollable (i.e., content exists above). */
        hasScrollTop: computed(() => scrollableY.value && !atTop.value),
        /** Reactive boolean indicating if the scroll is not at the bottom AND is scrollable (i.e., content exists below). */
        hasScrollBottom: computed(() => scrollableY.value && !atBottom.value),

        // --- Arrived Status (Primary Check) ---
        /** Reactive boolean indicating if the scroll is at or near the top (within threshold). True if not scrollable. */
        isAtTop: computed(() => (scrollableY.value ? atTop.value : true)),
        /** Reactive boolean indicating if the scroll is at or near the bottom (within threshold). True if not scrollable. */
        isAtBottom: computed(() => (scrollableY.value ? atBottom.value : true)),

        // --- Has Scroll Status (Content Exists) ---
        /** Reactive boolean indicating if the scroll is not at the left edge AND is scrollable (i.e., content exists to the left). */
        hasScrollLeft: computed(() => scrollableX.value && !atLeft.value),
        /** Reactive boolean indicating if the scroll is not at the right edge AND is scrollable (i.e., content exists to the right). */
        hasScrollRight: computed(() => scrollableX.value && !atRight.value),

        // --- Arrived Status (Primary Check) ---
        /** Reactive boolean indicating if the scroll is at or near the left edge (within threshold). True if not scrollable. */
        isAtLeft: computed(() => (scrollableX.value ? atLeft.value : true)),
        /** Reactive boolean indicating if the scroll is at or near the right edge (within threshold). True if not scrollable. */
        isAtRight: computed(() => (scrollableX.value ? atRight.value : true)),
    };
}
