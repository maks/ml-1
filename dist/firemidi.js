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
// the optional bool return val from the onX callbacks means
// if ===true, clear all transport button leds
export function setupTransport(onPlay, onStop, onRecord) {
    const transport = new TransportControls({
        midi: dispatcher,
        onPlay: () => {
            console.log('ts play');
            transport.play();
            const clear = onPlay();
            if (clear === true) {
                transport.allOff();
            }
        },
        onStop: () => {
            transport.stop();
            const clear = onStop();
            if (clear === true) {
                transport.allOff();
            }
        },
        onRecord: () => {
            transport.record();
            const clear = onRecord();
            if (clear === true) {
                transport.allOff();
            }
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
        },
        rowLedOn: (rowIndex) => {
            firePads.rowLedOn(rowIndex);
        },
        rowLedOff: (rowIndex) => {
            firePads.rowLedOff(rowIndex);
        },
        allOff: () => { firePads.allOff(); }
    };
}
export function setupOled() {
    oled = new OledScreen(midiOutput);
    return {
        heading: oledHeading,
        text: oledText,
        clear: oledClear,
        big: oledBigText,
        bigTitled: oledBigWithTitle,
        send: oledSendBitmap,
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
export function setupButtons({ browser, patternUp, patternDown, gridLeft, gridRight, step, note, drum, perform, shift, alt, pattern, solomute1, solomute2, solomute3, solomute4 }) {
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
                case ButtonCode.SoloMute1:
                    solomute1(up);
                    break;
                case ButtonCode.SoloMute2:
                    solomute2(up);
                    break;
                case ButtonCode.SoloMute3:
                    solomute3(up);
                    break;
                case ButtonCode.SoloMute4:
                    solomute4(up);
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
function oledClear() {
    oled.clear();
}
function oledBigText(text) {
    oled.bigText(text);
}
function oledSendBitmap() {
    oled.sendBitmap();
}
function oledBigWithTitle(title, value) {
    oled.heading(title);
    oled.bigText(value);
}
export function getMidi(midiReadyCallback, midiStateChange) {
    navigator.requestMIDIAccess({ sysex: true })
        .then(function (midiAccess) {
        console.log("MIDI Access Ready, getting input, outputs...");
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
        midiOutput.onstatechange = (state) => {
            console.log("state change:", state);
            //TODO: callback if connect event for a Fire
            //midiStateChange((state.isTrusted && state.target instanceof  WebMidi.MIDIOutput));
        };
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
//# sourceMappingURL=firemidi.js.map