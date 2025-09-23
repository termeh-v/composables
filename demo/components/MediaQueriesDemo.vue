<script setup lang="ts">
import { useMediaQueries } from "../../src";
const mq = useMediaQueries();
</script>

<template>
    <div>
        <h2>useMediaQueries Demo</h2>
        <ul>
            <li>
                isMobile: <b>{{ mq.isMobile }}</b>
            </li>
            <li>
                isTablet: <b>{{ mq.isTablet }}</b>
            </li>
            <li>
                isTabletOnly: <b>{{ mq.isTabletOnly }}</b>
            </li>
            <li>
                isDesktop: <b>{{ mq.isDesktop }}</b>
            </li>
            <li>
                isDesktopOnly: <b>{{ mq.isDesktopOnly }}</b>
            </li>
            <li>
                isWidescreen: <b>{{ mq.isWidescreen }}</b>
            </li>
            <li>
                isWidescreenOnly: <b>{{ mq.isWidescreenOnly }}</b>
            </li>
            <li>
                isFullhd: <b>{{ mq.isFullhd }}</b>
            </li>
            <li>
                isRetina: <b>{{ mq.isRetina }}</b>
            </li>
            <li>
                isPortrait: <b>{{ mq.isPortrait }}</b>
            </li>
            <li>
                isLandscape: <b>{{ mq.isLandscape }}</b>
            </li>
            <li>
                isTouch: <b>{{ mq.isTouch }}</b>
            </li>
            <li>
                isNoneTouch: <b>{{ mq.isNoneTouch }}</b>
            </li>
            <li>
                hasFinePointer: <b>{{ mq.hasFinePointer }}</b>
            </li>
            <li>
                hasCoarsePointer: <b>{{ mq.hasCoarsePointer }}</b>
            </li>
            <li>
                prefersHDR: <b>{{ mq.prefersHDR }}</b>
            </li>
            <li>
                prefersDark: <b>{{ mq.prefersDark }}</b>
            </li>
            <li>
                prefersLight: <b>{{ mq.prefersLight }}</b>
            </li>
            <li>
                prefersReducedMotion: <b>{{ mq.prefersReducedMotion }}</b>
            </li>
            <li>
                prefersMoreContrast: <b>{{ mq.prefersMoreContrast }}</b>
            </li>
            <li>
                prefersLessContrast: <b>{{ mq.prefersLessContrast }}</b>
            </li>
            <li>
                isPrint: <b>{{ mq.isPrint }}</b>
            </li>
            <li>
                isNotPrint: <b>{{ mq.isNotPrint }}</b>
            </li>
        </ul>
    </div>
</template>
