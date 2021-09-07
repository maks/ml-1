import { CCInputs } from "../fire_raw/cc_inputs.js";
export var ButtonCode;
(function (ButtonCode) {
    ButtonCode[ButtonCode["Browser"] = CCInputs.browser] = "Browser";
    ButtonCode[ButtonCode["PatternUp"] = CCInputs.patternUp] = "PatternUp";
    ButtonCode[ButtonCode["PatternDown"] = CCInputs.patternDown] = "PatternDown";
    ButtonCode[ButtonCode["GridLeft"] = CCInputs.gridLeft] = "GridLeft";
    ButtonCode[ButtonCode["GridRight"] = CCInputs.gridRight] = "GridRight";
    ButtonCode[ButtonCode["Step"] = CCInputs.step] = "Step";
    ButtonCode[ButtonCode["Note"] = CCInputs.note] = "Note";
    ButtonCode[ButtonCode["Drum"] = CCInputs.drum] = "Drum";
    ButtonCode[ButtonCode["Perform"] = CCInputs.perform] = "Perform";
    ButtonCode[ButtonCode["Shift"] = CCInputs.shift] = "Shift";
    ButtonCode[ButtonCode["Alt"] = CCInputs.alt] = "Alt";
    ButtonCode[ButtonCode["Pattern"] = CCInputs.pattern] = "Pattern";
})(ButtonCode || (ButtonCode = {}));
// all the buttons not transport controls or pad grid
export class ButtonControls {
    constructor({ midi, onButton }) {
        midi.addInputListener((data) => this.onMidiMessage(data));
        this.midi = midi;
        this.buttonListener = onButton;
    }
    buttonOn(button, ledColour) {
        const colour = 1;
        this.midi.send(CCInputs.on(button, colour));
    }
    onMidiMessage(data) {
        // console.log('midi:', data);
        if (data[1] >= CCInputs.patternUp && data[1] <= CCInputs.pattern) {
            // only handle button down for now
            if (data[0] == CCInputs.buttonDown) {
                this.buttonListener(data[1]);
            }
        }
    }
}
