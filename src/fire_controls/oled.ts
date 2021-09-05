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

  textline(line: number, text: string) {
    this.drawText(this.oledBitmap, line, text);
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

  private drawText(oledBitmap: Oled, line: number = 0, text: string) {
    this.oledBitmap.setCursor(0, (7 * line));
    this.oledBitmap.writeString(font, 1, text, true, true, 1);
    sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap);
  }

  // testDraw() {
  //   oledBitmap.clear();
  //   oledBitmap.setCursor(20, 20);
  //   oledBitmap.drawRect(0, 0, 30, 40, true);
  //   sendSysexBitmap(this.midiOutput, oledBitmap.bitmap);
  // }
}
