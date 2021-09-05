export class TrackHead {
    constructor(pads, length) {
        this.index = 0;
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
    update() {
        this.pads.padLedOn(this.index);
        this.pads.padLedOn(this.index + 16);
        this.pads.padLedOn(this.index + 32);
        this.pads.padLedOn(this.index + 48);
    }
}
