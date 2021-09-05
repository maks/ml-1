import { CCInputs } from "../fire_raw/cc_inputs.js";
var DialEvent;
(function (DialEvent) {
    DialEvent[DialEvent["Left"] = 0] = "Left";
    DialEvent[DialEvent["Right"] = 1] = "Right";
    DialEvent[DialEvent["Touch"] = 2] = "Touch";
    DialEvent[DialEvent["Release"] = 3] = "Release";
})(DialEvent || (DialEvent = {}));
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
        if (mesg.data[0] != CCInputs.dialRotate &&
            mesg.data[0] != CCInputs.buttonDown &&
            mesg.data[0] != CCInputs.buttonUp) {
            return;
        }
        let event;
        if (mesg.data[0] == CCInputs.dialRotate) {
            event = mesg.data[2] == CCInputs.rotateLeft ? DialEvent.Left : DialEvent.Right;
        }
        else {
            event = mesg.data[2] == CCInputs.dialTouchOn ? DialEvent.Touch : DialEvent.Release;
        }
        switch (mesg.data[1]) {
            case CCInputs.volume:
                this.volumeListener(event);
                break;
            case CCInputs.pan:
                this.panListener(event);
                break;
            case CCInputs.filter:
                this.filterListener(event);
                break;
            case CCInputs.resonance:
                this.resonanceListener(event);
                break;
            case CCInputs.select:
                this.selectListener(event);
                break;
            case CCInputs.selectDown:
                this.selectListener(event);
                break;
        }
    }
}
