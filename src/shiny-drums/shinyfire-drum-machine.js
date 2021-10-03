/* eslint require-jsdoc: "off" */

import {
  RESET_BEAT, DEMO_BEATS, INSTRUMENTS, KIT_DATA,
  IMPULSE_RESPONSE_DATA
} from './shiny-drum-machine-data.js';

import { Beat, Player, Kit, Effect } from './shiny-drum-machine-audio.js';

import { getMidi, setupTransport, setupPads, setupOled, setupDials, setupButtons, allOff } from '/dist/firemidi.js';

import { instrumentIndexed, instrumentRows, noteColours } from './ui_config.js'

import { MenuController } from '/dist/menu/menu_controller.js'

import { ListScreen, ListScreenItem, NumberOverlayScreen } from '/dist/shiny-drums/screen_widgets.js'


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
let menu;
let buttons;
const KITS = [];
const EFFECTS = [];


// Drum machine UI and control state
let _shiftON = false;
let _isPlaying = false;
let _editTempoMode = false;
let _editKitMode = false;
let _selectedInstrumentIndex;


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

function onDemoLoaded(demoIndex) {
  console.log('Demo loaded:' + demoIndex);

  if (demoIndex == 1) {
    loadBeat(DEMO_BEATS[demoIndex]);
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

const MENU_LIST_ITEMS_COUNT = 9;

const machineState = {
  get currentInstrumentName() {
    return instrumentIndexed[_selectedInstrumentIndex];
  }
}

function onKitMenuSelected() {
  const kits = KITS.map((kit) => new ListScreenItem(kit.prettyName, (item) => {
    console.log("selected kit", item.data);
    theBeat.kit = item.data; // assign selected kit to current beat
  }, kit)
  );

  const kitMenu = new ListScreen(MENU_LIST_ITEMS_COUNT,
    kits, () => { });

  menu.pushMenuScreen(kitMenu);
}

function onBPMMenuSelected() {
  menu.pushMenuScreen(new NumberOverlayScreen(
    "BPM", theBeat.tempo, 300, 20, 1, 10, (val) => { theBeat.tempo = val; }, 0
  ));
}

function onSwingMenuSelected() {
  menu.pushMenuScreen(new NumberOverlayScreen(
    "Swing", theBeat.swingFactor, 1, 0, 0.1, 0.1, (val) => { theBeat.swingFactor = val; }, 2
  ));
}

function _topMenuListItems() {
  return [
    new ListScreenItem(`BPM:${theBeat.tempo}`, (item) => { onBPMMenuSelected(); }),
    new ListScreenItem(`Kit:${theBeat.kit.prettyName}`, (item) => { onKitMenuSelected(); }),
    new ListScreenItem(`Swing:${theBeat.swingFactor}`, (item) => { onSwingMenuSelected(); }),
    new ListScreenItem(`FX:${theBeat.effect.name}`, (item) => { console.log('sel:' + item._label); }),
    new ListScreenItem('test1', (item) => { console.log('sel:' + item._label); }),
  ];
}

function initControls() {
  getMidi(midiReady, (isConnected) => { if (isConnected) { console.log('reconnected'); midiReady(); } });

  function midiReady() {
    console.log('MIDI IS READY');

    setupTransport(
      handlePlay, handleStop, null
    );
    padControl = setupPads(handleNoteClick);
    oled = setupOled();

    const _topMenu = new ListScreen(MENU_LIST_ITEMS_COUNT, _topMenuListItems(),
      () => {
        const kit = theBeat.kit;
        _topMenu.updateItems(_topMenuListItems());
      });

    menu = new MenuController(oled);
    menu.pushMenuScreen(_topMenu);

    const overlays = {
      'volume': new NumberOverlayScreen(
        "VOL", player.masterGainNode.gain["value"], 1, 0, 0.01, 0.1, (val) => { player.masterGainNode.gain["value"] = val; },
      ),
      'pitch': new NumberOverlayScreen(
        `P:`, -1, 1, 0, 0.01, 0.1, (pitch) => {
          theBeat.setPitch(machineState.currentInstrumentName, pitch);
        },
      ),
      'effects': new NumberOverlayScreen(
        "FX", theBeat["effectMix"], 1, 0, 0.01, 0.1, (val) => { theBeat["effectMix"] = val; player.updateEffect(); },
      ),
    };

    dials = setupDials(
      {
        onVolume: (dir) => {
          handleDialInput(dir, overlays["volume"]);
        },
        onPan: (dir) => {

        },
        onFilter: (dir) => {
          const instrumentName = machineState.currentInstrumentName;
          const overlay = overlays["pitch"];
          if (instrumentName == null) {
            return;
          }
          let pitch = theBeat.getPitch(instrumentName);
          overlay.title = `P:${instrumentName}`;
          overlay.value = pitch;
          handleDialInput(dir, overlay);
        },
        onResonance: (dir) => {
          handleDialInput(dir, overlays["effects"]);
        },
        onSelect: (dir) => {
          if (dir == 2 || dir == 3) {
            if (dir == 2) {
              menu.onSelect();
            }
          } else {
            menu.onDial(dir);
          }
        }
      }
    );
    buttons = setupButtons(
      {
        browser: (_) => menu.onBack(),
        patternUp: (_) => console.log('shiny patternup button'),
        shift: (up) => {
          _shiftON = !up;
        },
        pattern: (up) => {
          console.log('pattern:' + up)
          _editTempoMode = !up;
          if (up) {
            // need to repaint showing menu
            menu.updateOled();
          }
        },
        solomute1: (up) => {
          _selectedInstrumentIndex = up ? null : 0;
        },
        solomute2: (up) => {
          _selectedInstrumentIndex = up ? null : 1;
        },
        solomute3: (up) => {
          _selectedInstrumentIndex = up ? null : 2;
        },
        solomute4: (up) => {
          _selectedInstrumentIndex = up ? null : 3;
        }
      }
    );

    // clear all now that we have finished init
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
  menu.updateOled();

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

async function setCurrentEffect(index) {
  const effect = EFFECTS[index];
  await effect.load();

  theBeat.effect = effect;
  player.updateEffect();
  updateControls();
}

function handlePlay() {
  if (_isPlaying) {
    player.stop();
    _isPlaying = false;
  } else {
    player.play();
    _isPlaying = true;
  }
}

function handleStop() {
  player.stop();
  padControl.resetBeat();
}

function handleRecord() {
  console.log('handle record');
}


function handleDialInput(dir, overlay) {
  // button up
  if (dir == 3) {
    menu.clearOverlay();
    return;
  }

  if (dir == 0) {
    overlay.prev();
  } else if (dir == 1) {
    overlay.next();
  }
  menu.setOverlay(overlay)
}
