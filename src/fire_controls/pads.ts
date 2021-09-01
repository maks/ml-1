import { CCInputs } from "../fire_raw/cc_inputs.js";
import { colorPad, allPadsColor } from "../fire_raw/pads.js";
import { MidiDispatcher } from "../midi_dispatcher.js";

export class PadControls {
  private midi: MidiDispatcher;
  padListener: (index: number) => void;
  private defaultColor = { r: 50, g: 50, b: 100 };

  constructor({ midi, onPad: padListener }:
    {
      midi: MidiDispatcher,
      onPad: (index: number) => void
    }) {
    midi.addInputListener((data) => this.onMidiMessage(data));
    this.midi = midi;
    this.padListener = padListener;
  }

  public ledOn(padIndex: number) {
    colorPad(this.midi, padIndex, this.defaultColor);
  }

  public allOff() {
    allPadsColor(this.midi, { r: 0, g: 0, b: 0 });
  }

  private onMidiMessage(data: Uint8Array) {
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