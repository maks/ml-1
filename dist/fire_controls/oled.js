import { font5x7 } from "../oled/oled_font57.js";
import { Oled } from "../oled/mono_canvas.js";
import { sendSysexBitmap } from "../fire_raw/fire_oled.js";
const lineHeight = 8;
const font = font5x7;
export class OledScreen {
    constructor(midiOutput) {
        this.midiOutput = midiOutput;
        this.oledBitmap = new Oled(64, 128);
    }
    heading(heading) {
        this.drawHeading(this.oledBitmap, heading);
    }
    textline(line, highlight, text) {
        this.drawText(this.oledBitmap, line, highlight, text);
    }
    bigText(text) {
        this.drawBigCenteredText(this.oledBitmap, text);
    }
    clear() {
        this.oledBitmap.clear();
    }
    drawHeading(oledBitmap, heading) {
        let vertical_padding = 1;
        this.oledBitmap.setCursor(0, vertical_padding);
        this.oledBitmap.fillRect(0, 0, 128, (font.height * 2) + (vertical_padding * 3), true);
        this.oledBitmap.writeString(font, 2, heading, false, true, 1);
        this.oledBitmap.setCursor(0, lineHeight);
        sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap);
    }
    drawText(oledBitmap, line = 0, highlight, text) {
        this.oledBitmap.setCursor(0, (font.height * line));
        // line background to highlight whole of selected line
        this.oledBitmap.fillRect(0, (font.height * line), 128, font.height, highlight);
        this.oledBitmap.writeString(font, 1, text, !highlight, true, 1);
        sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap);
    }
    drawBigCenteredText(oledBitmap, text) {
        this.oledBitmap.setCursor(20, (font.height * 3) + 2);
        this.oledBitmap.writeString(font, 4, text, true, false, 1);
        sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap);
    }
}
