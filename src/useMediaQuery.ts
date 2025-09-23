import { useMediaQuery } from "@vueuse/core";

/**
 * A Vue composable for detecting various media query states.
 * Uses `@vueuse/core` to provide reactive boolean refs for screen-based breakpoints, orientation, resolution, device capabilities, user preferences, and print media.
 * @returns An object containing reactive boolean refs for each media query condition.
 */
export function useMediaQueries() {
    // Breakpoints
    /** @description Detects if the viewport width is 1407px or less on screen devices. */
    const isUntilFullhd = useMediaQuery("screen and (max-width: 1407px)");
    /** @description Detects if the viewport width is 1215px or less on screen devices. */
    const isUntilWidescreen = useMediaQuery("screen and (max-width: 1215px)");
    /** @description Detects if the viewport width is 1023px or less on screen devices. */
    const isUntilDesktop = useMediaQuery("screen and (max-width: 1023px)");
    /** @description Detects if the viewport width is 769px or more (tablet and above) on screen devices. */
    const isTablet = useMediaQuery("screen and (min-width: 769px)");
    /** @description Detects if the viewport width is 1024px or more (desktop and above) on screen devices. */
    const isDesktop = useMediaQuery("screen and (min-width: 1024px)");
    /** @description Detects if the viewport width is 1216px or more (widescreen and above) on screen devices. */
    const isWidescreen = useMediaQuery("screen and (min-width: 1216px)");
    /** @description Detects if the viewport width is 1408px or more (full HD) on screen devices. */
    const isFullhd = useMediaQuery("screen and (min-width: 1408px)");
    /** @description Detects if the viewport width is 768px or less (mobile) on screen devices. */
    const isMobile = useMediaQuery("screen and (max-width: 768px)");
    /** @description Detects if the viewport width is between 769px and 1023px (tablet only) on screen devices. */
    const isTabletOnly = useMediaQuery(
        "screen and (min-width: 769px) and (max-width: 1023px)"
    );
    /** @description Detects if the viewport width is between 1024px and 1215px (desktop only) on screen devices. */
    const isDesktopOnly = useMediaQuery(
        "screen and (min-width: 1024px) and (max-width: 1215px)"
    );
    /** @description Detects if the viewport width is between 1216px and 1407px (widescreen only) on screen devices. */
    const isWidescreenOnly = useMediaQuery(
        "screen and (min-width: 1216px) and (max-width: 1407px)"
    );

    // Orientation & Resolution
    /** @description Detects if the device has a high-resolution display (2x or higher pixel density) on screen devices. */
    const isRetina = useMediaQuery("screen and (resolution >= 2dppx)");
    /** @description Detects if the device is in portrait orientation on screen devices. */
    const isPortrait = useMediaQuery("screen and (orientation: portrait)");
    /** @description Detects if the device is in landscape orientation on screen devices. */
    const isLandscape = useMediaQuery("screen and (orientation: landscape)");

    // Device capabilities
    /** @description Detects if the device supports touch input (e.g., no hover capability) on screen devices. */
    const isTouch = useMediaQuery("screen and (hover: none)");
    /** @description Detects if the device supports hover input (e.g., mouse or stylus) on screen devices. */
    const isNoneTouch = useMediaQuery("screen and (hover: hover)");
    /** @description Detects if the device has a fine pointer (e.g., mouse or stylus) on screen devices. */
    const hasFinePointer = useMediaQuery("screen and (pointer: fine)");
    /** @description Detects if the device has a coarse pointer (e.g., finger on touchscreen) on screen devices. */
    const hasCoarsePointer = useMediaQuery("screen and (pointer: coarse)");

    // User preferences
    /** @description Detects if the device supports high dynamic range (HDR). */
    const prefersHDR = useMediaQuery("(dynamic-range: high)");
    /** @description Detects if the user prefers a dark color scheme on screen devices. */
    const prefersDark = useMediaQuery(
        "screen and (prefers-color-scheme: dark)"
    );
    /** @description Detects if the user prefers a light color scheme on screen devices. */
    const prefersLight = useMediaQuery(
        "screen and (prefers-color-scheme: light)"
    );
    /** @description Detects if the user prefers reduced motion (e.g., for accessibility) on screen devices. */
    const prefersReducedMotion = useMediaQuery(
        "screen and (prefers-reduced-motion: reduce)"
    );
    /** @description Detects if the user prefers higher contrast (e.g., for accessibility) on screen devices. */
    const prefersMoreContrast = useMediaQuery(
        "screen and (prefers-contrast: more)"
    );
    /** @description Detects if the user prefers lower contrast (e.g., for accessibility) on screen devices. */
    const prefersLessContrast = useMediaQuery(
        "screen and (prefers-contrast: less)"
    );

    // Print
    /** @description Detects if the content is being viewed in print mode. */
    const isPrint = useMediaQuery("print");
    /** @description Detects if the content is not being viewed in print mode (e.g., screen or other media). */
    const isNotPrint = useMediaQuery("not print");

    return {
        // Breakpoints
        isUntilFullhd,
        isUntilWidescreen,
        isUntilDesktop,
        isTablet,
        isDesktop,
        isWidescreen,
        isFullhd,
        isMobile,
        isTabletOnly,
        isDesktopOnly,
        isWidescreenOnly,

        // Orientation & Resolution
        isRetina,
        isPortrait,
        isLandscape,

        // Device capabilities
        isTouch,
        isNoneTouch,
        hasFinePointer,
        hasCoarsePointer,

        // User preferences
        prefersHDR,
        prefersDark,
        prefersLight,
        prefersReducedMotion,
        prefersMoreContrast,
        prefersLessContrast,

        // Print
        isPrint,
        isNotPrint,
    };
}
