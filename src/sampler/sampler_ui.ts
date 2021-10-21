import { getMidi, setupTransport, setupPads, setupOled, setupDials, setupButtons, allOff, ButtonsSetup, ButtonControl, ButtonCode, PadsControl, OledControl } from '../firemidi.js';
import { DialEvent } from '../fire_controls/dials.js';
import { CCInputs } from '../fire_raw/cc_inputs.js';
import { Color, colorPad } from '../fire_raw/pads.js';

import { MenuController } from '../menu/menu_controller.js'

import { ListScreen, ListScreenItem, MenuScreen, NumberOverlayScreen } from '../shiny-drums/screen_widgets.js'
import { Instrument, OptsInterface } from './audio_handling.js';
import { Track } from './sequencer.js';

const MENU_LIST_ITEMS_COUNT = 9;
const DURATION_INCREMENT = 0.02;
const OFF_COLOR = { r: 0, g: 0, b: 0 };

let oled: OledControl;
let menu: MenuController;
let buttons: ButtonControl;
let dials: any;
let padControl: PadsControl;

let infiniSeqCurrentStep: number = 0;

let overlays: Record<string, NumberOverlayScreen> = {};

interface controlInterface {
  selectInstrument: (instrument: string) => void,
  playNote: (note: number, options: OptsInterface) => void,
  stop: () => void,
  startPlayer: () => void,
  save: () => void,
  addTrack: () => Track,
  removeTrack: (trackIndex: number) => void,
  setTempo: (tempo: number) => void
}

export enum KeyMod {
  None = 0,
  Shift,
  Alt
}

export enum MachineMode {
  Step = 1,
  Note,
  Drum,
  Preform,
  Browser
}

export enum TransportMode {
  None = 1,
  Play,
  Pause,
  Stop,
  Record,
  CountIn
}

interface MachineState {
  mode: MachineMode,
  keyMod: KeyMod,
  transportMode: TransportMode,
  currentTrack: Track,
  selectedStep: number,
  selectedNote: number,
  keybdOctave: number,
  tracks: Track[],
  theBeat: Beat,
  tempo: number
}

type BeatListener = (beatCount: number) => void;

export class Beat {
  _listeners: BeatListener[] = [];

  addListener(listener: BeatListener): number {
    this._listeners.push(listener);
    return this._listeners.length - 1;
  }

  removeListener(listenerId: number) {
    this._listeners.splice(listenerId, 1);
  }

  beat(count: number) {
    this._listeners.forEach(listener => {
      listener(count);
    });
  }
}

export function initControls(
  instrumentNames: string[],
  control: controlInterface,
  machineState: MachineState,
  theBeat: Beat
) {
  getMidi(midiReady, (isConnected: boolean) => {
    if (isConnected) { console.log('reconnected'); midiReady(); }
  });

  // ==========================================================

  function midiReady() {
    console.log('SAMPLER MIDI IS READY');

    // pass in callbacks which will be called when one of the 3 transport buttons is pressed
    setupTransport(
      () => {
        machineState.transportMode = TransportMode.Play;
        control.startPlayer();
      },
      () => {
        // for now use ALT+Stop to clear current tracks steps 
        if (machineState.keyMod == KeyMod.Alt) {
          machineState.currentTrack.clearSteps();
          console.log('Clear currrent track steps')
          return true; // true means to clear all buttons after handling this
        }
        machineState.transportMode = TransportMode.Stop;
        control.stop();
        overlays["stepseq"].value = 0;
        menu.clearOverlay(); // stop showing step num overlay if prev in Record mode
        console.log('curr track', machineState.currentTrack)
      },
      () => {
        // for now special case to SAVE Project data using REC+SHIFT buttons
        if (machineState.keyMod == KeyMod.Shift) {
          control.save();
          return true; // true means to clear all buttons after handling this
        }
        else {
          machineState.transportMode = TransportMode.Record;
          // reset the infini-seq step counter
          infiniSeqCurrentStep = 0;
          menu.setOverlay(overlays["stepseq"]); // show swq step number overlay
          console.log('reset infini seq steps');
        }
      }
    );
    padControl = setupPads((index) => handlePad(index, machineState, control));
    oled = setupOled();

    // setup updating pads/oled when playing beat
    theBeat.addListener((beatCount) => {
      console.log("UI counting the beat:" + beatCount)
      if (machineState.mode == MachineMode.Step) {
        const tracks = machineState.tracks;
        _paintPlayHead(beatCount, tracks);
      }
    });

    const _topMenu = new ListScreen(MENU_LIST_ITEMS_COUNT,
      _topMenuListItems(instrumentNames,
        (instrumentName: string) => _handleInstrumentSelection(control, machineState, instrumentName)),
      () => {
        _topMenu.updateItems(_topMenuListItems(instrumentNames,
          (instrumentName: string) => _handleInstrumentSelection(control, machineState, instrumentName)));
      });

    menu = new MenuController(oled);
    menu.pushMenuScreen(_topMenu);

    overlays["pitch"] = new NumberOverlayScreen(
      `P:`, 1, 127, 1, 1, 1, (pitch) => {
        machineState.currentTrack.steps[machineState.selectedStep].note = pitch;
      },
    );
    overlays["stepseq"] = new NumberOverlayScreen(
      `P:`, 1, 127, 1, 1, 1, (step) => {
        infiniSeqCurrentStep = step;
        console.log('step now:' + step)
      }, 0 //no decimal display
    );
    overlays["tempo"] = new NumberOverlayScreen(
      "BPM", machineState.tempo, 300, 20, 1, 10, (val) => { control.setTempo(val); }, 0
    );
    overlays["volume"] = new NumberOverlayScreen(
      "VOLUME", 0, 10, 0, 0.01, 0.1, (val) => { machineState.currentTrack.gain = val; },
    );
    overlays["duration"] = new NumberOverlayScreen(
      "DURATION", 0, 10, 0, 0.01, 0.1, (val) => { machineState.currentTrack.duration = val; },
    );
    overlays["offset"] = new NumberOverlayScreen(
      "OFFSET", 0, 10, 0, 0.01, 0.1, (val) => { machineState.currentTrack.offset = val; },
    );
    overlays["attack"] = new NumberOverlayScreen(
      "ATTACK", 0, 10, 0, 0.01, 0.1, (val) => { machineState.currentTrack.attack = val; },
    );
    overlays["decay"] = new NumberOverlayScreen(
      "DECAY", 0, 10, 0, 0.01, 0.1, (val) => { machineState.currentTrack.decay = val; },
    );
    overlays["sustain"] = new NumberOverlayScreen(
      "SUSTAIN", 0, 10, 0, 0.01, 0.1, (val) => { machineState.currentTrack.sustain = val; },
    );
    overlays["release"] = new NumberOverlayScreen(
      "RELEASE", 0, 10, 0, 0.01, 0.1, (val) => { machineState.currentTrack.release = val; },
    );
    //   // 'effects': new NumberOverlayScreen(
    //   //   "FX", theBeat["effectMix"], 1, 0, 0.01, 0.1, (val) => { theBeat["effectMix"] = val; player.updateEffect(); },
    //   // ),
    // };

    dials = setupDials(
      {
        onVolume: (dir: DialEvent) => {
          console.log("VOL dir:" + dir)
          if (machineState.mode == MachineMode.Note || machineState.mode == MachineMode.Step) {
            if (machineState.keyMod == KeyMod.Alt) {
              //TODO: clamp max at track max audiosample duration
              const overlay = overlays["attack"];
              overlay.value = machineState.currentTrack.attack ?? 0;
              handleDialInput(dir, overlay);
              console.log('ATTAK:', machineState.currentTrack.attack);
            } else {
              const overlay = overlays["volume"];
              overlay.value = machineState.currentTrack.gain;
              handleDialInput(dir, overlay);
            }
          } else {
            //TODO:
            console.log('MAster VOLume:');
          }
        },
        onPan: (dir: DialEvent) => {
          if (machineState.mode == MachineMode.Note) {
            if (machineState.keyMod == KeyMod.Shift) {
              const overlay = overlays["offset"];
              overlay.value = machineState.currentTrack.offset ?? 0;
              handleDialInput(dir, overlay);
              console.log('OFFSET:' + machineState.currentTrack.offset);
            } else if (machineState.keyMod == KeyMod.Alt) {
              //TODO: clamp max at track max audiosample duration
              const overlay = overlays["decay"];
              overlay.value = machineState.currentTrack.decay ?? 0;
              handleDialInput(dir, overlay);
              console.log('DECAY:', machineState.currentTrack.decay);
            }
          }
        },
        onFilter: (dir: DialEvent) => {
          if (machineState.mode == MachineMode.Note) {
            if (machineState.keyMod == KeyMod.Shift) {
              const overlay = overlays["duration"];
              overlay.value = machineState.currentTrack.duration ?? 0;
              handleDialInput(dir, overlay);
              console.log('DUR:' + machineState.currentTrack.duration);
            } else if (machineState.keyMod == KeyMod.Alt) {
              const sustain = machineState.currentTrack.decay;
              //TODO: clamp max at track max audiosample duration
              const overlay = overlays["sustain"];
              overlay.value = machineState.currentTrack.sustain ?? 0;
              handleDialInput(dir, overlay);
              console.log('SUSTAIN:', machineState.currentTrack.sustain);
            } else {
              const instrumentName = machineState.currentTrack.name;
              const overlay = overlays["pitch"];
              if (instrumentName == null) {
                return;
              }
              let pitch = machineState.currentTrack.steps[machineState.selectedStep].note;
              overlay.title = `${instrumentName}`;
              overlay.value = pitch;
              handleDialInput(dir, overlay);
            }
          } else {
            console.log('NO FILTER YET in mode:' + machineState.mode);
          }
        },
        onResonance: (dir: DialEvent) => {
          // handleDialInput(dir, overlays["effects"]);
          if (machineState.mode == MachineMode.Note) {
            if (machineState.keyMod == KeyMod.Alt) {
              //TODO: clamp max at track max audiosample duration
              const overlay = overlays["release"];
              overlay.value = machineState.currentTrack.release ?? 0;
              handleDialInput(dir, overlay);
              console.log('RELEASE:', machineState.currentTrack.release);
            }
          }
        },
        onSelect: (dir: DialEvent) => {
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
      pattern: (up: boolean) => {
        console.log('pattern:' + up);
        if (up) {
          // need to repaint showing menu
          menu.onBack();
        } else {
          menu.pushMenuScreen(overlays["tempo"])
        }
      },
      solomute1: (up: boolean) => {
        console.log('SOLO1' + up);
        if (!up) {
          if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
            if (machineState.keyMod == KeyMod.Shift) {
              _handleTrackSelect(machineState, 0);
            } else {
              _handleToggleTrackMute(machineState, 0);
            }
          }
        }
      },
      solomute2: (up: boolean) => {
        if (!up) {
          if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
            if (machineState.keyMod == KeyMod.Shift) {
              _handleTrackSelect(machineState, 1);
            } else {
              _handleToggleTrackMute(machineState, 1);
            }
          }
        }
      },
      solomute3: (up: boolean) => {
        if (!up) {
          if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
            if (machineState.keyMod == KeyMod.Shift) {
              _handleTrackSelect(machineState, 2);
            } else {
              _handleToggleTrackMute(machineState, 2);
            }
          }
        }
      },
      solomute4: (up: boolean) => {
        if (!up) {
          if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
            if (machineState.keyMod == KeyMod.Shift) {
              _handleTrackSelect(machineState, 3);
            } else {
              _handleToggleTrackMute(machineState, 3);
            }
          }
        }
      },
      patternUp: (up: boolean) => {
        if (!up) {
          if (machineState.mode == MachineMode.Note) {
            if (machineState.transportMode == TransportMode.Record) {
              const overlay = overlays["stepseq"];
              if (infiniSeqCurrentStep < machineState.currentTrack.steps.length - 1) {
                overlay.next();
              }
              menu.setOverlay(overlay);
              _playNoteWithOpts(machineState.currentTrack.steps[infiniSeqCurrentStep].note, machineState, control);
            }
          }
        }
      },
      patternDown: function (up: boolean): void {
        if (machineState.mode == MachineMode.Note) {
          if (machineState.transportMode == TransportMode.Record) {
            const overlay = overlays["stepseq"];
            overlay.prev();
            menu.setOverlay(overlay);
            _playNoteWithOpts(machineState.currentTrack.steps[infiniSeqCurrentStep].note, machineState, control);
          }
        }
      },
      gridLeft: function (up: boolean): void {
        if (!up) {
          if (machineState.mode == MachineMode.Note) {
            machineState.keybdOctave = Math.max(1, machineState.keybdOctave - 1);
          }
        }
        _handleOctaveDisplay(machineState);
      },
      gridRight: function (up: boolean): void {
        if (!up) {
          if (machineState.mode == MachineMode.Note) {
            machineState.keybdOctave = Math.min(7, machineState.keybdOctave + 1);
          }
        }
        _handleOctaveDisplay(machineState);
      },
      step: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Step;
          _handleUpdateMode(machineState);
        }
      },
      note: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Note;
          _handleUpdateMode(machineState);
        }
      },
      drum: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Drum;
          _setModeButtonLeds(machineState.mode);
          padControl.allOff();
        }
      },
      perform: function (up: boolean): void {
        if (!up) {
          machineState.mode = MachineMode.Preform;
          _handleUpdateMode(machineState);
        }
      },
      shift: (up: boolean) => {
        if (up) {
          machineState.keyMod = KeyMod.None;
        } else {
          machineState.keyMod = KeyMod.Shift;
        }
      },
      alt: function (up: boolean): void {
        if (up) {
          machineState.keyMod = KeyMod.None;
        } else {
          machineState.keyMod = KeyMod.Alt;
        }
      }
    };

    buttons = setupButtons(bSetup);

    // clear all now that we have finished init
    allOff();

    // update pads based on initial mode
    _handleUpdateMode(machineState);

    // update solo/mute status button leds
    _setoloMuteTrackButtonLeds(machineState.tracks.map((t) => t.muted));

    // make first track (selected) current track
    machineState.currentTrack = machineState.tracks[0];

    // update row leds to show (selected) currentTrack
    _setSelectedTrackLeds(0);

    // update OLED with loaded preset
    menu.updateOled();
  }
}

function _handleOctaveDisplay(machineState: MachineState) {
  console.log("OCTAVE:" + machineState.keybdOctave)
  switch (machineState.keybdOctave) {
    case 1:
      buttons.buttonLedOn(ButtonCode.GridLeft, CCInputs.red);
      buttons.buttonLedOn(ButtonCode.GridRight, CCInputs.red);
      break;
    case 2:
      buttons.buttonLedOn(ButtonCode.GridLeft, CCInputs.red);
      buttons.buttonLedOn(ButtonCode.GridRight, 0);
      break;
    case 3:
      buttons.buttonLedOn(ButtonCode.GridLeft, CCInputs.paleRed);
      buttons.buttonLedOn(ButtonCode.GridRight, 0);
      break;
    case 4:
      buttons.buttonLedOn(ButtonCode.GridLeft, 0);
      buttons.buttonLedOn(ButtonCode.GridRight, 0);
      break;
    case 5:
      buttons.buttonLedOn(ButtonCode.GridLeft, 0);
      buttons.buttonLedOn(ButtonCode.GridRight, CCInputs.paleRed);
      break;
    case 6:
      buttons.buttonLedOn(ButtonCode.GridLeft, 0);
      buttons.buttonLedOn(ButtonCode.GridRight, CCInputs.red);
      break;
    case 7:
      buttons.buttonLedOn(ButtonCode.GridLeft, CCInputs.paleRed);
      buttons.buttonLedOn(ButtonCode.GridRight, CCInputs.paleRed);
      break;
  }
}

function _handleToggleTrackMute(machineState: MachineState, trackIndex: number) {
  console.log('handle track mute', trackIndex)
  machineState.tracks[trackIndex].toggleMute();
  _setoloMuteTrackButtonLeds(machineState.tracks.map((t) => t.muted));
}

function _handleTrackSelect(machineState: MachineState, trackIndex: number) {
  console.log('handle track sel', trackIndex)
  machineState.currentTrack = machineState.tracks[trackIndex];
  machineState.selectedStep = 0; //TODO: for now just always reset to first step
  _setSelectedTrackLeds(trackIndex);
}

function _handleUpdateMode(machineState: MachineState) {
  _setModeButtonLeds(machineState.mode);
  padControl.allOff();
  switch (machineState.mode) {
    case MachineMode.Step:

      _paintPadsSteps(machineState.tracks);
      break;
    case MachineMode.Note:
      _paintPadsNoteTracks(machineState.tracks, machineState.currentTrack);
      _paintPadsKeyboard();
      break;
  }
}

function _topMenuListItems(entries: string[], selectedFn: Function): ListScreenItem[] {
  return entries.map((x) => new ListScreenItem(x, (item: ListScreenItem) => selectedFn(item.label), {}));
}

function _handleInstrumentSelection(control: controlInterface, machineState: MachineState, instrument: string) {
  if (machineState.mode == MachineMode.Note || machineState.mode == MachineMode.Step) {
    control.selectInstrument(instrument);
  } else {
    console.log("cannot set instrument outside Step, Note mode");
  }
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

// make these 1 indexed to match button naming
function _setoloMuteTrackButtonLeds(trackMutes: boolean[]) {
  const onColor = CCInputs.rowBright;
  const muteColor = CCInputs.rowDim;
  console.log('trck mutes', trackMutes)
  buttons.buttonLedOn(ButtonCode.SoloMute1, trackMutes[0] ? muteColor : onColor);
  buttons.buttonLedOn(ButtonCode.SoloMute2, trackMutes[1] ? muteColor : onColor);
  buttons.buttonLedOn(ButtonCode.SoloMute3, trackMutes[2] ? muteColor : onColor);
  buttons.buttonLedOn(ButtonCode.SoloMute4, trackMutes[3] ? muteColor : onColor);
}

// make these 1 indexed to match button naming
function _setSelectedTrackLeds(trackNum: number) {
  const off = 0;
  const color = 1;
  [0, 1, 2, 3].forEach((x) => padControl.rowLedOff(x));
  padControl.rowLedOn(trackNum);
}

function handleDialInput(dialEvent: DialEvent, overlay: NumberOverlayScreen) {
  // button up
  if (dialEvent == DialEvent.Release) {
    menu.onBack();
  } else if (dialEvent == DialEvent.Touch) {
    menu.pushMenuScreen(overlay);
  } else if (dialEvent == DialEvent.Left) {
    overlay.prev();
    menu.updateOled();
  } else if (dialEvent == DialEvent.Right) {
    overlay.next();
    menu.updateOled();
  } else {
    console.warn('unexpected dialevent:' + dialEvent);
  }
}

function handlePad(index: number, machineState: MachineState, control: controlInterface) {
  const rowIndex = Math.floor(index / 16);
  const columnIndex = index % 16;
  //console.log("pad index:" + index + "MODE:" + machineState.mode);
  //TODO: account for grid offset
  machineState.selectedStep = index % 16;

  if (machineState.mode == MachineMode.Note) {
    // first row is track list
    if (rowIndex == 0) {
      if (!machineState.tracks[columnIndex]) {
        console.log('creating new track')
        machineState.currentTrack = control.addTrack();
        console.log('new sel track', machineState.currentTrack);
      } else {
        if (machineState.keyMod == KeyMod.Shift) {
          console.log("mute track:" + machineState.tracks[columnIndex].name)
          machineState.tracks[columnIndex].toggleMute();
        } else {
          _handleTrackSelect(machineState, columnIndex);
          console.log('pad handled track sel:' + machineState.currentTrack);
        }
      }
      // repaint pad leds to show new selected and/or newly created track
      _paintPadsNoteTracks(machineState.tracks, machineState.currentTrack);
    }

    const note = _noteFromPadIndex(machineState, index);

    _playNoteWithOpts(note, machineState, control);
    if (machineState.transportMode == TransportMode.Record) {
      const velocity = 127; //TODO: use pad velocity not hardcode value
      machineState.currentTrack.setStepNote(infiniSeqCurrentStep++, note, velocity);
      const overlay = overlays["stepseq"];
      overlay.next();
      menu.setOverlay(overlay);
    }
  }

  if (machineState.mode == MachineMode.Step) {
    const note = machineState.selectedNote;
    if (note > 0) {
      console.log(`STEP NOTE: ${note} tr:${rowIndex} stp: ${columnIndex}`);
      machineState.tracks[rowIndex].toggleStepNote(columnIndex, note, 127);
      console.log(machineState.tracks)
      _paintPadsStepsRow(machineState.tracks[rowIndex], rowIndex);
    }
  }
}

function _playNoteWithOpts(note: number, machineState: MachineState, control: controlInterface) {
  console.log('AUDITION NOTE:' + note);
  machineState.selectedNote = note;
  const opts = {
    gain: machineState.currentTrack.gain,
    duration: machineState.currentTrack.duration,
    offset: machineState.currentTrack.offset,
    attack: machineState.currentTrack.attack,
    decay: machineState.currentTrack.decay,
    sustain: machineState.currentTrack.sustain,
    release: machineState.currentTrack.release
  };
  if (note > 0) {
    control.playNote(note, opts);
  }
}

const firstBlackRow = 32;
const firstWhiteRow = 48;
const blackKeys = [0, 1, 3, 0, 6, 8, 10, 0, 13, 15, 0, 18, 20, 22, 0, 25];
const whitekeys = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26];

// chromatic keyboard, shown in Note mode
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

// show list of all tracks, 1 per top pad row, each pad in colour of the track
function _paintPadsNoteTracks(tracks: Track[], currentTrack: Track) {
  const mutedColor = { r: 30, g: 30, b: 30 };
  const tracksInFirstRow = Math.min(16, tracks.length);
  for (var i = 0; i < tracksInFirstRow; i++) {
    const track = tracks[i];
    let color = track.color;
    if (track.muted) {
      color = mutedColor; //_dim(color, 50);
    }
    if (currentTrack == track) {
      color = { r: 120, g: 120, b: 120 };
    }
    padControl.padLedOn(i, color);
  }
}

function _dim(color: Color, dimBy: number): Color {
  const r = Math.max(8, color.r - dimBy);
  const g = Math.max(8, color.g - dimBy);
  const b = Math.max(8, color.b - dimBy);
  return { r: r, g: g, b: b };
}

function _paintPadsSteps(tracks: Track[]) {
  for (let i = 0; i < tracks.length; i++) {
    _paintPadsStepsRow(tracks[i], i);
  }
}

function _paintPadsStepsRow(track: Track, rowIndex: number) {
  const steps = track.steps;
  const trackcolour = track.color;
  for (let i = 0; i < steps.length; i++) {
    const colour = (steps[i].note != 0) ? trackcolour : OFF_COLOR;
    padControl.padLedOn(i + (rowIndex * 16), colour);
  }
}

function _paintPlayHead(beatCount: number, tracks: Track[]) {
  const columnIndex = beatCount % 16;
  const trackHeadColor = { r: 120, g: 120, b: 120 };
  const trackHeadColors = [trackHeadColor, trackHeadColor, trackHeadColor, trackHeadColor];
  _paintPadsStepsColumn(columnIndex, trackHeadColors);

  const prevColumnIndex = columnIndex == 0 ? 15 : columnIndex - 1;
  const prevColumnColors = [];
  for (let i = 0; i < 4; i++) {
    prevColumnColors[i] = tracks[i].steps[prevColumnIndex].note > 0 ? tracks[i].color : OFF_COLOR;
  }

  _paintPadsStepsColumn(prevColumnIndex, prevColumnColors);
}

function _paintPadsStepsColumn(columnIndex: number, colors: Color[]) {
  for (let i = 0; i < 4; i++) {
    padControl.padLedOn(columnIndex + (i * 16), colors[i]);
  }
}

// work out note from chromatic keyboard displayed on bottom 2 rows of pads
function _noteFromPadIndex(machineState: MachineState, index: number): number {
  let midiNote = 0;
  const octaveStartingNote = (machineState.keybdOctave * 12) % 128;

  if (index <= firstBlackRow) {
    return 0;
  }

  if (index >= firstBlackRow && index < firstWhiteRow) {
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
