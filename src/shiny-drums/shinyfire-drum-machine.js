/* eslint require-jsdoc: "off" */

import {
  RESET_BEAT, DEMO_BEATS, INSTRUMENTS, KIT_DATA,
  IMPULSE_RESPONSE_DATA
} from './shiny-drum-machine-data.js';

import { Beat, Player, Kit, Effect } from './shiny-drum-machine-audio.js';

import { getMidi, setupTransport, setupPads, setupOled, setupDials, allOff } from '/dist/firemidi.js';

import { instrumentIndexed, instrumentRows, noteColours } from './ui_config.js'

// Events
// init() once the page has finished loading.
window.onload = init;

const MIN_TEMPO = 50;
const MAX_TEMPO = 180;

let theBeat;
let player;
let padControl;
let kit;
let oled;
let dials;
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
    kit = KITS[demo.kitIndex];

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
  if (demoIndex == 3) {
    loadBeat(DEMO_BEATS[3]);
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
      handlePlay, handleStop, null
    );
    padControl = setupPads(handleNoteClick);
    console.log('PADCONTROL:', padControl)
    oled = setupOled();
    dials = setupDials(
      {
        onVolume: (dir) => { console.log('vol:' + dir) },
        onPan: () => { },
        onFilter: () => { },
        onResonance: () => { },
        onSelect: (dir) => { console.log('select:' + dir) }
      }
    );
    allOff();
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
  updatePadsFromPlayer();
  padControl.nextBeat();
}

function colourToString(colour) {
  return `${colour.r},${colour.g},${colour.b}`
}

function updateControls() {
  updatePadsFromPlayer();
  updateOled();

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

function updatePadsFromPlayer() {
  for (const instrument of INSTRUMENTS) {
    theBeat.getNotes(instrument.name).forEach((note, i) => {
      const row = instrumentRows[instrument.name];
      const padColour = noteColours[row][note];
      const index = (row * 16) + i;
      padControl.padLedOn(index, padColour);
    });
  }
}

function updateOled() {
  console.log(`kit:`, kit)
  oled.text(0, `BPM:${theBeat.tempo}`);
  oled.text(1, `FX:${theBeat.effect.name}`);
  oled.text(2, `Kit:${kit.prettyName}`);
}

function handleNoteClick(index) {
  const instrumentName = instrumentIndexed[Math.floor(index / 16)];
  const rhythmIndex = index % 16;

  theBeat.toggleNote(instrumentName, rhythmIndex);

  const note = theBeat.getNote(instrumentName, rhythmIndex);
  const row = instrumentRows[instrumentName];
  const padColour = noteColours[row][note];
  padControl.padLedOn(index, padColour);

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
}

function handleStop() {
  console.log('handle stop');
  player.stop();
  padControl.resetBeat();
}

function handleRecord() {
  console.log('handle record');
}