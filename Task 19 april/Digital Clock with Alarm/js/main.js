import { animate, createTimeline, stagger } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

const clockElement = document.getElementById("clock");
const alarmForm = document.getElementById("alarm-form");
const alarmInput = document.getElementById("alarm-time");
const alarmStatus = document.getElementById("alarm-status");
const clearAlarmButton = document.getElementById("clear-alarm");
const snoozeButton = document.getElementById("snooze-btn");
const dismissButton = document.getElementById("dismiss-btn");
const ringingActions = document.getElementById("ringing-actions");
const cardElement = document.querySelector(".card");
const cardDots = document.getElementById("card-dots");

const alarmSound = new Audio("../music/mu.mp3");
alarmSound.loop = true;

const state = {
    alarmTime: "",
    snoozeTime: "",
    ringing: false,
    lastTriggerKey: ""
};
let cardAnimation;
let snoozeMoveTimer;

function buildDots() {
    const totalDots = 13 * 13;

    for (let index = 0; index < totalDots; index += 1) {
        const dot = document.createElement("span");
        dot.className = "dot";
        cardDots.appendChild(dot);
    }
}

function animateCard(isRinging = false) {
    const options = {
        grid: [13, 13],
        from: "center",
    };

    if (cardAnimation) {
        cardAnimation.pause();
    }

    cardAnimation = createTimeline({ defaults: { loop: isRinging } })
        .add(cardElement, {
            rotate: isRinging ? [0, -4, 4, -3, 3, 0] : [0, -2, 2, 0],
            translateY: isRinging ? [0, -16, 0, -10, 0] : [0, -8, 0],
            scale: isRinging ? [1, 1.03, 0.99, 1.02, 1] : [1, 1.01, 1],
            ease: isRinging ? "outElastic(1, .6)" : "outBack(1.8)",
            duration: isRinging ? 1100 : 850,
        })
        .add(".dot", {
            scale: stagger(isRinging ? [1.5, 0.5] : [1.15, 0.75], options),
            translateY: stagger(isRinging ? [-10, 10] : [-4, 4], options),
            ease: isRinging ? "inOutBack(2)" : "inOutQuad",
            duration: isRinging ? 750 : 900,
        }, isRinging ? 100 : 50)
        .add(cardElement, {
            rotate: isRinging ? [0, 2, -2, 0] : [0, 1.5, 0],
            translateY: isRinging ? [0, -8, 0] : [0, -4, 0],
            ease: "inOutSine",
            duration: isRinging ? 500 : 350,
        });
}

function resetSnoozeButtonPosition() {
    if (snoozeMoveTimer) {
        clearInterval(snoozeMoveTimer);
        snoozeMoveTimer = null;
    }

    snoozeButton.classList.remove("snooze-escaping");
    snoozeButton.style.left = "";
    snoozeButton.style.top = "";
    snoozeButton.style.transform = "";
}

function moveSnoozeButtonRandomly() {
    if (!state.ringing) {
        return;
    }

    snoozeButton.classList.add("snooze-escaping");

    const buttonWidth = snoozeButton.offsetWidth || 140;
    const buttonHeight = snoozeButton.offsetHeight || 48;
    const maxX = Math.max(16, window.innerWidth - buttonWidth - 16);
    const maxY = Math.max(16, window.innerHeight - buttonHeight - 16);
    const nextX = Math.floor(Math.random() * (maxX - 16 + 1)) + 16;
    const nextY = Math.floor(Math.random() * (maxY - 16 + 1)) + 16;

    animate(snoozeButton, {
        left: `${nextX}px`,
        top: `${nextY}px`,
        rotate: Math.random() > 0.5 ? 8 : -8,
        scale: [1, 1.08, 1],
        ease: "outBack(1.8)",
        duration: 420,
    });
}

function startSnoozeEscape() {
    resetSnoozeButtonPosition();
    moveSnoozeButtonRandomly();
    snoozeMoveTimer = setInterval(moveSnoozeButtonRandomly, 1500);
}

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
    cardElement.classList.remove("ringing");
    resetSnoozeButtonPosition();
    alarmSound.pause();
    alarmSound.currentTime = 0;
    ringingActions.classList.add("hidden");
    animateCard();
}

function startAlarm(triggerTime) {
    state.ringing = true;
    state.lastTriggerKey = triggerTime;
    cardElement.classList.add("ringing");
    ringingActions.classList.remove("hidden");
    updateStatus(`Alarm ringing for ${formatAlarmTime(new Date())}.`);
    animateCard(true);
    startSnoozeEscape();

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

snoozeButton.addEventListener("mouseenter", () => {
    if (state.ringing) {
        moveSnoozeButtonRandomly();
    }
});

window.addEventListener("resize", () => {
    if (state.ringing) {
        moveSnoozeButtonRandomly();
    }
});

buildDots();
animateCard();
updateClock();
setInterval(updateClock, 1000);
document.addEventListener("click", unlockAudio);
document.addEventListener("keydown", unlockAudio);
