import { CCInputs } from "../fire_raw/cc_inputs.js";
import { colorPad, allPadsColor } from "../fire_raw/pads.js";
export var RowButtonState;
(function (RowButtonState) {
    RowButtonState[RowButtonState["Off"] = 0] = "Off";
    RowButtonState[RowButtonState["Mute"] = 1] = "Mute";
    RowButtonState[RowButtonState["Solo"] = 2] = "Solo";
})(RowButtonState || (RowButtonState = {}));
;
export class PadControls {
    constructor({ midi, onPad: padListener }) {
        this.defaultColor = { r: 100, g: 100, b: 100 };
        midi.addInputListener((data) => this.onMidiMessage(data));
        this.midi = midi;
        this.padListener = padListener;
    }
    padLedOn(padIndex, colour) {
        colorPad(this.midi, padIndex, colour !== null && colour !== void 0 ? colour : this.defaultColor);
    }
    rowButtonLed(row, state) {
        this.midi.send(CCInputs.on(CCInputs.muteButton1 + row, state));
    }
    rowLedOn(row) {
        const defaultColour = CCInputs.rowGreen;
        this.midi.send(CCInputs.on(CCInputs.row0Led + row, defaultColour));
    }
    rowLedOff(row) {
        this.midi.send(CCInputs.on(CCInputs.row0Led + row, 0));
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
