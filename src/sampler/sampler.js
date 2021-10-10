import SamplePlayer from "https://cdn.skypack.dev/sample-player@^0.5.5";
import { DSPreset } from "/dist/sampler/dspreset_parser.js";
import { FileStore } from '/dist/sampler/file_browser.js';
import { samplePlayerFromDS } from '/dist/sampler/audio_handling.js';

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

window.document.testplay = function () {
  console.log('play', sample);
  sample.start(69);
}

async function init() {
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
  const pack = packs[0];

  context = new AudioContext()
  // // To allow resuming audiocontext from user gesture in webpage when not headless
  document.audioContext = context;

  sample = await samplePlayerFromDS(baseUrl + pack.path + "/", context, pack);
  console.log(sample);
}

// Load a multisample pack using a DecentSampler .dspresets file format at given url
async function loadDSPreset(url, name, path) {
  // console.log('url:' + url)
  const response = await fetch(url);
  const body = await response.text();
  const ds = new DSPreset(new window.DOMParser().parseFromString(body, "text/xml"), name, path);
  // console.log('loaded group', ds.group)
  return ds;
}
