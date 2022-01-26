import { Main } from "/dist/app/main.js";
import * as Tone from "https://unpkg.com/tone@14.7.77/build/esm/index.js?module";

// init once the page has finished loading.
window.onload = init;

let synth = new Tone.Synth().toDestination()

window.document.testplay = function () {
  Tone.start();

  if (Tone.Transport.state !== 'started') {
    Tone.Transport.start();
  } else {
    Tone.Transport.stop();
  }
  console.log('play');

}

window.document.initAudio = function() {
  Tone.start();
  console.log('Tone started');
}

async function init() {
  const main = new Main();
  main.run();
  Tone.Transport.scheduleRepeat((time) => {
    // use the callback time to schedule events
    synth.triggerAttackRelease('C4', '8n');
  }, "4n");
}