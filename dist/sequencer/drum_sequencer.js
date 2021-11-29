export class DrumSequencer {
    constructor() {
        this.tracks = [
            new Track('snare', 16),
            new Track('hihat', 16),
            new Track('kick', 16),
            new Track('tom', 16),
        ];
    }
}
class Track {
    constructor(instrument, length) {
        this.instrument = instrument;
        this.beats = new Array(length);
    }
}
class Beat {
    constructor(count = 1) {
        this.count = count;
    }
}
//# sourceMappingURL=drum_sequencer.js.map