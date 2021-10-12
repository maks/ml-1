var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-ignore
import { SamplePlayer } from "/src/sampler/sample-player/index.js";
// returns a SamplePlayer created from a dspreset group
export function samplePlayerFromDS(baseUrl, context, dspreset) {
    return __awaiter(this, void 0, void 0, function* () {
        const group = dspreset.group;
        const sampleRanges = group.map((sample) => {
            // decent parser format spec says root, lo, hi Note are 0-127 midi notes
            const sr = {
                minNote: parseInt(sample.loNote),
                maxNote: parseInt(sample.hiNote),
                rootNote: parseInt(sample.rootNote)
            };
            return sr;
        });
        const samples = yield loadSamples(baseUrl, context, group);
        const instrument = new Instrument(sampleRanges, context, samples);
        return instrument;
    });
}
// returns map of { notename: AudioBuffer } for every entry in dspresets group
function loadSamples(baseUrl, ac, group) {
    return __awaiter(this, void 0, void 0, function* () {
        const mapping = {};
        for (const sample of group) {
            mapping[sample.rootNote] = yield fetchAndDecodeAudio(baseUrl, ac, sample.path);
        }
        return mapping;
    });
}
// returns a AudioBuffer for audio file at given url
export function fetchAndDecodeAudio(baseUrl, context, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(baseUrl + url);
        const responseBuffer = yield response.arrayBuffer();
        return yield context.decodeAudioData(responseBuffer);
    });
}
export class Instrument {
    constructor(ranges, context, sampleBuffers) {
        this._ranges = ranges;
        this._player = SamplePlayer(context, sampleBuffers).connect(context.destination);
    }
    start(name, when, options) {
        // lookup matching sample name from given ranges
        const midiNote = parseInt(name);
        const matchingSampleRange = this._ranges.find(e => (e.rootNote == midiNote) || (e.maxNote >= midiNote && e.minNote <= midiNote));
        if (matchingSampleRange === undefined) {
            console.log('no matching note:' + name);
            return;
        }
        const opts = options || {};
        if (matchingSampleRange.rootNote != midiNote) {
            opts.cents = (midiNote - matchingSampleRange.rootNote) * 100;
        }
        //console.log(`for note: ${midiNote} play ${matchingSampleRange.rootNote} detune by: ${opts.cents}`)
        this._player.start(matchingSampleRange.rootNote, when, opts);
    }
    stop() {
        this._player.stop();
    }
}
