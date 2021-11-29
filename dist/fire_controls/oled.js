import { font5x7 } from "../oled/oled_font57.js";
import { MonoCanvas } from "../oled/mono_canvas.js";
import { sendSysexBitmap } from "../fire_raw/fire_oled.js";
const lineHeight = 8;
const font = font5x7;
const HIEGHT = 64;
const WIDTH = 128;
const debugOledHtml = false;
export class OledScreen {
    constructor(midiOutput) {
        this.midiOutput = midiOutput;
        this.oledBitmap = new MonoCanvas(HIEGHT, WIDTH);
    }
    heading(heading) {
        this.drawHeading(this.oledBitmap, heading);
    }
    textline(line, highlight, text) {
        const lineY = (font.height * line);
        this.oledBitmap.setCursor(0, lineY);
        // line background to highlight whole of selected line
        this.oledBitmap.fillRect(0, lineY, WIDTH, font.height, highlight);
        this.oledBitmap.writeString(font, 1, text, !highlight);
        const bitmap = this.oledBitmap.bitmap();
    }
    bigText(text) {
        const bigFontSize = 4;
        this.oledBitmap.setCursor(20, (font.height * 3) + 2);
        this.oledBitmap.writeString(font, bigFontSize, text, true);
        sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap());
        this._sendToHtmlOled();
    }
    sendBitmap() {
        const bitmap = this.oledBitmap.bitmap();
        sendSysexBitmap(this.midiOutput, bitmap);
        this._sendToHtmlOled();
    }
    clear() {
        this.oledBitmap.clear();
    }
    drawHeading(oledBitmap, heading) {
        let vertical_padding = 1;
        this.oledBitmap.setCursor(0, vertical_padding);
        this.oledBitmap.fillRect(0, 0, WIDTH, (font.height * 2) + (vertical_padding * 3), true);
        this.oledBitmap.writeString(font, 2, heading, false);
        this.oledBitmap.setCursor(0, lineHeight);
        sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap());
        this._sendToHtmlOled();
    }
    _sendToHtmlOled() {
        if (debugOledHtml) {
            window.setOledSim(this.oledBitmap.bitmap());
        }
    }
}
//# sourceMappingURL=oled.js.map