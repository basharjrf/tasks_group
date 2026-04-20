const clockElement = document.getElementById("clock");
const alarmForm = document.getElementById("alarm-form");
const alarmInput = document.getElementById("alarm-time");
const alarmStatus = document.getElementById("alarm-status");
const clearAlarmButton = document.getElementById("clear-alarm");
const snoozeButton = document.getElementById("snooze-btn");
const dismissButton = document.getElementById("dismiss-btn");
const ringingActions = document.getElementById("ringing-actions");

const alarmSound = new Audio(
    "data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTtvAAAAAICAgP///4CAgAD///+AgIAA////gICAAP///4CAgAD///+AgIAA////gICAAP///4CAgAD///+AgIAA////gICAAP///4CAgAD///+AgIAA////gICAAP///4CAgAD///+AgIAA////gICAAP///4CAgAD///+AgIAA"
);
alarmSound.loop = true;

const state = {
    alarmTime: "",
    snoozeTime: "",
    ringing: false,
    lastTriggerKey: ""
};

function unlockAudio() {
    alarmSound
        .play()
        .then(() => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        })
        .catch(() => {
            // Ignore until the browser allows audio playback.
        });

    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function formatClock(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatAlarmTime(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function updateStatus(message) {
    alarmStatus.textContent = message;
}

function stopAlarm() {
    state.ringing = false;
    alarmSound.pause();
    alarmSound.currentTime = 0;
    ringingActions.classList.add("hidden");
}

function startAlarm(triggerTime) {
    state.ringing = true;
    state.lastTriggerKey = triggerTime;
    ringingActions.classList.remove("hidden");
    updateStatus(`Alarm ringing for ${formatAlarmTime(new Date())}.`);

    alarmSound.currentTime = 0;
    alarmSound.play().catch(() => {
        updateStatus("Alarm matched, but the browser blocked autoplay. Click anywhere, then try again.");
    });
}

function clearAlarm() {
    state.alarmTime = "";
    state.snoozeTime = "";
    alarmInput.value = "";
    stopAlarm();
    updateStatus("No alarm set.");
}

function checkAlarm(date) {
    if (state.ringing) {
        return;
    }

    const currentTime = formatAlarmTime(date);
    const triggerKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${currentTime}`;
    const alarmMatches = state.alarmTime && state.alarmTime === currentTime;
    const snoozeMatches = state.snoozeTime && state.snoozeTime === currentTime;

    if ((alarmMatches || snoozeMatches) && state.lastTriggerKey !== triggerKey) {
        if (snoozeMatches) {
            state.snoozeTime = "";
        }

        startAlarm(triggerKey);
    }
}

function updateClock() {
    const now = new Date();
    clockElement.textContent = formatClock(now);
    checkAlarm(now);
}

alarmForm.addEventListener("submit", (event) => {
    event.preventDefault();

    state.alarmTime = alarmInput.value;
    state.snoozeTime = "";
    state.lastTriggerKey = "";
    stopAlarm();

    updateStatus(state.alarmTime ? `Alarm set for ${state.alarmTime}.` : "No alarm set.");
});

clearAlarmButton.addEventListener("click", clearAlarm);

dismissButton.addEventListener("click", () => {
    stopAlarm();
    updateStatus(state.alarmTime ? `Alarm dismissed. Next alarm remains at ${state.alarmTime}.` : "Alarm dismissed.");
});

snoozeButton.addEventListener("click", () => {
    const snoozeDate = new Date(Date.now() + 2 * 60 * 1000);
    state.snoozeTime = formatAlarmTime(snoozeDate);
    stopAlarm();
    updateStatus(`Snoozed until ${state.snoozeTime}.`);
});

updateClock();
setInterval(updateClock, 1000);
document.addEventListener("click", unlockAudio);
document.addEventListener("keydown", unlockAudio);
