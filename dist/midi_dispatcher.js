export class MidiDispatcher {
    constructor(midiInput, midiOutput) {
        this.listeners = [];
        this.midiInput = midiInput;
        this.midiOutput = midiOutput;
        const me = this;
        midiInput.onmidimessage = function (mesg) { me.listenMidi(mesg); };
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
    send(data) {
        this.midiOutput.send(data);
    }
}
