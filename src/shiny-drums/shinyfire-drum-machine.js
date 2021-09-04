/* eslint require-jsdoc: "off" */

import {
  RESET_BEAT, DEMO_BEATS, INSTRUMENTS, KIT_DATA,
  IMPULSE_RESPONSE_DATA
} from './shiny-drum-machine-data.js';

import { Beat, Player, Kit, Effect } from './shiny-drum-machine-audio.js';

import { getMidi, setupTransport, firePads, allOff } from '/dist/firemidi.js';


// Events
// init() once the page has finished loading.
window.onload = init;

const MIN_TEMPO = 50;
const MAX_TEMPO = 180;

let theBeat;
let player;
const KITS = [];
const EFFECTS = [];

function loadAssets() {
  // Any assets which have previously started loading will be skipped over.
  for (const kit of KITS) {
    kit.load();
  }

  for (const effect of EFFECTS) {
    effect.load();
  }
}

function loadDemos(onDemoLoaded) {
  for (let demoIndex = 0; demoIndex < 5; demoIndex++) {
    const demo = DEMO_BEATS[demoIndex];
    const effect = EFFECTS[demo.effectIndex];
    const kit = KITS[demo.kitIndex];

    Promise.all([
      effect.load(),
      kit.load(),
    ]).then(() => onDemoLoaded(demoIndex));
  }
}

// This gets rid of the loading spinner in each of the demo buttons.
function onDemoLoaded(demoIndex) {
  console.log('Demo loaded:' + demoIndex);

  // Enable play button and assign it to demo 2.
  if (demoIndex == 1) {
    loadBeat(DEMO_BEATS[1]);
  }
}

function init() {
  EFFECTS.push(...IMPULSE_RESPONSE_DATA.map(
    (data, i) => new Effect(data, i)));

  KITS.push(...KIT_DATA.map(({ id, name }, i) => new Kit(id, name, i)));

  theBeat = new Beat(RESET_BEAT, KITS, EFFECTS);

  player = new Player(theBeat, onNextBeat);

  initControls();

  // Start loading the assets used by the presets first, in order of the
  // presets. The callback gets rid of the loading spinner in each of the demo
  // buttons.
  loadDemos(onDemoLoaded);

  // Then load the remaining assets.
  loadAssets();

  updateControls();
}

function initControls() {
  getMidi(midiReady);

  function midiReady() {
    console.log('MIDI IS READY');
    setupTransport(
      handlePlay, handleStop, null, handleNoteClick,
    );

    allOff();
    console.log('pads:' + firePads);
  }
}

function loadBeat(beat) {
  handleStop();
  theBeat.loadObject(beat);
  player.updateEffect();
  updateControls();
}

function onNextBeat() {
  console.log('NEXT BEAT');
}

const instrumentRows = {
  "Kick": 0,
  "Snare": 1,
  "HiHat": 2,
  "Tom1": 3
}
const instrumentIndexed = ["Kick", "Snare", "HiHat", "Tom1"];

const noteColours = [
  // kick
  [
    { r: 0, g: 0, b: 0 },
    { r: 0, g: 10, b: 30 },
    { r: 0, g: 0, b: 120 }
  ],
  [
    // snare
    { r: 0, g: 0, b: 0 },
    { r: 30, g: 10, b: 0 },
    { r: 120, g: 0, b: 0 }
  ],
  [
    //hihat
    { r: 0, g: 0, b: 0 },
    { r: 0, g: 30, b: 10 },
    { r: 0, g: 100, b: 0 }
  ],
  [
    //tom1
    { r: 0, g: 0, b: 0 },
    { r: 30, g: 30, b: 0 },
    { r: 120, g: 120, b: 0 }
  ]
];

function colourToString(colour) {
  return `${colour.r},${colour.g},${colour.b}`
}

function updateControls() {
  for (const instrument of INSTRUMENTS) {
    theBeat.getNotes(instrument.name).forEach((note, i) => {
      const row = instrumentRows[instrument.name];
      const padColour = noteColours[row][note];
      const index = (row * 16) + i;

      //console.log(`i:${i} row:${row} index:${index} colour:${colourToString(padColour)} instr:${instrument.name}  note:${note}`);
      firePads.padLedOn(index, padColour);
    });
  }

  // ui.kitPicker.select(theBeat.kit.index);
  // ui.effectPicker.select(theBeat.effect.index);
  // ui.tempoInput.value = theBeat.tempo;
  // ui.effectSlider.value = theBeat.effectMix;
  // ui.swingSlider.value = theBeat.swingFactor;

  // for (const instrument of INSTRUMENTS) {
  //   ui.pitchSliders.setPitch(instrument.name,
  //       theBeat.getPitch(instrument.name));
  // }
}


function handleNoteClick(index) {
  const instrumentName = instrumentIndexed[Math.floor(index / 16)];
  const rhythmIndex = index % 16;

  theBeat.toggleNote(instrumentName, rhythmIndex);

  const note = theBeat.getNote(instrumentName, rhythmIndex);
  const row = instrumentRows[instrumentName];
  const padColour = noteColours[row][note];
  firePads.padLedOn(index, padColour);

  const instrument = INSTRUMENTS.find((instr) => instr.name === instrumentName);
  player.playNote(instrument, rhythmIndex);
}

async function setEffect(index) {
  const effect = EFFECTS[index];
  await effect.load();

  theBeat.effect = effect;
  player.updateEffect();
  updateControls();
}

function handlePlay() {
  console.log('handle play');
  player.play();
  // ui.playButton.state = 'playing';
}

function handleStop() {
  console.log('handle stop');
  player.stop();
  // ui.playheads.off();
  // ui.playButton.state = 'stopped';
}

function handleRecord() {
  console.log('handle record');
}