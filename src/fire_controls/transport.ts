import { CCInputs } from "../fire_raw/cc_inputs.js";
import { MidiDispatcher } from "../midi_dispatcher.js";

export class TransportControls {
  midi: MidiDispatcher;

  playListener: () => void;
  stopListener: () => void;
  recordListener: () => void;

  constructor({ midi, onPlay, onStop, onRecord }:
    {
      midi: MidiDispatcher,
      onPlay: () => void
      onStop: () => void
      onRecord: () => void
    }) {
    midi.addInputListener((data) => this.onMidiMessage(data));
    this.midi = midi;
    this.playListener = onPlay;
    this.stopListener = onStop;
    this.recordListener = onRecord;
  }


  public play() {
    this.allOff();
    this.midi.send(CCInputs.on(CCInputs.play, CCInputs.green3));
  }

  public stop() {
    this.allOff();
    this.midi.send(CCInputs.on(CCInputs.stop, CCInputs.yellow));
  }

  public record() {
    this.allOff();
    this.midi.send(CCInputs.on(CCInputs.record, CCInputs.recRed));
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
