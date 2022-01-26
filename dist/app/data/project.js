var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    constructor(context, tracks, tempo) {
        this._swingFactor = 0;
        this._tempo = tempo;
        if (tracks) {
            this._tracks = tracks;
        }
        else {
            this._tracks = [0, 1, 2, 3].map((i) => new Track(context, null, `Trk${i}`, null));
        }
    }
    static fromData(context, lookupInstrument, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const tracks = [];
            for (const tr of data.tracks) {
                const instrument = yield lookupInstrument(tr.instrumentName);
                const track = Track.fromData(context, instrument, tr);
                tracks.push(track);
            }
            const project = new Project(context, tracks, data.tempo);
            return project;
        });
    }
    addTrack(context, instrument) {
        const i = this.tracks.length;
        const nuTrack = new Track(context, instrument, `Trk${i}`, COLORS[i + 1]);
        this._tracks.push(nuTrack);
        return nuTrack;
    }
    removeTrack(trackIndex) {
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
    set swing(swing) {
        this._swingFactor = swing;
    }
    get swing() {
        return this._swingFactor;
    }
    // convert to easily stringifyable object
    toData() {
        console.log('todata tracks', this.tracks);
        return {
            tracks: this.tracks.map((t) => t.toData()),
            tempo: this.tempo,
            swing: this.swing,
        };
    }
}
class Instrument {
    constructor(name) {
        this._name = name;
    }
    get name() {
        return this._name;
    }
}
class Track {
    constructor(context, instrument, name, color) {
        this._mute = false;
        this._steps = [];
        this.offset = 0;
        this.sustain = 1; // 1.0 is no effect
        this.gain = 1; // 1.0 is no effect
        this._context = context;
        this._instrument = instrument;
        for (let i = 0; i < LOOP_LENGTH; i++) {
            this._steps[i] = { note: 0, velocity: 127, accent: false };
        }
        this._name = name;
        this._color = color || COLORS[Track.colorCounter++ % COLORS.length];
    }
    static fromData(context, instrument, data) {
        var _a;
        const track = new Track(context, instrument, data.name, data.color);
        track.duration = data.duration;
        track.offset = data.offset;
        track._mute = (_a = data.mute) !== null && _a !== void 0 ? _a : false;
        track.gain = data.gain;
        track.attack = data.attack;
        track.decay = data.decay;
        track.sustain = data.sustain;
        track.release = data.release;
        track._steps = data.steps;
        return track;
    }
    get name() {
        var _a, _b;
        return (_b = (_a = this._instrument) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : this._name;
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
    toggleStepAccent(rhythmIndex) {
        const step = this.steps[rhythmIndex];
        step.accent = !step.accent;
    }
    toggleStepNote(rhythmIndex, midiNote, velocity) {
        const step = this.steps[rhythmIndex];
        if (this.steps[rhythmIndex].note == 0) {
            this.setStepNote(rhythmIndex, midiNote, velocity);
        }
        else {
            this.setStepNote(rhythmIndex, 0, 127);
        }
    }
    setStepNote(rhythmIndex, midiNote, velocity) {
        const existingStep = this.steps[rhythmIndex];
        this.steps[rhythmIndex] = {
            note: midiNote !== null && midiNote !== void 0 ? midiNote : existingStep === null || existingStep === void 0 ? void 0 : existingStep.note,
            velocity: velocity !== null && velocity !== void 0 ? velocity : existingStep === null || existingStep === void 0 ? void 0 : existingStep.velocity,
            accent: existingStep.accent
        };
    }
    clearSteps() {
        this._steps = [];
    }
    getNote(rhythmIndex) { var _a; return (_a = this.steps[rhythmIndex]) === null || _a === void 0 ? void 0 : _a.note; }
    getAccent(rhythmIndex) { var _a, _b; return (_b = (_a = this.steps[rhythmIndex]) === null || _a === void 0 ? void 0 : _a.accent) !== null && _b !== void 0 ? _b : false; }
    // convert to easily stringifyable object
    toData() {
        var _a;
        return {
            name: this.name,
            color: this._color,
            instrumentName: (_a = this.instrument) === null || _a === void 0 ? void 0 : _a.name,
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
Track.colorCounter = 0;
//# sourceMappingURL=project.js.map