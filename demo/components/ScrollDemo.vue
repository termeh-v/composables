<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useScroll } from "../../src";

const elSize = ref(100);
const container = useTemplateRef("container");
const { x, y, hasScrollTop, hasScrollBottom, hasScrollLeft, hasScrollRight } =
    useScroll(container);
</script>

<template>
    <div>
        <h2>useScroll Demo</h2>
        <div>Scroll X: {{ x }}</div>
        <div>Scroll Y: {{ y }}</div>
        <div>Scroll Top: {{ hasScrollTop }}</div>
        <div>Scroll Bottom: {{ hasScrollBottom }}</div>
        <div>Scroll Left: {{ hasScrollLeft }}</div>
        <div>Scroll Right: {{ hasScrollRight }}</div>
        <button @click="() => (elSize = elSize == 100 ? 1000 : 100)">
            Resize Child
        </button>
        <div ref="container" class="my-container">
            <div
                class="my-element"
                :style="{ height: `${elSize}px`, width: `${elSize}px` }"
            ></div>
        </div>
    </div>
</template>

<style scoped>
.my-container {
    display: block;
    width: 400px;
    height: 400px;
    padding: 100px;
    border-radius: 2px;
    background-color: #dde;
    box-sizing: border-box;
    overflow: auto;
}

.my-element {
    display: block;
    border-radius: 2px;
    background-color: #35f;
}
</style>
