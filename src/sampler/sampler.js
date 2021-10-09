import SamplePlayer from "https://cdn.skypack.dev/sample-player@^0.5.5";
import { DSPreset } from "/dist/sampler/dspreset_parser.js";

const baseUrl = "http://127.0.0.1:8008/";

// init() once the page has finished loading.
window.onload = init;

let context;
let sample;

// array of packs as DSPreset objects
let packs;

window.document.testplay = function () {
  console.log('play', sample);
  sample.start();
}

async function init() {
  const packList = await fetchSamplepacksList();
  packs = await Promise.all(packList.map(async (p) => await loadPack(p)));

  console.log('Packs', packs)
  const pack = packs[0];
  const group = pack.group;

  context = new AudioContext()
  // To allow resuming audiocontext from user gesture in webpage when not headless
  document.audioContext = context;
  let audioBuf = await fetchAndDecodeAudio(`${baseUrl}${pack.name}/${group[1].path}`);
  sample = SamplePlayer(context, audioBuf).connect(context.destination)
}

async function loadPack(name) {
  //TODO: find dspreset files, dont hardcode name
  const url = `${baseUrl}${name}/Loopop-${name}.dspreset`;
  console.log('url:' + url)
  const response = await fetch(url);
  const body = await response.text();
  const ds = new DSPreset(new window.DOMParser().parseFromString(body, "text/xml"), name);
  console.log('loaded group', ds.group)
  return ds;
}

async function fetchSamplepacksList(url) {

  const response = await fetch(baseUrl);
  const body = await response.text();
  const topLevel = JSON.parse(body);
  return topLevel.map(obj => obj.name);
}

async function fetchAndDecodeAudio(url) {
  const response = await fetch(url);
  const responseBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(responseBuffer);
}
