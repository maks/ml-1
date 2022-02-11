export type OnMidiMessageFunction = (data: Uint8Array) => void;

export class MidiDispatcher {
  private listeners: OnMidiMessageFunction[];
  private midiInput: WebMidi.MIDIInput;
  private midiOutput: WebMidi.MIDIOutput;

  constructor(midiInput: WebMidi.MIDIInput, midiOutput: WebMidi.MIDIOutput) {
    this.listeners = [];
    this.midiInput = midiInput;
    this.midiOutput = midiOutput;

    const me = this;

    midiInput.onmidimessage = function (mesg) { me.listenMidi(mesg) };
  }

  private listenMidi(mesg: WebMidi.MIDIMessageEvent) {
    console.log(`Midi mesg data: ${mesg.data}`);

    this.listeners.forEach(listener => {
      listener(mesg.data);
    });
  }


  addInputListener(listener: OnMidiMessageFunction) {
    this.listeners.push(listener);
  }

  send(data: number[]) {
    this.midiOutput.send(data);
  }

}
