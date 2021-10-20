import { fetchAndDecodeAudio, Instrument, OptsInterface } from "./audio_handling.js";
import { Color } from "../fire_raw/pads.js";

export { Project, Track, ProjectPlayer, Effect };

const LOOP_LENGTH = 16;
const BEATS_PER_FULL_NOTE = 4;

const COLORS = [
  { r: 0, g: 100, b: 0 },
  { r: 0, g: 0, b: 100 },
  { r: 80, g: 80, b: 0 },
  { r: 0, g: 80, b: 80 },
  { r: 80, g: 80, b: 0 },
  { r: 80, g: 0, b: 80 },
  { r: 0, g: 100, b: 0 },
  { r: 80, g: 80, b: 80 },
];

class Project {
  private _tracks: Track[];
  private _tempo: number;
  private _swingFactor: number = 0;
  // master fx
  private _effect: Effect;
  private _effectMix: number; // 0 to 1

  static async fromData(context: AudioContext, lookupInstrument: (name: string) => Promise<Instrument>, data: any): Promise<Project> {

    const tracks: Track[] = [];
    for (const tr of data.tracks) {
      const instrument = await lookupInstrument(tr.instrumentName);
      const track = Track.fromData(context, instrument, tr);
      tracks.push(track);
    }
    const project = new Project(context, tracks, data.tempo, new Effect(context, "No Effect"), data.effectMix);
    return project;
  }

  constructor(context: AudioContext, tracks: Track[], tempo: number, effect: Effect, effectMix: number) {
    this._tempo = tempo;
    this._effect = effect;
    this._effectMix = effectMix;

    if (tracks) {
      this._tracks = tracks;
    } else {
      this._tracks = [0, 1, 2, 3].map((i) => new Track(context, null, `Trk${i}`, null, null));
    }
  }

  addTrack(context: AudioContext, instrument: Instrument): Track {
    const i = this.tracks.length;
    const nuTrack = new Track(context, instrument, `Trk${i}`, COLORS[i + 1], null);
    this._tracks.push(nuTrack);
    return nuTrack;
  }

  removeTrack(trackIndex: number) {
    this._tracks.splice(trackIndex, 1);
  }

  get tracks() {
    return this._tracks;
  }

  set effect(effect) {
    this._effect = effect;

    // If the user chooses a new effect from the dropdown after having turned
    // the dry/wet effect slider to 0, reset the effect wetness to 0.5 to make
    // sure that the user hears the new effect.
    if (this.effectMix == 0) {
      this.effectMix = 0.5;
    }

    // If the effect is meant to be entirely wet (no unprocessed signal) then
    // put the effect level all the way up.
    if (effect.dryMix == 0) {
      this._effectMix = 1;
    }
  }

  get effect() {
    return this._effect;
  }

  set effectMix(effectMix) {
    this._effectMix = effectMix;
  }

  get effectMix() {
    return this._effectMix;
  }


  set tempo(tempo) {
    this._tempo = tempo;
  }

  get tempo() {
    return this._tempo;
  }


  set swingFactor(swingFactor: number) {
    this._swingFactor = swingFactor;
  }

  get swingFactor() {
    return this._swingFactor;
  }

  // convert to easily stringifyable object
  toData(): any {
    console.log('todata tracks', this.tracks)
    return {
      tracks: this.tracks.map((t) => t.toData()),
      tempo: this.tempo,
      swing: this.swingFactor,
      effect: this.effect
    };
  }
}

type Step = {
  note: number, // midi: 0 - 127
  velocity: number
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
    const track = new Track(context, instrument, data.name, data.color, null);
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

  constructor(context: AudioContext, instrument: Instrument | null, name: string, color: Color | null, effect: Effect | null) {
    this._context = context;
    this._instrument = instrument;
    for (let i = 0; i < LOOP_LENGTH; i++) {
      this._steps[i] = { note: 0, velocity: 127 };
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
      velocity: velocity ?? existingStep?.velocity
    };
  }

  clearSteps() {
    this._steps = [];
  }

  getNote(rhythmIndex: number) { return this.steps[rhythmIndex]?.note; }

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

class Effect {
  readonly _context: AudioContext;
  readonly _name: string;
  readonly _url: string | undefined;
  public wetMix: number = 0; //range: 0..1 
  public dryMix: number = 0; //range: 0..1 

  private _buffer: AudioBuffer | null = null;

  constructor(context: AudioContext, name: string, url?: string, mix?: number) {
    this._context = context;
    this._name = name;
    this._url = url;
  }

  get buffer() { return this._buffer; }

  async load() {
    // Return if buffer has been loaded already or there is nothing to load
    // ("No effect" instance).
    if (!this._url || this._buffer) {
      return;
    }
    this._buffer = await fetchAndDecodeAudio(this._context, this._url);
  }
}

class ProjectPlayer {
  readonly _context: AudioContext
  readonly _project: Project;
  readonly _onNextBeat: Function;
  readonly _masterGainNode: GainNode;
  readonly _effectLevelNode: GainNode;
  readonly _convolver: ConvolverNode;
  private _nextBeatAt: number = 0;
  private _rhythmIndex: number = 0;
  private _timeoutId: number | undefined;

  constructor(context: AudioContext, project: Project, onNextBeat: Function) {
    this._context = context;
    this._project = project;
    this._onNextBeat = onNextBeat;

    // Create a dynamics compressor to sweeten the overall mix.
    const compressor = new DynamicsCompressorNode(context);
    compressor.connect(this._context.destination);

    // Create master volume and reduce overall volume to avoid clipping.
    this._masterGainNode = new GainNode(context, { gain: 0.7 });
    this._masterGainNode.connect(compressor);

    // Create effect volume controlled by effect sliders.
    this._effectLevelNode = new GainNode(context, { gain: 1.0 });
    this._effectLevelNode.connect(this._masterGainNode);

    // Create convolver for effect
    this._convolver = new ConvolverNode(context);
    this._convolver.connect(this._effectLevelNode);
  }

  playNote(track: Track, rhythmIndex: number) {
    this.playNoteAtTime(track, rhythmIndex, 0);
  }

  playNoteAtTime(track: Track, rhythmIndex: number, noteTime: number) {
    const note = track.getNote(rhythmIndex);

    if (!note || track.muted) {
      //console.log("missing note: tr" + track.name + " idx:" + rhythmIndex)
      return;
    }

    // Create the note
    const voice = track.instrument;
    let finalNode = voice;

    //TODO: implement panning from orig shuiny-drums seq

    // Optionally, connect to a panner.
    // if (instrument.pan) {
    //   // Pan according to sequence position.
    //   const panner = new PannerNode(context,
    //     { positionX: 0.5 * rhythmIndex - 4, positionY: 0, positionZ: -1 });
    //   finalNode.connect(panner);
    //   finalNode = panner;
    // }

    // Connect to dry mix
    // const dryGainNode = new GainNode(context,
    //   { gain: VOLUMES[note] * instrument.mainGain * this.beat.effect.dryMix });
    // finalNode.connect(dryGainNode);
    // dryGainNode.connect(this.masterGainNode);

    // // Connect to wet mix
    // const wetGainNode = new GainNode(context, { gain: instrument.sendGain });
    // finalNode.connect(wetGainNode);
    // wetGainNode.connect(this.convolver);
    const opts: OptsInterface = {
      gain: track.gain,
      duration: track.duration,
      offset: track.offset,
      attack: track.attack,
      decay: track.decay,
      sustain: track.sustain,
      release: track.release
    };

    voice?.start(note, noteTime, opts);
  }

  // Call when beat `n` is played to schedule beat `n+1`.
  tick() {
    // tick() is called when beat `n` is played. At this time, call the
    // onNextBeat callback to highlight the currently audible beat in the UI.
    this._onNextBeat(this._rhythmIndex);

    // Then, increase rhythmIndex and nextBeatAt for beat `n+1`.
    this.advanceBeat();

    console.log("BEAT:" + this._rhythmIndex);

    // Schedule notes to be played at beat `n+1`.
    for (const track of this._project.tracks) {
      // allow for tracks with step counts of any length, for tracks with step counts less than current rythmIndex
      // it will loop the track from beginning "Arp style"
      const beatIndex = track.steps.length <= this._rhythmIndex ? this._rhythmIndex % track.steps.length : this._rhythmIndex;
      this.playNoteAtTime(track, beatIndex, this._nextBeatAt);
    }

    // Finally, call tick() again at the time when beat `n+1` is played.
    this._timeoutId = window.setTimeout(
      () => this.tick(),
      (this._nextBeatAt - this._context.currentTime) * 1000,
    );
  }

  advanceBeat() {
    // Convert configured beats per minute to delay per tick.
    const secondsPerBeat = 60.0 / this._project.tempo / BEATS_PER_FULL_NOTE;
    const swingDirection = (this._rhythmIndex % 2) ? -1 : 1;
    const swing = (this._project.swingFactor / 3) * swingDirection;

    this._nextBeatAt += (1 + swing) * secondsPerBeat;
    this._rhythmIndex = (this._rhythmIndex + 1);
  }

  updateEffect() {
    this._convolver.buffer = this._project.effect.buffer;

    // Factor in both the preset's effect level and the blending level
    // (effectWetMix) stored in the effect itself.
    this._effectLevelNode.gain.value =
      this._project.effectMix * this._project.effect.wetMix;
  }

  play() {
    // Ensure that initial notes are played at once by scheduling the playback
    // slightly in the future.
    this._nextBeatAt = this._context.currentTime + 0.05;
    this._rhythmIndex = 0;

    console.log('TEMPO:' + this._project.tempo)

    for (const track of this._project.tracks) {
      // should we use this instead? is this bug in orig shiny-drums?
      // this.playNoteAtTime(track, this._rhythmIndex, this._nextBeatAt);
      this.playNote(track, this._rhythmIndex);
    }

    this.tick();
  }

  stop() {
    clearTimeout(this._timeoutId);
    this._project.tracks.forEach((tr) => tr.instrument?.stop());
  }
}
