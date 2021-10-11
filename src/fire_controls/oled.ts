import { font5x7 } from "../oled/oled_font57.js";
import { MonoCanvas } from "../oled/mono_canvas.js";
import { sendSysexBitmap } from "../fire_raw/fire_oled.js";

export interface CustomWindow extends Window {
  setOledSim: any;
}

declare let window: CustomWindow;

const lineHeight = 8;
const font = font5x7;
const HIEGHT = 64;
const WIDTH = 128;

const debugOledHtml = false;

export class OledScreen {
  midiOutput: WebMidi.MIDIOutput;
  oledBitmap: MonoCanvas;

  constructor(midiOutput: WebMidi.MIDIOutput) {
    this.midiOutput = midiOutput;
    this.oledBitmap = new MonoCanvas(HIEGHT, WIDTH);
  }

  heading(heading: string) {
    this.drawHeading(this.oledBitmap, heading);
  }

  textline(line: number, highlight: boolean, text: string) {
    const lineY = (font.height * line);
    this.oledBitmap.setCursor(0, lineY);
    // line background to highlight whole of selected line
    this.oledBitmap.fillRect(0, lineY, WIDTH, font.height, highlight);
    this.oledBitmap.writeString(font, 1, text, !highlight);
    const bitmap = this.oledBitmap.bitmap();
  }

  bigText(text: string) {
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

  drawHeading(oledBitmap: MonoCanvas, heading: string) {
    let vertical_padding = 1;
    this.oledBitmap.setCursor(0, vertical_padding);
    this.oledBitmap.fillRect(0, 0, WIDTH, (font.height * 2) + (vertical_padding * 3), true);
    this.oledBitmap.writeString(font, 2, heading, false);
    this.oledBitmap.setCursor(0, lineHeight);

    sendSysexBitmap(this.midiOutput, this.oledBitmap.bitmap());
    this._sendToHtmlOled();
  }

  private _sendToHtmlOled() {
    if (debugOledHtml) {
      window.setOledSim(this.oledBitmap.bitmap());
    }
  }
}
