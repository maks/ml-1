export let midiOutput;
export * from "./fire_raw/controlbank_led.js";
export { TransportControls } from "./fire_controls/transport.js";
export { ButtonCode } from "./fire_controls/buttons.js";
import { PadControls } from "./fire_controls/pads.js";
import { clearAll } from "./fire_controls/device.js";
import { OledScreen } from "./fire_controls/oled.js";
import { MidiDispatcher } from "./midi_dispatcher.js";
import { TrackHead } from "./fire_controls/track_head.js";
import { TransportControls } from "./fire_controls/transport.js";
import { DialControls } from "./fire_controls/dials.js";
import { ButtonControls, ButtonCode } from "./fire_controls/buttons.js";
export let dispatcher;
let firePads;
let oled;
let dials;
let buttons;
//TODO: make config param in future
const BAR_LENGTH = 16;
export function setupTransport(onPlay, onStop, onRecord) {
    const transport = new TransportControls({
        midi: dispatcher,
        onPlay: () => {
            console.log('ts play');
            transport.play();
            onPlay();
        },
        onStop: () => {
            transport.stop();
            onStop();
        },
        onRecord: () => {
            transport.record();
            onRecord();
        },
    });
}
export function setupPads(onPad) {
    firePads = new PadControls({
        midi: dispatcher,
        onPad: (index) => {
            console.log('PAD:' + index);
            onPad(index);
        }
    });
    firePads.allOff();
    const head = new TrackHead(firePads, BAR_LENGTH);
    return {
        nextBeat: () => { head.next(); },
        resetBeat: () => { head.reset(); },
        padLedOn: (padIndex, colour) => {
            firePads.padLedOn(padIndex, colour);
        }
    };
}
export function setupOled() {
    oled = new OledScreen(midiOutput);
    return {
        heading: oledHeading,
        text: oledText
    };
}
export function setupDials({ onVolume, onPan, onFilter, onResonance, onSelect }) {
    dials = new DialControls({
        midi: dispatcher,
        onVolume: onVolume,
        onPan: onPan,
        onFilter: onFilter,
        onResonance: onResonance,
        onSelect: onSelect
    });
}
export function setupButtons({ browser, patternUp, patternDown, gridLeft, gridRight, step, note, drum, perform, shift, alt, pattern }) {
    buttons = new ButtonControls({
        midi: dispatcher,
        onButton: (code, up) => {
            switch (code) {
                case ButtonCode.Browser:
                    browser(up);
                    break;
                case ButtonCode.PatternUp:
                    patternUp(up);
                    break;
                case ButtonCode.PatternDown:
                    patternDown(up);
                    break;
                case ButtonCode.GridLeft:
                    gridLeft(up);
                    break;
                case ButtonCode.GridRight:
                    gridRight(up);
                    break;
                case ButtonCode.Step:
                    step(up);
                    break;
                case ButtonCode.Note:
                    note(up);
                    break;
                case ButtonCode.Drum:
                    drum(up);
                    break;
                case ButtonCode.Perform:
                    perform(up);
                    break;
                case ButtonCode.Shift:
                    shift(up);
                    break;
                case ButtonCode.Alt:
                    alt(up);
                    break;
                case ButtonCode.Pattern:
                    pattern(up);
                    break;
            }
        }
    });
    return {
        buttonLedOn: (button, colour) => {
            buttons.buttonOn(button, colour);
        }
    };
}
function oledHeading(heading) {
    oled.heading(heading);
}
function oledText(line, text, highlight) {
    oled.textline(line, highlight !== null && highlight !== void 0 ? highlight : false, text);
}
// export function testsolo(track: number) {
//   firePads.rowButtonLed(track, RowButtonState.Off)
// }
export function getMidi(midiReadyCallback) {
    navigator.requestMIDIAccess({ sysex: true })
        .then(function (midiAccess) {
        const outputs = midiAccess.outputs.values();
        const inputs = midiAccess.inputs.values();
        console.log(outputs);
        for (const output of outputs) {
            console.log(output);
            midiOutput = output;
        }
        console.log(inputs);
        let midiInput;
        for (const input of inputs) {
            console.log(input);
            midiInput = input;
        }
        midiOutput.onstatechange = (state) => console.log("state change:" + state);
        if (midiInput != null) {
            dispatcher = new MidiDispatcher(midiInput, midiOutput);
        }
        else {
            console.error("== MISSING midiInput cannot create Dispatcher ==");
        }
        midiReadyCallback();
    });
}
export function allOff() { clearAll(midiOutput); }
