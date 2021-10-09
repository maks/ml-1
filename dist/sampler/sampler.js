var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import SamplePlayer from "https://cdn.skypack.dev/sample-player@^0.5.5";
// Events
// init() once the page has finished loading.
window.onload = init;
let context;
let sample;
window.document.testplay = function () {
    console.log('play', sample);
    sample.start();
};
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('hello sampler', SamplePlayer);
        context = new AudioContext();
        // To allow resuming audiocontext from user gesture in webpage when not headless
        document.audioContext = context;
        let audioBuf;
        const packName = "4OP-FM";
        const instrumentName = "tom1";
        const wavUrl = `/assets/samples/drum-samples/${packName}/${instrumentName.toLowerCase()}.wav`;
        audioBuf = yield fetchAndDecodeAudio(wavUrl);
        sample = SamplePlayer(context, audioBuf).connect(context.destination);
        // sample.stop()
    });
}
function fetchAndDecodeAudio(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        const responseBuffer = yield response.arrayBuffer();
        return yield context.decodeAudioData(responseBuffer);
    });
}
function loadSample(instrumentName) {
    return __awaiter(this, void 0, void 0, function* () {
        this.buffer[instrumentName] = yield fetchAndDecodeAudio(this.getSampleUrl(instrumentName));
    });
}
