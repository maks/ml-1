import { SampleKitManager } from "/dist/sampler/samplekit_manager.js";
import { instrumentFromDS } from '/dist/sampler/audio_handling.js';
import { initControls, Beat } from '/dist/sampler/sampler_ui.js';
import { Project, ProjectPlayer } from '/dist/sampler/sequencer.js';

const baseUrl = "http://127.0.0.1:8008/samples/";

const startingOctave = 4;

// init() once the page has finished loading.
window.onload = init;

let context;
let instrument;
let fileStore;
let project;
let projectPlayer;
let selectedPack;
let kitManager;

let theBeat = new Beat();

let machineState = {
  mode: 1, // MachineMode.Step = 1,
  keyMod: 0, // KeyMod.None = 0,
  transportMode: 1, // TransportMode.None = 0
  currentTrack: null,
  selectedStep: null,
  selectedNote: 60,
  keybdOctave: startingOctave,
  tracks: [],
  tempo: 0,
  swing: 0
}

window.document.testplay = function () {
  console.log('play', sample);
  instrument.start(60);
}

async function init() {
  context = new AudioContext()
  // To allow resuming audiocontext from user gesture in webpage when not headless
  document.audioContext = context;

  project = new Project(context, null, 80, "No Effect", 0);
  window.document.project = project;

  machineState.tracks = project.tracks;

  kitManager = new SampleKitManager(baseUrl);
  await kitManager.scanForDSKits();
  console.log('Packs loaded:', kitManager.packs)

  const controls = {
    selectInstrument: selectPack,
    playNote: (note, options) => machineState.currentTrack.instrument.start(note, null, options),
    startPlayer: () => projectPlayer.play(),
    stop: () => projectPlayer.stop(),
    save: () => console.log("save:" + saveToStorage(JSON.stringify(project.toData()))),
    addTrack: () => project.addTrack(context, machineState.currentTrack.instrument),
    removeTrack: (trackIndex) => project.removeTrack(trackIndex),
    setTempo: (tempo) => project.tempo = tempo,
    setSwing: (swing) => project.swing = swing
  };

  // hardcode first pack found for now for debugging
  selectedPack = kitManager.packs[0];
  instrument = await instrumentFromDS(`${baseUrl}${selectedPack.path}/`, context, selectedPack);

  // load from saved data in localstorage
  const data = loadFromStorage();
  if (data) {
    project = await Project.fromData(context, selectPack, data);
    machineState.tracks = project.tracks;
    machineState.tempo = project.tempo;
    machineState.swing = project.swing;
    machineState.currentTrack = project.tracks[0];

    console.log("LOADED project", project);
  }
  projectPlayer = new ProjectPlayer(context, project, handleOnNextBeat);

  initControls(kitManager.packs.map((p) => p.name), controls, machineState, theBeat);
}

async function selectPack(name) {
  if (!name) {
    console.log("no point looking up undefined instrument pack name");
    return;
  }
  console.log('looking for:' + name, kitManager.packs)
  selectedPack = kitManager.packs.find((p) => p.name === name);
  console.log('selected pack:', selectedPack);
  instrument = await instrumentFromDS(`${baseUrl}${selectedPack.path}/`, context, selectedPack);
  if (machineState.currentTrack) {
    machineState.currentTrack.instrument = instrument;
  } else {
    console.log("no current track to set instrument on");
  }
  console.log('current sampleplayer', instrument);
  return instrument;
}

function handleOnNextBeat(beatCount) {
  // console.log('Player BEAT:' + beatCount)
  theBeat.beat(beatCount);
}

const projectKey = 'default.project';

function saveToStorage(jsonString) {
  localStorage.setItem(projectKey, jsonString);
}

function loadFromStorage() {
  let jsonStr = localStorage.getItem(projectKey);
  return JSON.parse(jsonStr);
}