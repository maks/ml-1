import { CCInputs } from "../fire_raw/cc_inputs.js";
export var DialEvent;
(function (DialEvent) {
    DialEvent[DialEvent["Left"] = 0] = "Left";
    DialEvent[DialEvent["Right"] = 1] = "Right";
    DialEvent[DialEvent["Touch"] = 2] = "Touch";
    DialEvent[DialEvent["Release"] = 3] = "Release";
})(DialEvent || (DialEvent = {}));
export class DialControls {
    constructor({ midi, onVolume, onPan, onFilter, onResonance, onSelect }) {
        midi.addInputListener((e) => this.onMidiData(e));
        this.volumeListener = onVolume;
        this.panListener = onPan;
        this.filterListener = onFilter;
        this.resonanceListener = onResonance;
        this.selectListener = onSelect;
    }
    onMidiData(data) {
        if (data[0] != CCInputs.dialRotate &&
            data[0] != CCInputs.buttonDown &&
            data[0] != CCInputs.buttonUp) {
            return;
        }
        let event;
        console.log(`raw dial [${data[0]},${data[1]},${data[2]}]`);
        if (data[0] == CCInputs.dialRotate) {
            event = data[2];
        }
        else {
            event = data[2] == CCInputs.dialTouchOn ? DialEvent.Touch : DialEvent.Release;
        }
        switch (data[1]) {
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
//# sourceMappingURL=dials.js.map