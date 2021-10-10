import SamplePlayer from "https://cdn.skypack.dev/sample-player@^0.5.5";
import { DSPreset } from "/dist/sampler/dspreset_parser.js";
import { FileStore } from '/dist/sampler/file_browser.js';
import { samplePlayerFromDS } from '/dist/sampler/audio_handling.js';
import { initControls } from '/dist/sampler/sampler_ui.js';

export { SamplePlayer };

const baseUrl = "http://127.0.0.1:8008/";

// init() once the page has finished loading.
window.onload = init;

let context;
let sample;
let fileStore;

// array of packs as DSPreset objects
let packs = [];
let players = []

let selectedPack;

window.document.testplay = function () {
  console.log('play', sample);
  sample.start(60);
}

async function init() {
  context = new AudioContext()
  // To allow resuming audiocontext from user gesture in webpage when not headless
  document.audioContext = context;

  fileStore = new FileStore(baseUrl);

  // top level dir file list
  const topDirlist = await fileStore.getCurrentDirFilelist();

  console.log(topDirlist)

  for (const dir of topDirlist) {
    fileStore.enterDir(dir.name);
    const dsFiles = await fileStore.currentDirFilesByExtension("dspreset");
    if (dsFiles.length > 0) {
      for (const file of dsFiles) {
        const url = `${baseUrl}${dir.name}/${file.name}`;
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
        const dspreset = await loadDSPreset(url, nameWithoutExtension, dir.name);
        packs.push(dspreset);
      }
    }
    fileStore.upDir();
  }

  console.log('Packs', packs)

  const controls = {
    selectInstrument: selectPack,
    playNote: (note) => sample.start(note + 60),
    stop: () => sample.stop()
  };

  initControls(packs.map((p) => p.name), window.document.testplay, controls);

  // hardcode first pack found for now for debugging
  selectedPack = packs[0];
  sample = await samplePlayerFromDS(`${baseUrl}${selectedPack.path}/`, context, selectedPack);
}

async function selectPack(name) {
  selectedPack = packs.find((p) => p.name === name);
  console.log('seleced:', selectedPack);
  sample = await samplePlayerFromDS(`${baseUrl}${selectedPack.path}/`, context, selectedPack);
}

// Load a multisample pack using a DecentSampler .dspresets file format at given url
async function loadDSPreset(url, name, path) {
  const response = await fetch(url);
  const body = await response.text();
  const ds = new DSPreset(new window.DOMParser().parseFromString(body, "text/xml"), name, path);
  return ds;
}
