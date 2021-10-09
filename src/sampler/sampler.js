import SamplePlayer from "https://cdn.skypack.dev/sample-player@^0.5.5";
import { DSPreset } from "/dist/sampler/dspreset_parser.js";

// init() once the page has finished loading.
window.onload = dsInit;

let context;
let sample;

window.document.testplay = function () {
  console.log('play', sample);
  sample.start();
}

async function dsInit() {
  console.log('init ds');
  const baseUrl = "http://127.0.0.1:8008/6m0d6/";
  const url = "http://127.0.0.1:8008/6m0d6/Loopop-6m0d6.dspreset";
  const response = await fetch(url);
  const body = await response.text();

  const ds = new DSPreset(new window.DOMParser().parseFromString(body, "text/xml"));
  const group = ds.group;
  console.log('group', group);

  context = new AudioContext()
  // To allow resuming audiocontext from user gesture in webpage when not headless
  document.audioContext = context;
  let audioBuf = await fetchAndDecodeAudio(`${baseUrl}${group[24].path}`);
  sample = SamplePlayer(context, audioBuf).connect(context.destination)
}

async function fetchAndDecodeAudio(url) {
  const response = await fetch(url);
  const responseBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(responseBuffer);
}


async function loadSample(instrumentName) {
  this.buffer[instrumentName] = await fetchAndDecodeAudio(
    this.getSampleUrl(instrumentName));
}