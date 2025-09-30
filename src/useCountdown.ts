import { toHMS } from "@termeh-v/utils";
import { computed, ref } from "vue";

/**
 * Vue composable for a countdown timer.
 *
 * @returns An object with reactive time values, computed formatted timer, and timer control methods.
 */
export function useCountdown() {
    const h = ref(0);
    const m = ref(0);
    const s = ref(0);

    let interval: ReturnType<typeof setInterval> | null = null;

    const hours = computed(() => h.value);
    const minutes = computed(() => m.value);
    const seconds = computed(() => s.value);

    /**
     * Formatted timer string in HH:MM:SS or MM:SS format.
     */
    const timer = computed(() => {
        if (h.value <= 0 && m.value <= 0 && s.value <= 0) {
            return "00:00";
        }

        const parts = [
            Math.max(0, m.value).toString().padStart(2, "0"),
            Math.max(0, s.value).toString().padStart(2, "0"),
        ];
        if (h.value > 0) {
            parts.unshift(h.value.toString().padStart(2, "0"));
        }
        return parts.join(":");
    });

    /**
     * Indicates whether the timer is currently running.
     */
    const isTimerRunning = computed(
        () => interval !== null && (h.value > 0 || m.value > 0 || s.value > 0)
    );

    /**
     * Start the countdown timer from a specific duration.
     * @param duration - Duration to count down from
     * @param unit - Unit of the duration, "seconds" or "milliseconds"
     */
    function startTimer(
        duration: number,
        unit: "milliseconds" | "seconds" = "seconds"
    ) {
        duration = Number(duration);
        if (!duration || !Number.isFinite(duration) || duration < 0) return;

        stopTimer();

        const parts = toHMS(duration, unit);
        h.value = parts.hours;
        m.value = parts.minutes;
        s.value = parts.seconds;

        startInterval();
    }

    /**
     * Resume the timer if paused and time remains.
     */
    function resumeTimer() {
        if (h.value > 0 || m.value > 0 || s.value > 0) {
            startInterval();
        }
    }

    /**
     * Pause the timer without resetting.
     */
    function pauseTimer() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    /**
     * Stop the timer and reset all values to zero.
     */
    function stopTimer() {
        pauseTimer();
        h.value = 0;
        m.value = 0;
        s.value = 0;
    }

    /**
     * Internal interval handler for countdown.
     */
    function startInterval() {
        interval = setInterval(() => {
            s.value--;
            if (s.value < 0) {
                s.value = 59;
                m.value--;
                if (m.value < 0) {
                    m.value = 59;
                    h.value--;
                }
            }

            if (h.value <= 0 && m.value <= 0 && s.value <= 0) {
                stopTimer();
            }
        }, 1000);
    }

    return {
        hours,
        minutes,
        seconds,
        timer,
        isTimerRunning,
        startTimer,
        resumeTimer,
        pauseTimer,
        stopTimer,
    };
}
