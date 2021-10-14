import { getMidi, setupTransport, setupPads, setupOled, setupDials, setupButtons, allOff, ButtonsSetup, ButtonControl, ButtonCode } from '../firemidi.js';
import { CCInputs } from '../fire_raw/cc_inputs.js';

import { MenuController } from '../menu/menu_controller.js'

import { ListScreen, ListScreenItem, MenuScreen, NumberOverlayScreen } from '../shiny-drums/screen_widgets.js'
import { Track } from './sequencer.js';

const MENU_LIST_ITEMS_COUNT = 9;

let oled: any;
let menu: any;
let buttons: ButtonControl;
let dials: any;
let padControl: any;

interface controlInterface {
  selectInstrument: (instrument: string) => void,
  playNote: (note: number) => void,
  stop: () => void
}

export enum MachineMode {
  Step = 1,
  Note,
  Drum,
  Preform,
  Browser,
}

interface MachineState {
  mode: MachineMode,
  currentTrack: Track,
  selectedStep: number,
  tracks: Track[]
}

export function initControls(instrumentNames: string[],
  handlePlay: VoidFunction,
  control: controlInterface,
  machineState: MachineState
) {
  getMidi(midiReady, (isConnected: boolean) => {
    if (isConnected) { console.log('reconnected'); midiReady(); }
  });

  function midiReady() {
    console.log('SAMPLER MIDI IS READY');

    setupTransport(
      handlePlay, control.stop, function () { }
    );
    padControl = setupPads((index) => handlePad(index, machineState, control.playNote));
    oled = setupOled();

    const _topMenu = new ListScreen(MENU_LIST_ITEMS_COUNT, _topMenuListItems(instrumentNames, control.selectInstrument),
      () => {
        _topMenu.updateItems(_topMenuListItems(instrumentNames, control.selectInstrument));
      });

    menu = new MenuController(oled);
    menu.pushMenuScreen(_topMenu);

    const overlays = {
      // 'volume': new NumberOverlayScreen(
      //   "VOL", player.masterGainNode.gain["value"], 1, 0, 0.01, 0.1, (val) => { player.masterGainNode.gain["value"] = val; },
      // ),
      'pitch': new NumberOverlayScreen(
        `P:`, 1, 127, 1, 1, 1, (pitch) => {
          machineState.currentTrack.steps[machineState.selectedStep].note = pitch;
        },
      )
      // ,
      // 'effects': new NumberOverlayScreen(
      //   "FX", theBeat["effectMix"], 1, 0, 0.01, 0.1, (val) => { theBeat["effectMix"] = val; player.updateEffect(); },
      // ),
    };

    dials = setupDials(
      {
        onVolume: (dir) => {
          // handleDialInput(dir, overlays["volume"]);
        },
        onPan: (dir) => {

        },
        onFilter: (dir) => {
          const instrumentName = machineState.currentTrack.name;
          const overlay = overlays["pitch"];
          if (instrumentName == null) {
            return;
          }
          let pitch = machineState.currentTrack.steps[machineState.selectedStep].note;
          overlay.title = `${instrumentName}`;
          overlay.value = pitch;
          handleDialInput(dir, overlay);
        },
        onResonance: (dir) => {
          // handleDialInput(dir, overlays["effects"]);
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

    const bSetup: ButtonsSetup = {
      browser: (up: boolean) => {
        machineState.mode = MachineMode.Browser;
        _setModeButtonLeds(machineState.mode);

        menu.onBack()
      },
      patternUp: (up: boolean) => console.log('patternup button'),
      shift: (up: boolean) => {
        //_shiftON = !up;
      },
      pattern: (up: boolean) => {
        console.log('pattern:' + up);
        if (up) {
          // need to repaint showing menu
          menu.updateOled();
        }
      },
      solomute1: (up: boolean) => {
        console.log('SOLO1' + up);
        machineState.currentTrack = machineState.tracks[0];
        console.log(machineState);
      },
      solomute2: (up: boolean) => {
        machineState.currentTrack = machineState.tracks[1];
        console.log(machineState);
      },
      solomute3: (up: boolean) => {
        machineState.currentTrack = machineState.tracks[2];
        console.log(machineState);
      },
      solomute4: (up: boolean) => {
        machineState.currentTrack = machineState.tracks[3];
        console.log(machineState);
      },
      patternDown: function (up: boolean): void {
        throw new Error('Function not implemented.');
      },
      gridLeft: function (up: boolean): void {
        throw new Error('Function not implemented.');
      },
      gridRight: function (up: boolean): void {
        throw new Error('Function not implemented.');
      },
      step: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Step;
          _setModeButtonLeds(machineState.mode);
        }
      },
      note: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Note;
          _setModeButtonLeds(machineState.mode);
          _paintPadsKeyboard()
        }
      },
      drum: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Drum;
          _setModeButtonLeds(machineState.mode);
        }
      },
      perform: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Preform;
          _setModeButtonLeds(machineState.mode);
        }
      },
      alt: function (up: boolean): void {
        throw new Error('Function not implemented.');
      }
    };

    buttons = setupButtons(bSetup);


    // clear all now that we have finished init
    allOff();

    // update OLED with loaded preset
    menu.updateOled();
  }
}

function _topMenuListItems(entries: string[], selectedFn: Function): ListScreenItem[] {
  return entries.map((x) => new ListScreenItem(x, (item: ListScreenItem) => selectedFn(item.label), {}));
}

function _setModeButtonLeds(mode: MachineMode) {
  // only 1 mode on at a time
  const ledColour = CCInputs.yellow2;
  const ledOff = 0;
  const buttonStates: { [key in ButtonCode]: number } = {};
  buttonStates[ButtonCode.Step] = mode == MachineMode.Step ? ledColour : ledOff;
  buttonStates[ButtonCode.Note] = mode == MachineMode.Note ? ledColour : ledOff;
  buttonStates[ButtonCode.Drum] = mode == MachineMode.Drum ? ledColour : ledOff;
  buttonStates[ButtonCode.Perform] = mode == MachineMode.Preform ? ledColour : ledOff;
  buttonStates[ButtonCode.Browser] = mode == MachineMode.Browser ? ledColour : ledOff;

  for (const b in buttonStates) {
    buttons.buttonLedOn(parseInt(b), buttonStates[b]);
  }
}

function handleDialInput(dir: number, overlay: MenuScreen) {
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

function handlePad(index: number, machineState: MachineState, callback: (note: number) => void) {
  const rowIndex = Math.floor(index / 16);
  const columnIndex = index % 16;
  console.log("pad offset" + index % 16);
  //TODO: account for grid offset
  machineState.selectedStep = index % 16;

  if (machineState.mode == MachineMode.Note) {
    const note = _noteFromPadIndex(index);
    if (note > 0) {
      console.log('PLAY NOTE:' + index);
      callback(note);
    }
  }
}

const firstBlackRow = 32;
const firstWhiteRow = 48;
const blackKeys = [0, 1, 3, 0, 6, 8, 10, 0, 13, 15, 0, 18, 20, 22, 0, 25];
const whitekeys = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26];

function _paintPadsKeyboard() {
  const blackKeyColour = { r: 0, g: 0, b: 80 };
  const whiteKeyColour = { r: 80, g: 80, b: 100 };
  for (var i = firstBlackRow; i < firstWhiteRow; i++) {
    if (blackKeys[i % 16] != 0) {
      padControl.padLedOn(i, blackKeyColour);
    }
  }
  for (var i = firstWhiteRow; i < firstWhiteRow + 16; i++) {
    padControl.padLedOn(i, whiteKeyColour);
  }
}

// work out note from chromatic keyboard displayed on bottom 2 rows of pads
function _noteFromPadIndex(index: number): number {
  const octave = 3;
  let midiNote = 0;
  const octaveStartingNote = (octave * 12) % 128;

  if (index < firstBlackRow) {
    return 0;
  }

  if (index >= firstBlackRow && index <= firstWhiteRow) {
    const noteOffset = blackKeys[index % 16];
    if (noteOffset == 0) {
      return 0;
    }
    midiNote = octaveStartingNote + noteOffset;
  } else {
    midiNote = octaveStartingNote + whitekeys[index % 16];
  }
  return midiNote;
}
