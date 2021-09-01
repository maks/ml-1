import { CCInputs } from "../fire_raw/cc_inputs.js";
export class TransportControls {
    constructor({ midi, onPlay, onStop, onRecord }) {
        midi.addInputListener((data) => this.onMidiMessage(data));
        this.midi = midi;
        this.playListener = onPlay;
        this.stopListener = onStop;
        this.recordListener = onRecord;
    }
    play() {
        this.allOff();
        this.midi.send(CCInputs.on(CCInputs.play, CCInputs.green3));
    }
    stop() {
        this.allOff();
        this.midi.send(CCInputs.on(CCInputs.stop, CCInputs.yellow));
    }
    record() {
        this.allOff();
        this.midi.send(CCInputs.on(CCInputs.record, CCInputs.recRed));
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
