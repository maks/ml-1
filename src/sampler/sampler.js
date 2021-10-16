import { DSPreset } from "/dist/sampler/dspreset_parser.js";
import { FileStore } from '/dist/sampler/file_browser.js';
import { instrumentFromDS } from '/dist/sampler/audio_handling.js';
import { initControls } from '/dist/sampler/sampler_ui.js';
import { Project, ProjectPlayer } from '/dist/sampler/sequencer.js';

const baseUrl = "http://127.0.0.1:8008/";

// init() once the page has finished loading.
window.onload = init;

let context;
let instrument;
let fileStore;
let project;
let projectPlayer;

// array of packs as DSPreset objects
let packs = [];

let selectedPack;

let machineState = {
  mode: 1,
  keyMod: 0,
  currentTrack: null,
  selectedStep: null,
  selectedNote: 60,
  tracks: []
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

  fileStore = new FileStore(baseUrl);

  // top level dir file list
  const topDirlist = await fileStore.getCurrentDirFilelist();

  console.log(topDirlist)

  for (const dir of topDirlist) {
    fileStore.enterDir(dir.name);
    const dsFiles = await fileStore.currentDirFilesByExtension("dspreset");
    if (dsFiles.length > 0) {
      for (const file of dsFiles) {
        const url = `${baseUrl}${dir.name}/${file.name}`;
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
        const dspreset = await loadDSPreset(url, nameWithoutExtension, dir.name);
        packs.push(dspreset);
      }
    }
    fileStore.upDir();
  }

  console.log('Packs', packs)

  const controls = {
    selectInstrument: selectPack,
    playNote: (note) => instrument.start(note),
    startPlayer: () => projectPlayer.play(),
    stop: () => projectPlayer.stop(),
    save: () => console.log("save:" + saveToStorage(JSON.stringify(project.toData())))
  };

  // hardcode first pack found for now for debugging
  selectedPack = packs[0];
  instrument = await instrumentFromDS(`${baseUrl}${selectedPack.path}/`, context, selectedPack);

  // load from saved data in localstorage
  const data = loadFromStorage();
  if (data) {
    project = await Project.fromData(context, selectPack, data);
    machineState.tracks = project.tracks;

    console.log("LOADED project", project);
  }
  projectPlayer = new ProjectPlayer(context, project, handleOnNextBeat);

  initControls(packs.map((p) => p.name), controls, machineState);
}

async function selectPack(name) {
  if (!name) {
    console.log("no point looking up undefined instrument pack name");
    return;
  }
  console.log('looking for:' + name, packs)
  selectedPack = packs.find((p) => p.name === name);
  console.log('selected:', selectedPack);
  instrument = await instrumentFromDS(`${baseUrl}${selectedPack.path}/`, context, selectedPack);
  if (machineState.currentTrack) {
    machineState.currentTrack.instrument = instrument;
  } else {
    console.log("no current track to set instrument on");
  }
  console.log('current sampleplayer', instrument);
  return instrument;
}

// Load a multisample pack using a DecentSampler .dspresets file format at given url
/// returns a DSPreset
async function loadDSPreset(url, name, path) {
  const response = await fetch(url);
  const body = await response.text();
  const ds = new DSPreset(new window.DOMParser().parseFromString(body, "text/xml"), name, path);
  return ds;
}

function handleOnNextBeat(beatCount) {
  //console.log('Sampler BEAT:' + beatCount)
}

const projectKey = 'default.project';

function saveToStorage(jsonString) {
  localStorage.setItem(projectKey, jsonString);
}

function loadFromStorage() {
  let jsonStr = localStorage.getItem(projectKey);
  return JSON.parse(jsonStr);
}