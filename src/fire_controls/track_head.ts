import { PadControls } from "./pads";

export class TrackHead {
  private index = 0;
  private pads: PadControls;

  constructor(pads: PadControls) {
    this.pads = pads;
  }

  start() {
    this.update();
  }

  next() {
    this.index++;
    this.update();
  }

  reset() {
    this.index = 0;
    this.pads.allOff();
  }

  private update() {
    this.pads.allOff();
    this.pads.padLedOn(this.index);
    this.pads.padLedOn(this.index + 16);
    this.pads.padLedOn(this.index + 32);
    this.pads.padLedOn(this.index + 48);
  }
}