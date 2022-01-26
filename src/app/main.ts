import * as Tone from "https://unpkg.com/tone@14.7.77/build/esm/index.js?module";
import { getMidi, setupTransport, setupPads, setupOled, setupDials, setupButtons, allOff, ButtonsSetup, ButtonControl, ButtonCode, PadsControl, OledControl } from '../firemidi.js';

let synth = new Tone.Synth().toDestination()

export class Main {
  initAudioContext() {
    Tone.start();
  }

  run() {
    console.log('main running...');
    Tone.Transport.scheduleRepeat((time: number) => {
      // use the callback time to schedule events
      synth.triggerAttackRelease('C4', '8n');
    }, "4n");
  }
}