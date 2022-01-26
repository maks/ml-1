import { CCInputs } from "../fire_raw/cc_inputs.js";
export var TransportButton;
(function (TransportButton) {
    TransportButton[TransportButton["Play"] = 0] = "Play";
    TransportButton[TransportButton["Stop"] = 1] = "Stop";
    TransportButton[TransportButton["Record"] = 2] = "Record";
})(TransportButton || (TransportButton = {}));
export class TransportControls {
    constructor({ midi, onButton }) {
        midi.addInputListener((data) => this.onMidiMessage(data));
        this.midi = midi;
        this.buttonListener = onButton;
    }
    buttonsOn(play, stop, record) {
        this.allOff();
        if (play) {
            this.midi.send(CCInputs.on(CCInputs.play, CCInputs.green3));
        }
        if (stop) {
            this.midi.send(CCInputs.on(CCInputs.stop, CCInputs.yellow));
        }
        if (record) {
            this.midi.send(CCInputs.on(CCInputs.record, CCInputs.recRed));
        }
    }
    allOff() {
        this.midi.send(CCInputs.on(CCInputs.play, CCInputs.off));
        this.midi.send(CCInputs.on(CCInputs.record, CCInputs.off));
        this.midi.send(CCInputs.on(CCInputs.stop, CCInputs.off));
    }
    onMidiMessage(data) {
        // only handle button down for now
        if (data[0] != CCInputs.buttonDown) {
            return;
        }
        switch (data[1]) {
            case CCInputs.play:
                this.buttonListener(TransportButton.Play);
                break;
            case CCInputs.stop:
                this.buttonListener(TransportButton.Stop);
                break;
            case CCInputs.record:
                this.buttonListener(TransportButton.Record);
                break;
        }
    }
}
//# sourceMappingURL=transport.js.map