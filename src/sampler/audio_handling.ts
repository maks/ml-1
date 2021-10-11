// @ts-ignore
import { SamplePlayer } from "/src/sampler/sample-player/index.js";
import { DSPreset, DSSample } from "./dspreset_parser";

// returns a SamplePlayer created from a dspreset group
export async function samplePlayerFromDS(baseUrl: string, context: AudioContext, dspreset: DSPreset) {
  const group = dspreset.group;
  const samples = await loadSamples(baseUrl, context, group);
  const player = SamplePlayer(context, samples).connect(context.destination);
  return player;
}

// returns map of { notename: AudioBuffer } for every entry in dspresets group
async function loadSamples(baseUrl: string, ac: AudioContext, group: DSSample[]): Promise<Record<string, AudioBuffer>> {
  const mapping: Record<string, AudioBuffer> = {};
  for (const sample of group) {
    mapping[sample.rootNote] = await fetchAndDecodeAudio(baseUrl, ac, sample.path);
  }
  return mapping;
}

// returns a AudioBuffer for audio file at given url
export async function fetchAndDecodeAudio(baseUrl: string, context: AudioContext, url: string) {
  const response = await fetch(baseUrl + url);
  const responseBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(responseBuffer);
}
