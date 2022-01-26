import * as Tone from "https://unpkg.com/tone@14.7.77/build/esm/index.js?module";
import { getMidi, setupTransport, setupPads } from '../firemidi.js';
import { ButtonControls } from "../fire_controls/buttons.js";
import { AppMode } from "./globals.js";
let synth = new Tone.Synth().toDestination();
export class Main {
    constructor(dispatcher) {
        this.appState = {
            mode: AppMode.Step,
            shift: false,
            alt: false,
            selectedPads: []
        };
        getMidi((disp) => this._midiReady(disp), (isConnected) => {
            if (isConnected) {
                console.log('reconnected');
                //TODO: call this._midiReady
            }
        });
    }
    _midiReady(dispatcher) {
        console.log('Main: Midi is ready: ', dispatcher);
        this.dispatcher = dispatcher;
        this.buttonControl = new ButtonControls({
            midi: this.dispatcher, onButton: (button, up) => {
                console.log('button:', button, up);
            }
        });
        this.padControl = setupPads((index) => this.handlePad(index));
        // pass in callbacks which will be called when one of the 3 transport buttons is pressed
        setupTransport(() => { this.handleTransport(TransportButton.Play); }, () => { this.handleTransport(TransportButton.Stop); }, () => { this.handleTransport(TransportButton.Record); });
    }
    initAudioContext() {
        Tone.start();
    }
    run() {
        console.log('Main running...');
        Tone.Transport.scheduleRepeat((time) => {
            // use the callback time to schedule events
            synth.triggerAttackRelease('C4', '8n');
        }, "4n");
    }
    handlePad(index) {
        console.log('handle pad:', index);
    }
    handleTransport(button) {
        console.log('transport button:', button);
    }
    uiUpdate() {
    }
}
export var TransportButton;
(function (TransportButton) {
    TransportButton[TransportButton["Play"] = 0] = "Play";
    TransportButton[TransportButton["Stop"] = 1] = "Stop";
    TransportButton[TransportButton["Record"] = 2] = "Record";
})(TransportButton || (TransportButton = {}));
//# sourceMappingURL=main.js.map