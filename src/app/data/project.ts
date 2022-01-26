import { Color } from "../globals.js";

export { Project, Track };

const LOOP_LENGTH = 16;
const BEATS_PER_FULL_NOTE = 4;

const COLORS = [
  { r: 0, g: 100, b: 0 },
  { r: 0, g: 0, b: 100 },
  { r: 90, g: 40, b: 0 },
  { r: 0, g: 90, b: 40 },
  { r: 0, g: 0, b: 100 },
  { r: 40, g: 90, b: 0 },
  { r: 40, g: 0, b: 90 },
  { r: 100, g: 0, b: 0 },
  { r: 0, g: 100, b: 0 },
  { r: 90, g: 20, b: 20 },
];

class Project {
  private _tracks: Track[];
  private _tempo: number;
  private _swingFactor: number = 0;
  
  static async fromData(context: AudioContext, lookupInstrument: (name: string) => Promise<Instrument>, data: any): Promise<Project> {

    const tracks: Track[] = [];
    for (const tr of data.tracks) {
      const instrument = await lookupInstrument(tr.instrumentName);
      const track = Track.fromData(context, instrument, tr);
      tracks.push(track);
    }
    const project = new Project(context, tracks, data.tempo);
    return project;
  }

  constructor(context: AudioContext, tracks: Track[], tempo: number) {
    this._tempo = tempo;

    if (tracks) {
      this._tracks = tracks;
    } else {
      this._tracks = [0, 1, 2, 3].map((i) => new Track(context, null, `Trk${i}`, null));
    }
  }

  addTrack(context: AudioContext, instrument: Instrument): Track {
    const i = this.tracks.length;
    const nuTrack = new Track(context, instrument, `Trk${i}`, COLORS[i + 1]);
    this._tracks.push(nuTrack);
    return nuTrack;
  }

  removeTrack(trackIndex: number) {
    this._tracks.splice(trackIndex, 1);
  }

  get tracks() {
    return this._tracks;
  }

  set tempo(tempo) {
    this._tempo = tempo;
  }

  get tempo() {
    return this._tempo;
  }

  set swing(swing: number) {
    this._swingFactor = swing;
  }

  get swing() {
    return this._swingFactor;
  }

  // convert to easily stringifyable object
  toData(): any {
    console.log('todata tracks', this.tracks)
    return {
      tracks: this.tracks.map((t) => t.toData()),
      tempo: this.tempo,
      swing: this.swing,
    };
  }
}

type Step = {
  note: number, // midi: 0 - 127
  velocity: number,
  accent: boolean
}

class Instrument {
  private _name: String;
  
  constructor(name: String) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}

class Track {
  readonly _context: AudioContext;
  private _instrument: Instrument | null;
  private _name: string | undefined;
  private _color: Color;
  private _mute = false;
  private _steps: Step[] = [];

  public offset = 0;
  public duration: number | undefined;
  public attack?: number;
  public decay?: number;
  public sustain?: number = 1; // 1.0 is no effect
  public release?: number;
  public gain: number = 1; // 1.0 is no effect

  static colorCounter = 0;

  static fromData(context: AudioContext, instrument: Instrument, data: any): Track {
    const track = new Track(context, instrument, data.name, data.color);
    track.duration = data.duration;
    track.offset = data.offset;
    track._mute = data.mute ?? false;
    track.gain = data.gain;
    track.attack = data.attack;
    track.decay = data.decay;
    track.sustain = data.sustain;
    track.release = data.release;
    track._steps = data.steps;
    return track;
  }

  constructor(context: AudioContext, instrument: Instrument | null, name: string, color: Color | null) {
    this._context = context;
    this._instrument = instrument;
    for (let i = 0; i < LOOP_LENGTH; i++) {
      this._steps[i] = { note: 0, velocity: 127, accent: false };
    }
    this._name = name;
    this._color = color || COLORS[Track.colorCounter++ % COLORS.length];
  }

  get name() {
    return this._instrument?.name ?? this._name;
  }

  get color() {
    return this._color;
  }

  set instrument(i) {
    this._instrument = i;
  }

  get instrument() {
    return this._instrument;
  }

  get muted() {
    return this._mute;
  }

  get steps() {
    return this._steps;
  }

  toggleMute() {
    this._mute = !this._mute;
  }

  toggleStepAccent(rhythmIndex: number) {
    const step = this.steps[rhythmIndex];
    step.accent = !step.accent;
  }

  toggleStepNote(rhythmIndex: number, midiNote: number, velocity?: number) {
    const step = this.steps[rhythmIndex];
    if (this.steps[rhythmIndex].note == 0) {
      this.setStepNote(rhythmIndex, midiNote, velocity);
    } else {
      this.setStepNote(rhythmIndex, 0, 127);
    }
  }

  setStepNote(rhythmIndex: number, midiNote: number, velocity?: number) {
    const existingStep = this.steps[rhythmIndex];
    this.steps[rhythmIndex] = {
      note: midiNote ?? existingStep?.note,
      velocity: velocity ?? existingStep?.velocity,
      accent: existingStep.accent
    };
  }

  clearSteps() {
    this._steps = [];
  }

  getNote(rhythmIndex: number) { return this.steps[rhythmIndex]?.note; }

  getAccent(rhythmIndex: number) { return this.steps[rhythmIndex]?.accent ?? false }

  // convert to easily stringifyable object
  toData(): any {
    return {
      name: this.name,
      color: this._color,
      instrumentName: this.instrument?.name,
      duration: this.duration,
      offset: this.offset,
      mute: this.muted,
      gain: this.gain,
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release,
      steps: this.steps
    };
  }
}