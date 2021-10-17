import { getMidi, setupTransport, setupPads, setupOled, setupDials, setupButtons, allOff, ButtonCode } from '../firemidi.js';
import { CCInputs } from '../fire_raw/cc_inputs.js';
import { MenuController } from '../menu/menu_controller.js';
import { ListScreen, ListScreenItem, NumberOverlayScreen } from '../shiny-drums/screen_widgets.js';
const MENU_LIST_ITEMS_COUNT = 9;
const DURATION_INCREMENT = 0.1;
let oled;
let menu;
let buttons;
let dials;
let padControl;
export var KeyMod;
(function (KeyMod) {
    KeyMod[KeyMod["None"] = 0] = "None";
    KeyMod[KeyMod["Shift"] = 1] = "Shift";
    KeyMod[KeyMod["Alt"] = 2] = "Alt";
})(KeyMod || (KeyMod = {}));
export var MachineMode;
(function (MachineMode) {
    MachineMode[MachineMode["Step"] = 1] = "Step";
    MachineMode[MachineMode["Note"] = 2] = "Note";
    MachineMode[MachineMode["Drum"] = 3] = "Drum";
    MachineMode[MachineMode["Preform"] = 4] = "Preform";
    MachineMode[MachineMode["Browser"] = 5] = "Browser";
})(MachineMode || (MachineMode = {}));
export function initControls(instrumentNames, control, machineState) {
    getMidi(midiReady, (isConnected) => {
        if (isConnected) {
            console.log('reconnected');
            midiReady();
        }
    });
    function midiReady() {
        console.log('SAMPLER MIDI IS READY');
        setupTransport(control.startPlayer, control.stop, () => {
            if (machineState.keyMod == KeyMod.Shift) {
                control.save();
            }
            else {
                console.log('no save without shift mod');
            }
        });
        padControl = setupPads((index) => handlePad(index, machineState, control.playNote));
        oled = setupOled();
        const _topMenu = new ListScreen(MENU_LIST_ITEMS_COUNT, _topMenuListItems(instrumentNames, (instrumentName) => _handleInstrumentSelection(control, machineState, instrumentName)), () => {
            _topMenu.updateItems(_topMenuListItems(instrumentNames, (instrumentName) => _handleInstrumentSelection(control, machineState, instrumentName)));
        });
        menu = new MenuController(oled);
        menu.pushMenuScreen(_topMenu);
        const overlays = {
            // 'volume': new NumberOverlayScreen(
            //   "VOL", player.masterGainNode.gain["value"], 1, 0, 0.01, 0.1, (val) => { player.masterGainNode.gain["value"] = val; },
            // ),
            'pitch': new NumberOverlayScreen(`P:`, 1, 127, 1, 1, 1, (pitch) => {
                machineState.currentTrack.steps[machineState.selectedStep].note = pitch;
            })
            // ,
            // 'effects': new NumberOverlayScreen(
            //   "FX", theBeat["effectMix"], 1, 0, 0.01, 0.1, (val) => { theBeat["effectMix"] = val; player.updateEffect(); },
            // ),
        };
        dials = setupDials({
            onVolume: (dir) => {
                // handleDialInput(dir, overlays["volume"]);
            },
            onPan: (dir) => {
            },
            onFilter: (dir) => {
                if (machineState.mode == MachineMode.Step) {
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
                else if (machineState.mode == MachineMode.Note) {
                    const dur = machineState.currentTrack.duration;
                    machineState.currentTrack.duration = dir ? ((dur !== null && dur !== void 0 ? dur : 0) + DURATION_INCREMENT) : Math.min(0, (dur !== null && dur !== void 0 ? dur : 0) - DURATION_INCREMENT);
                    console.log('DUR:' + machineState.currentTrack.duration, machineState.currentTrack);
                }
                else {
                    console.log('NO FILTER YET in mode:' + machineState.mode);
                }
            },
            onResonance: (dir) => {
                // handleDialInput(dir, overlays["effects"]);
            },
            onSelect: (dir) => {
                if (dir == 2 || dir == 3) {
                    if (dir == 2) {
                        menu.onSelect();
                    }
                }
                else {
                    menu.onDial(dir);
                }
            }
        });
        const bSetup = {
            browser: (up) => {
                machineState.mode = MachineMode.Browser;
                _setModeButtonLeds(machineState.mode);
                menu.onBack();
            },
            patternUp: (up) => console.log('patternup button'),
            pattern: (up) => {
                console.log('pattern:' + up);
                if (up) {
                    // need to repaint showing menu
                    menu.updateOled();
                }
            },
            solomute1: (up) => {
                console.log('SOLO1' + up);
                if (!up) {
                    if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
                        if (machineState.keyMod == KeyMod.Shift) {
                            _handleTrackSelect(machineState, 0);
                        }
                        else {
                            _handleToggleTrackMute(machineState, 0);
                        }
                    }
                }
            },
            solomute2: (up) => {
                if (!up) {
                    if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
                        if (machineState.keyMod == KeyMod.Shift) {
                            _handleTrackSelect(machineState, 1);
                        }
                        else {
                            _handleToggleTrackMute(machineState, 1);
                        }
                    }
                }
            },
            solomute3: (up) => {
                if (!up) {
                    if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
                        if (machineState.keyMod == KeyMod.Shift) {
                            _handleTrackSelect(machineState, 2);
                        }
                        else {
                            _handleToggleTrackMute(machineState, 2);
                        }
                    }
                }
            },
            solomute4: (up) => {
                if (!up) {
                    if (machineState.mode == MachineMode.Step || machineState.mode == MachineMode.Note) {
                        if (machineState.keyMod == KeyMod.Shift) {
                            _handleTrackSelect(machineState, 3);
                        }
                        else {
                            _handleToggleTrackMute(machineState, 3);
                        }
                    }
                }
            },
            patternDown: function (up) {
                throw new Error('Function not implemented.');
            },
            gridLeft: function (up) {
                throw new Error('Function not implemented.');
            },
            gridRight: function (up) {
                throw new Error('Function not implemented.');
            },
            step: function (up) {
                if (!up) {
                    machineState.mode = MachineMode.Step;
                    _handleUpdateMode(machineState);
                }
            },
            note: function (up) {
                if (!up) {
                    machineState.mode = MachineMode.Note;
                    _handleUpdateMode(machineState);
                }
            },
            drum: function (up) {
                if (!up) {
                    machineState.mode = MachineMode.Drum;
                    _setModeButtonLeds(machineState.mode);
                    padControl.allOff();
                }
            },
            perform: function (up) {
                if (!up) {
                    machineState.mode = MachineMode.Preform;
                    _handleUpdateMode(machineState);
                }
            },
            shift: (up) => {
                if (up) {
                    machineState.keyMod = KeyMod.None;
                }
                else {
                    machineState.keyMod = KeyMod.Shift;
                }
            },
            alt: function (up) {
                if (up) {
                    machineState.keyMod = KeyMod.None;
                }
                else {
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
        // update OLED with loaded preset
        menu.updateOled();
    }
}
function _handleToggleTrackMute(machineState, trackIndex) {
    console.log('handle track mute', trackIndex);
    machineState.tracks[trackIndex].toggleMute();
    _setoloMuteTrackButtonLeds(machineState.tracks.map((t) => t.muted));
}
function _handleTrackSelect(machineState, trackIndex) {
    console.log('handle track sel', trackIndex);
    machineState.currentTrack = machineState.tracks[trackIndex];
    machineState.selectedStep = 0; //TODO: for now just always reset to first step
    _setSelectedTrackLeds(trackIndex);
}
function _handleUpdateMode(machineState) {
    _setModeButtonLeds(machineState.mode);
    padControl.allOff();
    switch (machineState.mode) {
        case MachineMode.Step:
            _paintPadsSteps(machineState.tracks);
            break;
        case MachineMode.Note:
            _paintPadsKeyboard();
            break;
    }
}
function _topMenuListItems(entries, selectedFn) {
    return entries.map((x) => new ListScreenItem(x, (item) => selectedFn(item.label), {}));
}
function _handleInstrumentSelection(control, machineState, instrument) {
    if (machineState.mode == MachineMode.Note || machineState.mode == MachineMode.Step) {
        control.selectInstrument(instrument);
    }
    else {
        console.log("cannot set instrument outside Step, Note mode");
    }
}
function _setModeButtonLeds(mode) {
    // only 1 mode on at a time
    const ledColour = CCInputs.yellow2;
    const ledOff = 0;
    const buttonStates = {};
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
function _setoloMuteTrackButtonLeds(trackMutes) {
    const onColor = CCInputs.rowBright;
    const muteColor = CCInputs.rowDim;
    console.log('trck mutes', trackMutes);
    buttons.buttonLedOn(ButtonCode.SoloMute1, trackMutes[0] ? muteColor : onColor);
    buttons.buttonLedOn(ButtonCode.SoloMute2, trackMutes[1] ? muteColor : onColor);
    buttons.buttonLedOn(ButtonCode.SoloMute3, trackMutes[2] ? muteColor : onColor);
    buttons.buttonLedOn(ButtonCode.SoloMute4, trackMutes[3] ? muteColor : onColor);
}
// make these 1 indexed to match button naming
function _setSelectedTrackLeds(trackNum) {
    const off = 0;
    const color = 1;
    [0, 1, 2, 3].forEach((x) => padControl.rowLedOff(x));
    padControl.rowLedOn(trackNum);
}
function handleDialInput(dir, overlay) {
    // button up
    if (dir == 3) {
        menu.clearOverlay();
        return;
    }
    if (dir == 0) {
        overlay.prev();
    }
    else if (dir == 1) {
        overlay.next();
    }
    menu.setOverlay(overlay);
}
function handlePad(index, machineState, callback) {
    const rowIndex = Math.floor(index / 16);
    const columnIndex = index % 16;
    console.log("pad index:" + index + "MODE:" + machineState.mode);
    //TODO: account for grid offset
    machineState.selectedStep = index % 16;
    if (machineState.mode == MachineMode.Note) {
        const note = _noteFromPadIndex(index);
        if (note > 0) {
            console.log('PLAY NOTE:' + note);
            machineState.selectedNote = note;
            const opts = {
                duration: machineState.currentTrack.duration
            };
            callback(note, opts);
        }
    }
    if (machineState.mode == MachineMode.Step) {
        const note = machineState.selectedNote;
        if (note > 0) {
            console.log(`STEP NOTE: ${note} tr:${rowIndex} stp: ${columnIndex}`);
            machineState.tracks[rowIndex].toggleStepNote(columnIndex, note, 127);
            console.log(machineState.tracks);
            _paintPadsStepsRow(machineState.tracks[rowIndex], rowIndex);
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
function _paintPadsSteps(tracks) {
    for (let i = 0; i < tracks.length; i++) {
        _paintPadsStepsRow(tracks[i], i);
    }
}
function _paintPadsStepsRow(track, rowIndex) {
    const steps = track.steps;
    const trackcolour = track.color;
    const off = { r: 0, g: 0, b: 0 };
    for (let i = 0; i < steps.length; i++) {
        const colour = (steps[i].note != 0) ? trackcolour : off;
        padControl.padLedOn(i + (rowIndex * 16), colour);
    }
}
// work out note from chromatic keyboard displayed on bottom 2 rows of pads
function _noteFromPadIndex(index) {
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
    }
    else {
        midiNote = octaveStartingNote + whitekeys[index % 16];
    }
    return midiNote;
}
