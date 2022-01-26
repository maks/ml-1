import { Color } from "../app/globals.js";
import { CCInputs } from "../fire_raw/cc_inputs.js";
import { MidiDispatcher } from "../midi_dispatcher.js";

export enum TransportButton {
  Play, Stop, Record
}

export class TransportControls {
  midi: MidiDispatcher;

  buttonListener: (button: TransportButton) => void;

  constructor({ midi, onButton }:
    {
      midi: MidiDispatcher,
      onButton: (button: TransportButton) => void
    }) {
    midi.addInputListener((data) => this.onMidiMessage(data));
    this.midi = midi;
    this.buttonListener = onButton;
  }

  public buttonsOn(play: boolean, stop: boolean, record: boolean) {
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

  public allOff() {
    this.midi.send(CCInputs.on(CCInputs.play, CCInputs.off));
    this.midi.send(CCInputs.on(CCInputs.record, CCInputs.off));
    this.midi.send(CCInputs.on(CCInputs.stop, CCInputs.off));
  }

  private onMidiMessage(data: Uint8Array) {
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
