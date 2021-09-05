import { CCInputs } from "../fire_raw/cc_inputs.js";

enum DialEvent {
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

  constructor({ midiInput, onVolume, onPan, onFilter, onResonance, onSelect }:
    {
      midiInput: WebMidi.MIDIInput,
      onVolume: dialCallback,
      onPan: dialCallback,
      onFilter: dialCallback,
      onResonance: dialCallback,
      onSelect: dialCallback
    }) {
    midiInput.onmidimessage = (e) => this.onMidiMessage(e);
    this.volumeListener = onVolume;
    this.panListener = onPan;
    this.filterListener = onFilter;
    this.resonanceListener = onResonance;
    this.selectListener = onSelect;
  }

  private onMidiMessage(mesg: WebMidi.MIDIMessageEvent) {
    if (mesg.data[0] != CCInputs.dialRotate &&
      mesg.data[0] != CCInputs.buttonDown &&
      mesg.data[0] != CCInputs.buttonUp) {
      return;
    }
    let event: DialEvent;
    if (mesg.data[0] == CCInputs.dialRotate) {
      event = mesg.data[2] == CCInputs.rotateLeft ? DialEvent.Left : DialEvent.Right;
    } else {
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
