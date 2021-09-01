import { CCInputs } from "../fire_raw/cc_inputs.js";

enum DialDirection {
  Left,
  Right,
}

export class DialControls {
  volumeListener: (dir: DialDirection) => void;
  panListener: (dir: DialDirection) => void;
  filterListener: (dir: DialDirection) => void;
  resonanceListener: (dir: DialDirection) => void;
  selectListener: (dir: DialDirection) => void;

  constructor({ midiInput, onVolume, onPan, onFilter, onResonance, onSelect }:
    {
      midiInput: WebMidi.MIDIInput,
      onVolume: () => void,
      onPan: () => void,
      onFilter: () => void,
      onResonance: () => void,
      onSelect: () => void
    }) {
    midiInput.onmidimessage = (e) => this.onMidiMessage(e);
    this.volumeListener = onVolume;
    this.panListener = onPan;
    this.filterListener = onFilter;
    this.resonanceListener = onResonance;
    this.selectListener = onSelect;
  }

  private onMidiMessage(mesg: WebMidi.MIDIMessageEvent) {
    // only handle button down for now
    if (mesg.data[0] != CCInputs.buttonDown) {
      return;
    }
    const dir: DialDirection = CCInputs.rotateLeft ? DialDirection.Left : DialDirection.Right;
    switch (mesg.data[1]) {
      case CCInputs.volume:
        this.volumeListener(dir);
        break;
      case CCInputs.pan:
        this.panListener(dir);
        break;
      case CCInputs.filter:
        this.filterListener(dir);
        break;
      case CCInputs.resonance:
        this.resonanceListener(dir);
        break;
      case CCInputs.select:
        this.selectListener(dir);
        break;
    }
  }
}
