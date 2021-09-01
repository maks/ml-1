import { CCInputs } from "../fire_raw/cc_inputs.js";
import { colorPad, allPadsColor } from "../fire_raw/pads.js";
export class PadControls {
    constructor({ midi, onPad: padListener }) {
        this.defaultColor = { r: 50, g: 50, b: 100 };
        midi.addInputListener((data) => this.onMidiMessage(data));
        this.midi = midi;
        this.padListener = padListener;
    }
    ledOn(padIndex) {
        colorPad(this.midi, padIndex, this.defaultColor);
    }
    allOff() {
        allPadsColor(this.midi, { r: 0, g: 0, b: 0 });
    }
    onMidiMessage(data) {
        // only handle button down for now
        if (data[0] != CCInputs.buttonDown) {
            return;
        }
        const noteVal = data[1];
        if (noteVal >= CCInputs.firstPad && noteVal <= CCInputs.lastPad) {
            this.padListener(noteVal - CCInputs.firstPad);
        }
    }
}
