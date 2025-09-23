import { ref, computed } from "vue";

/**
 * Countdown timer composable.
 * Works based on absolute timestamps, so it stays accurate even if the tab is inactive.
 */
export function useTimer() {
    /** Hours remaining */
    const hours = ref(0);
    /** Minutes remaining */
    const minutes = ref(0);
    /** Seconds remaining */
    const seconds = ref(0);

    let interval: ReturnType<typeof setInterval> | null = null;
    let endTime: number | null = null; // timestamp in milliseconds

    /**
     * Formatted timer string in "HH:MM:SS" or "MM:SS" if hours are zero.
     * Returns "00:00" when the timer reaches zero.
     */
    const timer = computed(() => {
        if (hours.value <= 0 && minutes.value <= 0 && seconds.value <= 0) {
            return "00:00";
        }

        const parts = [
            Math.max(0, minutes.value).toString().padStart(2, "0"),
            Math.max(0, seconds.value).toString().padStart(2, "0"),
        ];

        if (hours.value > 0) {
            parts.unshift(hours.value.toString().padStart(2, "0"));
        }

        return parts.join(":");
    });

    /** Indicates whether the timer is actively running */
    const isTimerRunning = computed(
        () => endTime !== null && Date.now() < endTime
    );

    /**
     * Starts the countdown timer.
     * @param duration - Duration of the timer (non-negative number)
     * @param unit - Unit of the duration ("seconds" or "milliseconds"), defaults to "seconds"
     */
    function startTimer(
        duration: number,
        unit: "milliseconds" | "seconds" = "seconds"
    ) {
        duration = Number(duration);
        if (!duration || !Number.isFinite(duration) || duration < 0) return;

        stopTimer();

        const durationMs = unit === "seconds" ? duration * 1000 : duration;
        endTime = Date.now() + durationMs;

        updateRemaining();
        startInterval();
    }

    /**
     * Stops the timer and resets hours, minutes, and seconds to zero.
     */
    function stopTimer() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        endTime = null;
        hours.value = 0;
        minutes.value = 0;
        seconds.value = 0;
    }

    /** Starts the internal interval for updating the timer every second */
    function startInterval() {
        if (interval) return;
        interval = setInterval(updateRemaining, 1000);
    }

    /** Updates remaining time based on the end timestamp */
    function updateRemaining() {
        if (!endTime) return;

        const now = Date.now();
        const diff = Math.max(0, Math.floor((endTime - now) / 1000));

        if (diff <= 0) {
            stopTimer();
            return;
        }

        hours.value = Math.floor(diff / 3600);
        minutes.value = Math.floor((diff % 3600) / 60);
        seconds.value = diff % 60;
    }

    return {
        hours,
        minutes,
        seconds,
        timer,
        isTimerRunning,
        startTimer,
        stopTimer,
    };
}
