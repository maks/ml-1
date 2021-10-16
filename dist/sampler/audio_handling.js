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
// returns a SamplePlayer based Instrument created from a dspreset group
export function instrumentFromDS(baseUrl, context, dspreset) {
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
        const filename = _stripLastChar(baseUrl.substring(_stripLastChar(baseUrl).lastIndexOf('/') + 1));
        const instrument = new Instrument(dspreset.name, sampleRanges, context, samples);
        return instrument;
    });
}
function _stripLastChar(str) { return str.substring(0, str.length - 1); }
// returns map of { notename: AudioBuffer } for every entry in dspresets group
function loadSamples(baseUrl, ac, group) {
    return __awaiter(this, void 0, void 0, function* () {
        const mapping = {};
        for (const sample of group) {
            mapping[sample.rootNote] = yield fetchAndDecodeAudio(ac, baseUrl + sample.path);
        }
        return mapping;
    });
}
// returns a AudioBuffer for audio file at given url
export function fetchAndDecodeAudio(context, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        const responseBuffer = yield response.arrayBuffer();
        return yield context.decodeAudioData(responseBuffer);
    });
}
export class Instrument {
    constructor(name, ranges, context, sampleBuffers) {
        this._name = name;
        this._ranges = ranges;
        this._player = SamplePlayer(context, sampleBuffers).connect(context.destination);
    }
    get name() { return this._name; }
    /// expect noteName to be a midi note number 0-127 as a string 
    start(midiNote, when, options) {
        // lookup matching sample name from given ranges
        const matchingSampleRange = this._ranges.find(e => (e.rootNote == midiNote) || (e.maxNote >= midiNote && e.minNote <= midiNote));
        if (matchingSampleRange === undefined) {
            console.log('no matching note:' + midiNote);
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
