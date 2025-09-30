<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import { numericMask, patternMask, useMask } from "../../src";

// Raw mask example
const maskPattern = ref("(###) ###-####");
const input = ref("");
const masked = ref("");
const inputRef = useTemplateRef<any>("test");
const numRef = useTemplateRef<any>("test2");

const { mask, useInputMask } = useMask();
const { update } = useInputMask(inputRef, patternMask(maskPattern.value));
useInputMask(numRef, numericMask({ thousandSeparator: " " }));

// Update masked value for raw mask example
watch(maskPattern, () => {
    update(patternMask(maskPattern.value));
});
watch(
    [input, maskPattern],
    () => {
        masked.value = mask(input.value, patternMask(maskPattern.value));
    },
    { immediate: true }
);
</script>

<template>
    <div>
        <h2>useMask Demo</h2>
        <div style="margin-bottom: 1em">
            <label>
                Mask pattern:
                <input v-model="maskPattern" placeholder="Mask pattern" />
            </label>
        </div>
        <div style="margin-bottom: 1em">
            <b>Raw mask usage:</b>
            <label>
                Input:
                <input v-model="input" placeholder="Type to mask..." />
            </label>
            <div><b>Masked:</b> {{ masked }}</div>
        </div>
        <div style="margin-bottom: 1em">
            <b>Input mask usage:</b>
            <input ref="test" placeholder="Type here for input mask..." />
        </div>
        <div style="margin-bottom: 1em">
            <b>Input number usage:</b>
            <input ref="test2" placeholder="Type here for input mask..." />
        </div>
        <small
            >Try changing the mask pattern and typing in the inputs. All changes
            are reactive.</small
        >
    </div>
</template>
