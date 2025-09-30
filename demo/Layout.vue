<script setup lang="ts">
import CountdownDemo from "./components/CountdownDemo.vue";
import EmptySlotDemo from "./components/EmptySlotDemo.vue";
import FilterDemo from "./components/FilterDemo.vue";
import InputComposablesDemo from "./components/InputComposablesDemo.vue";
import MaskDemo from "./components/MaskDemo.vue";
import MediaQueriesDemo from "./components/MediaQueriesDemo.vue";
import ShortcutDemo from "./components/ShortcutDemo.vue";
import SignerDemo from "./components/SignerDemo.vue";
import TimerDemo from "./components/TimerDemo.vue";
</script>

<template>
    <div style="padding: 2rem; font-family: sans-serif">
        <h1>Composable Demos</h1>
        <hr />
        <TimerDemo />
        <hr />
        <CountdownDemo />
        <hr />
        <EmptySlotDemo>
            <template #demo>
                <!-- Try changing this slot content to test useEmptySlot -->
                <span>Slot content</span>
            </template>
        </EmptySlotDemo>
        <hr />
        <MediaQueriesDemo />
        <hr />
        <ShortcutDemo />
        <hr />
        <SignerDemo />
        <hr />
        <FilterDemo />
        <hr />
        <MaskDemo />
        <hr />
        <InputComposablesDemo />
    </div>
</template>
