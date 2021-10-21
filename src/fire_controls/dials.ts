import { CCInputs } from "../fire_raw/cc_inputs.js";
import { MidiDispatcher } from "../midi_dispatcher.js";

export enum DialEvent {
  Left,
  Right,
  Touch,
  Release
}

export type dialCallback = (dir: DialEvent) => void;

export class DialControls {
  volumeListener: dialCallback;
  panListener: dialCallback;
  filterListener: dialCallback;
  resonanceListener: dialCallback;
  selectListener: dialCallback;

  constructor({ midi, onVolume, onPan, onFilter, onResonance, onSelect }:
    {
      midi: MidiDispatcher,
      onVolume: dialCallback,
      onPan: dialCallback,
      onFilter: dialCallback,
      onResonance: dialCallback,
      onSelect: dialCallback
    }) {
    midi.addInputListener((e) => this.onMidiData(e));
    this.volumeListener = onVolume;
    this.panListener = onPan;
    this.filterListener = onFilter;
    this.resonanceListener = onResonance;
    this.selectListener = onSelect;
  }

  private onMidiData(data: Uint8Array) {
    if (data[0] != CCInputs.dialRotate &&
      data[0] != CCInputs.buttonDown &&
      data[0] != CCInputs.buttonUp) {
      return;
    }
    let event: DialEvent;
    if (data[0] == CCInputs.dialRotate) {
      event = data[2] == CCInputs.rotateLeft ? DialEvent.Left : DialEvent.Right;
    } else {
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
