<script setup lang="ts">
import { ref } from "vue";
import { useAutoClear, useAutoFocus, useAutoSelect } from "../../src";

const focusRef = ref(null);
const selectRef = ref(null);
const clearRef = ref(null);
const selectSepRef = ref(null);
const clearSepRef = ref(null);

useAutoFocus(focusRef);
useAutoSelect(selectRef);
useAutoClear(clearRef);

// With separator (e.g. ",")
useAutoSelect(selectSepRef, ",");
useAutoClear(clearSepRef, ",");
</script>

<template>
    <div>
        <h2>Input Composables Demo</h2>
        <div style="margin-bottom: 1em">
            <label>
                useAutoFocus:
                <input ref="focusRef" placeholder="Auto focus on mount" />
            </label>
        </div>
        <div style="margin-bottom: 1em">
            <label>
                useAutoSelect:
                <input ref="selectRef" value="Click to select all" />
            </label>
        </div>
        <div style="margin-bottom: 1em">
            <label>
                useAutoClear:
                <input ref="clearRef" value="Press Escape to clear" />
            </label>
        </div>
        <div style="margin-bottom: 1em">
            <label>
                useAutoSelect (separator=","):
                <input ref="selectSepRef" value="foo,bar,baz" />
                <small>Click to select part around comma</small>
            </label>
        </div>
        <div style="margin-bottom: 1em">
            <label>
                useAutoClear (separator=","):
                <input ref="clearSepRef" value="foo,bar,baz" />
                <small>Press Escape to clear part around comma</small>
            </label>
        </div>
    </div>
</template>
