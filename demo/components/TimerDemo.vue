<script setup lang="ts">
import { useTimer } from "../../src";
const { timer, startTimer, stopTimer } = useTimer();
function start() {
    startTimer(65, "seconds");
}
function stop() {
    stopTimer();
}
</script>

<template>
    <div>
        <h2>useTimer Demo</h2>
        <div>Timer: {{ timer }}</div>
        <div>
            <button @click="start">Start 1:05</button>
            <button @click="stop">Stop</button>
        </div>
    </div>
</template>
