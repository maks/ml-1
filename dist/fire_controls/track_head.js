export class TrackHead {
    constructor(pads) {
        this.index = 0;
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
    update() {
        this.pads.allOff();
        this.pads.padLedOn(this.index);
        this.pads.padLedOn(this.index + 16);
        this.pads.padLedOn(this.index + 32);
        this.pads.padLedOn(this.index + 48);
    }
}
