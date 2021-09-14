import { font5x7 } from "../oled/oled_font57.js";
import { Oled } from "../oled/mono_canvas.js";
import { sendSysexBitmap } from "../fire_raw/fire_oled.js";

const lineHeight = 8;
const font = font5x7;

export class OledScreen {
  midiOutput: WebMidi.MIDIOutput;
  oledBitmap: Oled;

  constructor(midiOutput: WebMidi.MIDIOutput) {
    this.midiOutput = midiOutput;
    this.oledBitmap = new Oled(64, 128);
  }

  heading(heading: string) {
    this.drawHeading(this.oledBitmap, heading);
  }

  textline(line: number, highlight: boolean, text: string) {
    this.drawText(this.oledBitmap, line, highlight, text);
  }

  clear() {
    this.oledBitmap.clear();
  }

  private drawHeading(oledBitmap: Oled, heading: string) {
    this.oledBitmap.setCursor(0, 0);
    this.oledBitmap.writeString(font, 1, heading, true, true, 1);
    this.oledBitmap.setCursor(0, lineHeight);
    this.oledBitmap.writeString(font, 1, '='.repeat(heading.length), true, true, 1);

    sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap);
  }

  private drawText(oledBitmap: Oled, line: number = 0, highlight: boolean, text: string) {
    this.oledBitmap.setCursor(0, (7 * line));

    // line background to highlight whole of selected line
    this.oledBitmap.fillRect(0, (7 * line), 128, 7, highlight);

    this.oledBitmap.writeString(font, 1, text, !highlight, true, 1);
    sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap);
  }
}
