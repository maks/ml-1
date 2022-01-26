import * as Tone from "https://unpkg.com/tone@14.7.77/build/esm/index.js?module";
import { getMidi, setupTransport, setupPads, TransportButton, ButtonControls } from '../firemidi.js';
import { TransportState } from "./data/app_state.js";
import { Project } from "./data/project.js";
import { AppMode } from "./globals.js";
import { ML1Player } from "./sequencer/player.js";
let synth = new Tone.Synth().toDestination();
export class Main {
    constructor(dispatcher) {
        this.appState = {
            mode: AppMode.Step,
            shift: false,
            alt: false,
            selectedPads: [],
            transport: TransportState.None
        };
        this.project = new Project([], 120);
        this.player = new ML1Player(this.project);
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
        this.transportControl = setupTransport((button) => { this.handleTransport(button); });
    }
    // must be called from user initiated event in std web browsers
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
        switch (button) {
            case TransportButton.Play:
                this.appState = Object.assign({}, this.appState, { transport: TransportState.Playing });
                break;
            case TransportButton.Stop:
                this.appState = Object.assign({}, this.appState, { transport: TransportState.Stopped });
                break;
            case TransportButton.Record:
                this.appState = Object.assign({}, this.appState, { transport: TransportState.Recording });
                break;
        }
        this.uiUpdate();
        this.playerUpdate();
    }
    playerUpdate() {
        if (this.appState.transport == TransportState.Playing) {
            this.player.play();
        }
        else if (this.appState.transport == TransportState.Stopped) {
            this.player.pause();
        }
    }
    uiUpdate() {
        // update transport state display
        this.transportControl.buttonsOn(this.appState.transport == TransportState.Playing, this.appState.transport == TransportState.Stopped, this.appState.transport == TransportState.Recording);
    }
}
//# sourceMappingURL=main.js.map