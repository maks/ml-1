export let midiOutput;
export let midiInput;
export * from "./fire_raw/controlbank_led.js";
import { TransportControls } from "./fire_controls/transport.js";
import { PadControls, RowButtonState } from "./fire_controls/pads.js";
import { clearAll } from "./fire_controls/device.js";
import { MidiDispatcher } from "./midi_dispatcher.js";
export function allOff() { clearAll(midiOutput); }
export let dispatcher;
export let pads;
export function testTransport() {
    const t = new TransportControls({
        midi: dispatcher,
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
    pads = new PadControls({
        midi: dispatcher,
        onPad: (index) => {
            console.log('PAD:' + index);
            pads.padLedOn(index);
        }
    });
    pads.allOff();
}
export function testsolo(track) {
    pads.rowButtonLed(track, RowButtonState.Off);
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
        dispatcher = new MidiDispatcher(midiInput, midiOutput);
    });
}
