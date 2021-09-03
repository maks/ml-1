export let midiOutput;
export let midiInput;
export * from "./fire_raw/controlbank_led.js";
export { TransportControls } from "./fire_controls/transport.js";
import { PadControls, RowButtonState } from "./fire_controls/pads.js";
import { clearAll } from "./fire_controls/device.js";
import { MidiDispatcher } from "./midi_dispatcher.js";
import { TrackHead } from "./fire_controls/track_head.js";
import { TransportControls } from "./fire_controls/transport.js";
export let dispatcher;
export let firePads;
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
    // let ticker: number | null = null;
    // const t = new TransportControls({
    //   midi: dispatcher,
    //   onPlay: () => {
    //     t.play();
    //     if (ticker) {
    //       console.log('Pause')
    //       clearInterval(ticker);
    //       ticker = null;
    //     } else {
    //       console.log('Play');
    //       head.start();
    //       ticker = setInterval(tick, 1000);
    //     }
    //   },
    //   onStop: () => {
    //     console.log('Stop')
    //     t.stop();
    //     head.reset();
    //     head.start();
    //     if (ticker) {
    //       clearInterval(ticker);
    //       ticker = null;
    //     }
    //   },
    //   onRecord: () => {
    //     console.log('Rec');
    //     t.record();
    //   },
    // });
    // t.allOff();
    firePads = new PadControls({
        midi: dispatcher,
        onPad: (index) => {
            console.log('PAD:' + index);
            firePads.padLedOn(index, { r: 0, g: 0, b: 100 });
        }
    });
    firePads.allOff();
    const head = new TrackHead(firePads);
    function tick() {
        head.next();
    }
}
export function testsolo(track) {
    firePads.rowButtonLed(track, RowButtonState.Off);
}
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
        for (const input of inputs) {
            console.log(input);
            midiInput = input;
        }
        midiOutput.onstatechange = (state) => console.log("state change:" + state);
        dispatcher = new MidiDispatcher(midiInput, midiOutput);
        midiReadyCallback();
    });
}
export function allOff() { clearAll(midiOutput); }
