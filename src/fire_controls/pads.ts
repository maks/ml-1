import { CCInputs } from "../fire_raw/cc_inputs.js";
import { colorPad, allPadsColor } from "../fire_raw/pads.js";
import { MidiDispatcher } from "../midi_dispatcher.js";

export enum RowButtonState {
  Off, Mute, Solo
}

interface PadColour { r: number, g: number, b: number };

export class PadControls {
  private midi: MidiDispatcher;
  padListener: (index: number) => void;
  private defaultColor: PadColour = { r: 100, g: 100, b: 100 };

  constructor({ midi, onPad: padListener }:
    {
      midi: MidiDispatcher,
      onPad: (index: number) => void
    }) {
    midi.addInputListener((data) => this.onMidiMessage(data));
    this.midi = midi;
    this.padListener = padListener;
  }

  public padLedOn(padIndex: number, colour?: PadColour) {
    colorPad(this.midi, padIndex, colour ?? this.defaultColor);
  }

  public rowButtonLed(row: number, state: RowButtonState) {
    this.midi.send(CCInputs.on(CCInputs.muteButton1 + row, state));
  }

  public rowLedOn(row: number) {
    const defaultColour = CCInputs.rowGreen;
    this.midi.send(CCInputs.on(CCInputs.row0Led + row, defaultColour));
  }

  public rowLedOff(row: number) {
    this.midi.send(CCInputs.on(CCInputs.row0Led + row, 0));
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