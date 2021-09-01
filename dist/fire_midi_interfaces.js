class MidiDispatcher {
    constructor(midiInput, midiOutput) {
        this.listeners = [];
        this.midiInput = midiInput;
        this.midiOutput = midiOutput;
        midiInput.onmidimessage = this.listenMidi;
    }
    listenMidi(mesg) {
        console.log(`Midi mesg data: ${mesg.data}`);
        this.listeners.forEach(listener => {
            listener(mesg.data);
        });
    }
    addInputListener(listener) {
        this.listeners.push(listener);
    }
    sendMessage(data) {
        this.midiOutput.send(data);
    }
}
export {};
