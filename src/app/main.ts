import * as Tone from "https://unpkg.com/tone@14.7.77/build/esm/index.js?module";
import { getMidi, setupTransport, setupPads, setupOled, setupDials, setupButtons, allOff, ButtonsSetup, ButtonControl, ButtonCode, PadsControl, OledControl, TransportButton, TransportControls, ButtonControls } from '../firemidi.js';
import { MidiDispatcher } from "../midi_dispatcher.js";
import { AppState, TransportState } from "./data/app_state.js";
import { AppMode } from "./globals.js";

let synth = new Tone.Synth().toDestination()

export class Main {
  appState: AppState;
  private dispatcher!: MidiDispatcher;
  private buttonControl!: ButtonControls;
  private padControl!: PadsControl;
  private transportControl!: TransportControls;

  constructor(dispatcher: MidiDispatcher) {
    this.appState = {
      mode: AppMode.Step,
      shift: false,
      alt: false,
      selectedPads: [],
      transport: TransportState.None
    };

    getMidi((disp) => this._midiReady(disp), (isConnected: boolean) => {
      if (isConnected) {
        console.log('reconnected');
        //TODO: call this._midiReady
      }
    });
  }

  _midiReady(dispatcher: MidiDispatcher) {
    console.log('Main: Midi is ready: ', dispatcher);
    this.dispatcher = dispatcher;

    this.buttonControl = new ButtonControls({
      midi: this.dispatcher, onButton: (button: ButtonCode, up: boolean) => {
        console.log('button:', button, up)
      }
    });

    this.padControl = setupPads((index) => this.handlePad(index));

    // pass in callbacks which will be called when one of the 3 transport buttons is pressed
    this.transportControl = setupTransport(
      (button) => { this.handleTransport(button) }
    );
  }

  initAudioContext() {
    Tone.start();
  }

  run() {
    console.log('Main running...');
    Tone.Transport.scheduleRepeat((time: number) => {
      // use the callback time to schedule events
      synth.triggerAttackRelease('C4', '8n');
    }, "4n");
  }

  private handlePad(index: number) {
    console.log('handle pad:', index);
  }

  private handleTransport(button: TransportButton) {
    console.log('transport button:', button)
    switch (button) {
      case TransportButton.Play:
        this.appState = Object.assign({}, this.appState, {transport: TransportState.Playing});
        break;
      case TransportButton.Stop:
        this.appState = Object.assign({}, this.appState, {transport: TransportState.Stopped});
        break;
      case TransportButton.Record:
        this.appState = Object.assign({}, this.appState, {transport: TransportState.Recording});
        break;
    }
    this.uiUpdate();
  }

  uiUpdate() {
    // update transport state display
    this.transportControl.buttonsOn(
      this.appState.transport == TransportState.Playing,
      this.appState.transport == TransportState.Stopped,
      this.appState.transport == TransportState.Recording
    );

  }


}