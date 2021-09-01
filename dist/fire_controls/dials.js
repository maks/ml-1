import { CCInputs } from "../fire_raw/cc_inputs.js";
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
