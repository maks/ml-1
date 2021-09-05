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

  private drawHeading(oledBitmap: Oled, heading: string) {
    oledBitmap.clear();
    oledBitmap.setCursor(0, 0);
    oledBitmap.writeString(font, 1, heading, true, true, 1);
    oledBitmap.setCursor(0, lineHeight);
    oledBitmap.writeString(font, 1, '='.repeat(heading.length), true, true, 1);

    sendSysexBitmap(this.midiOutput, oledBitmap.bitmap);
  }

  // testDraw() {
  //   oledBitmap.clear();
  //   oledBitmap.setCursor(20, 20);
  //   oledBitmap.drawRect(0, 0, 30, 40, true);
  //   sendSysexBitmap(this.midiOutput, oledBitmap.bitmap);
  // }
}
