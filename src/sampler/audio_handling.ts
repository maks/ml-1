// @ts-ignore
import { SamplePlayer } from "/src/sampler/sample-player/index.js";
import { DSPreset, DSSample } from "./dspreset_parser";

export interface OptsInterface {
  gain: number,
  duration?: number,
  offset?: number,
  loop?: boolean
  attack?: number,
  decay?: number,
  sustain?: number,
  release?: number,
}
// returns a SamplePlayer based Instrument created from a dspreset group
export async function instrumentFromDS(baseUrl: string, context: AudioContext, dspreset: DSPreset): Promise<Instrument> {
  const group = dspreset.group;
  const sampleRanges: SampleRange[] = group.map((sample) => {
    // decent parser format spec says root, lo, hi Note are 0-127 midi notes
    const sr: SampleRange = {
      minNote: parseInt(sample.loNote),
      maxNote: parseInt(sample.hiNote),
      rootNote: parseInt(sample.rootNote)
    };
    return sr;
  });
  const samples = await loadSamples(baseUrl, context, group);
  const filename = _stripLastChar(baseUrl.substring(_stripLastChar(baseUrl).lastIndexOf('/') + 1));
  const instrument = new Instrument(dspreset.name, sampleRanges, context, samples);
  return instrument;
}

function _stripLastChar(str: string) { return str.substring(0, str.length - 1); }

// returns map of { notename: AudioBuffer } for every entry in dspresets group
async function loadSamples(baseUrl: string, ac: AudioContext, group: DSSample[]): Promise<Record<string, AudioBuffer>> {
  const mapping: Record<string, AudioBuffer> = {};
  for (const sample of group) {
    mapping[sample.rootNote] = await fetchAndDecodeAudio(ac, baseUrl + sample.path,);
  }
  return mapping;
}

// returns a AudioBuffer for audio file at given url
export async function fetchAndDecodeAudio(context: AudioContext, url: string) {
  const response = await fetch(url);
  const responseBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(responseBuffer);
}

interface SampleRange {
  minNote: number;
  maxNote: number;
  rootNote: number;
}

export class Instrument {
  readonly _ranges: SampleRange[];
  readonly _player: SamplePlayer;
  readonly _name: string;

  constructor(name: string, ranges: SampleRange[], context: AudioContext, sampleBuffers: Record<string, AudioBuffer>) {
    this._name = name;
    this._ranges = ranges;
    this._player = SamplePlayer(context, sampleBuffers).connect(context.destination);
  }

  get name() { return this._name; }

  /// expect noteName to be a midi note number 0-127 as a string 
  start(midiNote: number, when: number, options: object) {
    // lookup matching sample name from given ranges
    const matchingSampleRange: SampleRange | undefined = this._ranges.find(e => (e.rootNote == midiNote) || (e.maxNote >= midiNote && e.minNote <= midiNote));

    if (matchingSampleRange === undefined) {
      console.log('no matching note:' + midiNote);
      return;
    }
    const opts: any = options || {};
    if (matchingSampleRange.rootNote != midiNote) {
      opts.cents = (midiNote - matchingSampleRange.rootNote) * 100;
    }
    //console.log(`for note: ${midiNote} play ${matchingSampleRange.rootNote} opts:`, opts)
    this._player.start(matchingSampleRange.rootNote, when, opts)
  }

  stop() {
    this._player.stop();
  }
}