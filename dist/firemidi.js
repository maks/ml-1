export let midiOutput;
export let midiInput;
export * from "./fire_raw/controlbank_led.js";
export * from "./oled/mono_canvas.js";
export * from "./oled/oled_font57.js";
import { font5x7 } from "./oled/oled_font57.js";
import { Oled } from "./oled/mono_canvas.js";
import { sendSysexBitmap } from "./fire_raw/fire_oled.js";
import { CCInputs } from "./fire_raw/cc_inputs.js";
import { colorPad, allPadsColor } from "./fire_raw/pads.js";
const lineHeight = 8;
const font = font5x7;
const oledBitmap = new Oled(64, 128);
export function drawHeading(heading) {
    oledBitmap.clear();
    oledBitmap.setCursor(0, 0);
    oledBitmap.writeString(font, 1, heading, true, true, 1);
    oledBitmap.setCursor(0, lineHeight);
    oledBitmap.writeString(font, 1, '='.repeat(heading.length), true, true, 1);
    sendSysexBitmap(midiOutput, oledBitmap.bitmap);
}
export function testDraw() {
    oledBitmap.clear();
    oledBitmap.setCursor(20, 20);
    oledBitmap.drawRect(0, 0, 30, 40, true);
    sendSysexBitmap(midiOutput, oledBitmap.bitmap);
}
export function testTransport() {
    const t = new TransportControls({
        midiInput: midiInput,
        midiOutput: midiOutput,
        onPlay: () => {
            console.log('Play');
            t.play();
        },
        onStop: () => {
            console.log('Stop');
            t.stop();
        },
        onRecord: () => {
            console.log('Rec');
            t.record();
        },
    });
    t.allOff();
    const p = new PadControls({
        midiInput: midiInput,
        midiOutput: midiOutput,
        onPad: (index) => {
            console.log('PAD:' + index);
            p.ledOn(index);
        }
    });
    p.allOff();
}
export function getMidi() {
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
        for (const input of inputs) {
            console.log(input);
            midiInput = input;
        }
        midiOutput.onstatechange = (state) => console.log("state change:" + state);
        midiInput.onmidimessage = listenMidi;
    });
}
export function listenMidi(mesg) {
    console.log(`Midi mesg data: ${mesg.data}`);
}
export function clearAll() {
    midiOutput.send([0xB0, 0x7F, 0]);
}
export class TransportControls {
    constructor({ midiInput, midiOutput, onPlay, onStop, onRecord }) {
        midiInput.onmidimessage = (e) => this.onMidiMessage(e);
        this.midiOutput = midiOutput;
        this.playListener = onPlay;
        this.stopListener = onStop;
        this.recordListener = onRecord;
    }
    play() {
        this.allOff();
        midiOutput.send(CCInputs.on(CCInputs.play, CCInputs.green3));
    }
    stop() {
        this.allOff();
        midiOutput.send(CCInputs.on(CCInputs.stop, CCInputs.yellow));
    }
    record() {
        this.allOff();
        midiOutput.send(CCInputs.on(CCInputs.record, CCInputs.recRed));
    }
    allOff() {
        midiOutput.send(CCInputs.on(CCInputs.play, CCInputs.off));
        midiOutput.send(CCInputs.on(CCInputs.record, CCInputs.off));
        midiOutput.send(CCInputs.on(CCInputs.stop, CCInputs.off));
    }
    onMidiMessage(mesg) {
        // only handle button down for now
        if (mesg.data[0] != CCInputs.buttonDown) {
            return;
        }
        switch (mesg.data[1]) {
            case CCInputs.play:
                this.playListener();
                break;
            case CCInputs.stop:
                this.stopListener();
                break;
            case CCInputs.record:
                this.recordListener();
                break;
        }
    }
}
var DialDirection;
(function (DialDirection) {
    DialDirection[DialDirection["Left"] = 0] = "Left";
    DialDirection[DialDirection["Right"] = 1] = "Right";
})(DialDirection || (DialDirection = {}));
export class DialControls {
    constructor({ midiInput, onVolume, onPan, onFilter, onResonance, onSelect }) {
        midiInput.onmidimessage = (e) => this.onMidiMessage(e);
        this.volumeListener = onVolume;
        this.panListener = onPan;
        this.filterListener = onFilter;
        this.resonanceListener = onResonance;
        this.selectListener = onSelect;
    }
    onMidiMessage(mesg) {
        // only handle button down for now
        if (mesg.data[0] != CCInputs.buttonDown) {
            return;
        }
        const dir = CCInputs.rotateLeft ? DialDirection.Left : DialDirection.Right;
        switch (mesg.data[1]) {
            case CCInputs.volume:
                this.volumeListener(dir);
                break;
            case CCInputs.pan:
                this.panListener(dir);
                break;
            case CCInputs.filter:
                this.filterListener(dir);
                break;
            case CCInputs.resonance:
                this.resonanceListener(dir);
                break;
            case CCInputs.select:
                this.selectListener(dir);
                break;
        }
    }
}
export class PadControls {
    constructor({ midiInput, midiOutput, onPad: padListener }) {
        this.defaultColor = { r: 50, g: 50, b: 100 };
        midiInput.onmidimessage = (e) => this.onMidiMessage(e);
        this.midiOutput = midiOutput;
        this.padListener = padListener;
    }
    ledOn(padIndex) {
        colorPad(midiOutput, padIndex, this.defaultColor);
    }
    allOff() {
        allPadsColor(midiOutput, { r: 0, g: 0, b: 0 });
    }
    onMidiMessage(mesg) {
        // only handle button down for now
        if (mesg.data[0] != CCInputs.buttonDown) {
            return;
        }
        const noteVal = mesg.data[1];
        if (noteVal >= CCInputs.firstPad && noteVal <= CCInputs.lastPad) {
            this.padListener(noteVal - CCInputs.firstPad);
        }
    }
}
