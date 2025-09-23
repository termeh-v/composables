<script setup lang="ts">
import { ref } from "vue";
import { useShortcut } from "../../src";

const lastShortcut = ref("");

useShortcut(
    "ctrl+s",
    () => {
        lastShortcut.value = "ctrl+s";
    },
    { prevent: true, stop: true }
);

useShortcut(
    "shift+enter",
    () => {
        lastShortcut.value = "shift+enter";
    },
    {
        prevent: true,
        stop: true,
    }
);

useShortcut(
    "escape",
    () => {
        lastShortcut.value = "escape";
    },
    {
        prevent: true,
        stop: true,
    }
);
</script>

<template>
    <div>
        <h2>useShortcut Demo</h2>
        <p>
            use <strong>Ctrl+S</strong>, <strong>Escape</strong> or
            <strong>Shift+Enter</strong> registered shortcut
        </p>
        <div>
            <p>
                Last shortcut: <b>{{ lastShortcut }}</b>
            </p>
        </div>
    </div>
</template>
