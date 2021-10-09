import SamplePlayer from "https://cdn.skypack.dev/sample-player@^0.5.5";

// Events
// init() once the page has finished loading.
window.onload = init;

let context;
let sample;

window.document.testplay = function () {
  console.log('play', sample);
  sample.start();
}


async function init() {
  console.log('hello sampler', SamplePlayer)

  context = new AudioContext()
  // To allow resuming audiocontext from user gesture in webpage when not headless
  document.audioContext = context;

  let audioBuf;// = AudioBuffer();

  const packName = "4OP-FM";
  const instrumentName = "tom1";

  const wavUrl = `/assets/samples/drum-samples/${packName}/${instrumentName.toLowerCase()}.wav`;

  audioBuf = await fetchAndDecodeAudio(wavUrl);

  sample = SamplePlayer(context, audioBuf).connect(context.destination)

  // sample.stop()
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