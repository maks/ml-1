import { Project } from "../data/project";
import * as Tone from "https://unpkg.com/tone@14.7.77/build/esm/index.js?module";

export class ML1Player {
  _project: Project;

  constructor(project: Project) {
    this._project = project;
  }

  togglePlay() {
    if (Tone.Transport.state !== 'started') {
      this.play();
    } else {
      this.pause();
    }
  }

  play() {
    console.log('ML1 Playing');
    Tone.Transport.start();
  }

  pause() {
    console.log('ML1 Stopped');
    Tone.Transport.stop();
  }
}