import 'dart:typed_data';

const buttonDown = 144;
const buttonUp = 128;
const dialRotate = 176;

const rotateLeft = 127;
const rotateRight = 1;

const dialTouchOn = 127;
const dialTouchOff = 0;

const volume = 16;
const pan = 17;
const filter = 18;
const resonance = 19;

const selectDown = 25;
const bankSelect = 26;

const patternUp = 31;
const patternDown = 32;
const browser = 33;
const gridLeft = 34;
const gridRight = 35;

const muteButton1 = 36;
const muteButton2 = 37;
const muteButton3 = 38;
const muteButton4 = 39;

const step = 44;
const note = 45;
const drum = 46;
const perform = 47;
const shift = 48;
const alt = 49;
const pattern = 50;

const play = 51;
const stop = 52;
const record = 53;

const select = 118;

// All
const off = 0;

// Red Only
// pattern up/down, browser, grid left/right
const paleRed = 1;
const red = 2;

// Green only
// mute 1,2,3,4
const paleGreen = 1;
const green = 2;

// Yellow only
// alt, stop
const paleYellow = 1;
const yellow = 2;

// Yellow-Red
// step, note, drum, perform, shift, record
const paleYellow2 = 1;
const paleRed2 = 2;
const yellow2 = 3;
const red2 = 4;

// Yellow-Green
// pattern, play
const paleGreen3 = 1;
const paleYellow3 = 2;
const green3 = 3;
const yellow3 = 4;

function on(id: number, value: number) {
  return [
    0xB0, // midi control change code
    id,
    value,
  ];
}

