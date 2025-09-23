<script setup lang="ts">
import { useCountdown } from "../../src";

const { timer, startTimer, pauseTimer, resumeTimer, stopTimer } =
    useCountdown();
function start() {
    startTimer(65, "seconds");
}
function pause() {
    pauseTimer();
}
function resume() {
    resumeTimer();
}
function stop() {
    stopTimer();
}
</script>

<template>
    <div>
        <h2>useCountdown Demo</h2>
        <div>Countdown: {{ timer }}</div>
        <div>
            <button @click="start">Start 1:05</button>
            <button @click="pause">Pause</button>
            <button @click="resume">Resume</button>
            <button @click="stop">Stop</button>
        </div>
    </div>
</template>
