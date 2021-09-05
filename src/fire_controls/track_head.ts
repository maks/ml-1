import { PadControls } from "./pads";

export class TrackHead {
  private index = 0;
  private pads: PadControls;
  private length: number;

  constructor(pads: PadControls, length: number) {
    this.pads = pads;
    this.length = length;
  }

  start() {
    this.update();
  }

  next() {
    this.index = (this.index == this.length) ? 0 : this.index + 1;
    this.update();
  }

  reset() {
    this.index = 0;
  }

  private update() {
    this.pads.padLedOn(this.index);
    this.pads.padLedOn(this.index + 16);
    this.pads.padLedOn(this.index + 32);
    this.pads.padLedOn(this.index + 48);
  }
}