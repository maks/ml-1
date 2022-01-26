import { Main } from "/dist/app/main.js";
import { ML1Player } from "/dist/app/sequencer/player.js";

// init once the page has finished loading.
window.onload = init;

const main = new Main();

window.document.testplay = function () {
  const p = new ML1Player();
  p.togglePlay();
}

window.document.initAudio = function() {
  main.initAudioContext();
}

async function init() { 
  main.run();
}