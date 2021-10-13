import { fetchAndDecodeAudio, Instrument } from "./audio_handling";

export { Project, Track, ProjectPlayer, Effect };

const LOOP_LENGTH = 16;
const BEATS_PER_FULL_NOTE = 4;

class Project {
  private _tracks: Track[] = [];
  private _tempo: number;
  private _swingFactor: number = 0;
  // master fx
  private _effect: Effect;
  private _effectMix: number; // 0 to 1

  constructor(tempo: number, effect: Effect, effectMix: number) {
    this._tempo = tempo;
    this._effect = effect;
    this._effectMix = effectMix;
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
}

type Step = {
  note: number, // midi: 0 - 127
  velocity: number
}

class Track {
  readonly _context: AudioContext;
  private _instrument: Instrument;

  private _steps: Step[] = [];

  constructor(context: AudioContext, instrument: Instrument, effect: Effect) {
    this._context = context;
    this._instrument = instrument;
  }

  set instrument(i) {
    this._instrument = i;
  }

  get instrument() {
    return this._instrument;
  }

  get steps() {
    return this._steps;
  }

  setNote(rhythmIndex: number, midiNote: number, velocity?: number) {
    const step = this.steps[rhythmIndex];
    this.steps[rhythmIndex] = {
      note: midiNote ?? step.note,
      velocity: velocity ?? step.velocity
    };
  }

  getNote(rhythmIndex: number) { return this.steps[rhythmIndex].note; }
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

    if (!note) {
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

    voice.start(note, noteTime, {});
  }

  // Call when beat `n` is played to schedule beat `n+1`.
  tick() {
    // tick() is called when beat `n` is played. At this time, call the
    // onNextBeat callback to highlight the currently audible beat in the UI.
    this._onNextBeat(this._rhythmIndex);

    // Then, increase rhythmIndex and nextBeatAt for beat `n+1`.
    this.advanceBeat();

    // Schedule notes to be played at beat `n+1`.
    for (const track of this._project.tracks) {
      this.playNoteAtTime(track, this._rhythmIndex, this._nextBeatAt);
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
    this._rhythmIndex = (this._rhythmIndex + 1) % LOOP_LENGTH;
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

    for (const track of this._project.tracks) {
      // should we use this instead? is this bug in orig shiny-drums?
      // this.playNoteAtTime(track, this._rhythmIndex, this._nextBeatAt);
      this.playNote(track, this._rhythmIndex);
    }

    this.tick();
  }

  stop() {
    clearTimeout(this._timeoutId);
  }
}
