import { CCInputs } from "../fire_raw/cc_inputs.js";
import { MidiDispatcher } from "../midi_dispatcher.js";

export enum ButtonCode {
  Browser = CCInputs.browser,
  PatternUp = CCInputs.patternUp,
  PatternDown = CCInputs.patternDown,
  GridLeft = CCInputs.gridLeft,
  GridRight = CCInputs.gridRight,
  Step = CCInputs.step,
  Note = CCInputs.note,
  Drum = CCInputs.drum,
  Perform = CCInputs.perform,
  Shift = CCInputs.shift,
  Alt = CCInputs.alt,
  Pattern = CCInputs.pattern
}

type OnButtonCallback = (button: ButtonCode) => void;

// all the buttons not transport controls or pad grid
export class ButtonControls {
  midi: MidiDispatcher;

  buttonListener: OnButtonCallback;

  constructor({ midi, onButton }:
    {
      midi: MidiDispatcher,
      onButton: OnButtonCallback
    }) {
    midi.addInputListener((data) => this.onMidiMessage(data));
    this.midi = midi;
    this.buttonListener = onButton;
  }

  public buttonOn(button: ButtonCode, ledColour?: number) {
    const colour = 1;
    this.midi.send(CCInputs.on(button, colour));
  }

  private onMidiMessage(data: Uint8Array) {
    // console.log('midi:', data);
    if (data[1] >= CCInputs.patternUp && data[1] <= CCInputs.pattern) {
      // only handle button down for now
      if (data[0] == CCInputs.buttonDown) {
        this.buttonListener(data[1]);
      }
    }
  }
}