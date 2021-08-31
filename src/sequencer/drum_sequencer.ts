export class DrumSequencer {
  tracks: Track[] = [
    new Track('snare', 16),
    new Track('hihat', 16),
    new Track('kick', 16),
    new Track('tom', 16),
  ];
}

class Track {
  instrument: string;
  beats: Beat[];

  constructor(instrument: string, length: number) {
    this.instrument = instrument;
    this.beats = new Array<Beat>(length);
  }

}

class Beat {
  count: number;

  constructor(count: number = 1) {
    this.count = count;
  }
}