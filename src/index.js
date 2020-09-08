"use strict";

let offset = 0,
  isPaused = true,
  isTimerPaused = true,
  isSoundOn = true;

let timerId;

let isLight = true;
let isTimer = false;
let timeAmount = 300;

let themeSwitcher = function() {
  console.log("isLight: ", isLight);
  if (isLight) {
    document.querySelector("#theme").href = "css/dark.css";
    isLight = false;
  } else {
    document.querySelector("#theme").href = "css/light.css";
    isLight = true;
  }

  localStorage.setItem("theme", !isLight);
};


// UI objects

const buttonPlay = document.querySelector("#play");
const buttonReset = document.querySelector("#reset");

const buttonPlayTimer = document.querySelector("#play-timer");
const buttonResetTimer = document.querySelector("#reset-timer");

const buttonSound = document.querySelector("#sound-switcher");

const buttonTheme = document.querySelector("#theme-toggle");

const chronoMilli = document.querySelector("#s_ms");
const chronoSeconds = document.querySelector("#s_seconds");
const chronoMinutes = document.querySelector("#s_minutes");
const chronoHours = document.querySelector("#s_hours");

const inputHours = document.querySelector("#input-hours");
const inputMinutes = document.querySelector("#input-minutes");
const inputSeconds = document.querySelector("#input-seconds");

const buttonSwitchChrono = document.querySelector(".mode-chrono");
const buttonSwitchTimer = document.querySelector(".mode-timer");

const chronoUI = document.querySelector(".chrono");
const timerUI = document.querySelector(".timer");

const inputTimer = document.querySelector("#timer-input");


// Event listeners

inputTimer.addEventListener("change", inputHandler);

document.addEventListener("keydown", keyboardHandler);
window.addEventListener("load", onloadHandler);

buttonSwitchChrono.addEventListener("click", switchMode);
buttonSwitchTimer.addEventListener("click", switchMode);

buttonPlay.addEventListener("click", playWatch);
buttonReset.addEventListener("click", resetWatch);

buttonPlayTimer.addEventListener("click", playTimer);
buttonResetTimer.addEventListener("click", resetTimer);

buttonTheme.addEventListener("click", themeSwitcher);

buttonSound.addEventListener("click", soundHandler);

// Generic UI

function switchMode() {
  chronoUI.hidden = !chronoUI.hidden;
  timerUI.hidden = !timerUI.hidden;
  localStorage.setItem("ui", chronoUI.hidden);
  // if (timerUI.hidden) {
  //   buttonSwitch.className = "button button-chrono mx2";
  // } else {
  //   buttonSwitch.className = "button button-timer mx2";
  // }
}

function formatTime(value, scale, modulo, padding) {
  value = Math.floor(value / scale) % modulo;
  return value.toString().padStart(padding, "0");
}

function soundHandler() {
  if (isSoundOn) {
    buttonSound.className = "sound sound-off";
  } else {
    buttonSound.className = "sound sound-on";
  }
  isSoundOn = !isSoundOn;
  localStorage.setItem("sound", !isSoundOn);
}

function onloadHandler() {
  console.log("Page reloaded");
  // isLight = localStorage.getItem("theme");
  // if (isLight === "true") themeSwitcher();
  if (localStorage.getItem("theme") === "true") themeSwitcher();
  if (localStorage.getItem("ui") === "true") switchMode();
  if (localStorage.getItem("sound") === "true") soundHandler();
}

function keyboardHandler(e) {
  if (e.code === "KeyC") switchMode();
  if (e.code === "KeyX") themeSwitcher();

  if (!chronoUI.hidden) {
    if (e.code === "Space") playWatch();
    if (e.code === "KeyZ") resetWatch();
  } else {
    if (e.code === "Space") playTimer();
    if (e.code === "KeyZ") resetTimer();
    if (e.code === "KeyS") soundHandler();
  }
}

// Timer functions

function inputHandler(e) {
  if (e.target.id === "input-hours") {
    e.target.value %= 24;
  } else {
    e.target.value %= 60;
  }

  console.log(`${e.target.id} changed`, e.target.value);

  // e.target.value %= (e.target.id === "input-hours") ? 24 : 60;
  // console.log(`${e.target.id} changed`, e.target.value);

  setTimer();
  displayTimer();
  storeTimer();
}

function setTimer() {
  timeAmount =
    +inputHours.value * 3600 + +inputMinutes.value * 60 + +inputSeconds.value;
  return timeAmount;
}

function displayTimer() {
  inputHours.value = formatTime(timeAmount, 3600, 3600, 2);
  inputMinutes.value = formatTime(timeAmount, 60, 60, 2);
  inputSeconds.value = formatTime(timeAmount, 1, 60, 2);
}

function storeTimer() {
  localStorage.setItem("timer", timeAmount);
}

function restoreTimer() {
  timeAmount = localStorage.getItem("timer");
}

function storeChrono(value) {
  localStorage.setItem("chrono", value);
  console.log("Time saved!");
}

function restoreChrono() {
  console.log("Restored time:", localStorage.getItem("chrono"));
  return localStorage.getItem("chrono");
}

function coreTimer() {
  timerId = setTimeout(function run() {
    displayTimer();

    if (timeAmount <= 0) {
      clearTimeout(timerId);

      visualSignal();
      if (isSoundOn) playSignal();

      setTimeout(() => {
        resetTimer();
      }, 3000);
    } else {
      timeAmount--;
      timerId = setTimeout(run, 1000);
    }
  }, 0);
}

function playTimer() {
  if (!+setTimer(inputHours.value, inputMinutes.value, inputSeconds.value)) {
    console.log("Error: Time is not set. Please enter non-zero time");
    return;
  }

  if (isTimerPaused) {
    // console.log("Timer started");
    isTimerPaused = false;

    inputSeconds.setAttribute("readonly", true);
    inputMinutes.setAttribute("readonly", true);
    inputHours.setAttribute("readonly", true);

    buttonPlayTimer.className = "button button-stop m1";
    coreTimer();
  } else {
    // console.log("Timer paused");
    isTimerPaused = true;
    buttonPlayTimer.className = "button button-start m1";
    clearTimeout(timerId);
  }
}

function resetTimer() {
  if (timerId !== undefined) {
    clearTimeout(timerId);
  }

  isTimerPaused = true;
  buttonPlayTimer.className = "button button-start m1";

  setTimer();
  restoreTimer();
  displayTimer();

  inputSeconds.readOnly = false;
  inputMinutes.readOnly = false;
  inputHours.readOnly = false;
}

function visualSignal() {
  const blinkId = setInterval(() => {
    themeSwitcher();

    // setTimeout(() => {
    //   // document.body.style.background = color;
    // }, 300);
  }, 300);

  setTimeout(() => {
    clearInterval(blinkId);
  }, 2700);
}

function playNote(frequency, duration) {
  // create web audio api context
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // create Oscillator node
  const oscillator = audioCtx.createOscillator();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); // value in hertz
  oscillator.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

function playSignal() {
  // Here come a simple tune
  const sineId = setInterval(() => {
    playNote(440, 0.15);

    setTimeout(() => {
      playNote(880, 0.15);
    }, 150);
  }, 600);

  setTimeout(() => {
    clearInterval(sineId);
  }, 2400);
}

// Stopwatch Logic

// Play button handler
function playWatch() {
  if (isPaused) {
    isPaused = false;
    offset -= Date.now();
    buttonPlay.className = "button button-stop m1"; // Hardcode :-(
  } else {
    isPaused = true;
    offset += Date.now();
    console.log("Time stopped", offset);
    storeChrono(offset);
    buttonPlay.className = "button button-start m1"; // Hardcode :-(
  }
  render();
}

function resetWatch() {
  offset = 0;
  storeChrono(offset);
  isPaused = true;
  buttonPlay.className = "button button-start m1"; // Hardcode :-(
  render();
}

function render() {
  let value = isPaused ? offset : Date.now() + offset;

  chronoMilli.textContent = formatTime(value, 1, 1000, 3);
  chronoSeconds.textContent = formatTime(value, 1000, 60, 2);
  chronoMinutes.textContent = formatTime(value, 60000, 60, 2);
  chronoHours.textContent = formatTime(value, 3600000, 60, 2);

  // If chronometer state is not paused, call render() every 10-20 ms
  if (!isPaused) {
    requestAnimationFrame(render);
  }
}

resetTimer();
