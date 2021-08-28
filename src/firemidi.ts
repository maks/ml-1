export let midiOutput: WebMidi.MIDIOutput;

export * from "./controlbank_led.js";

export * from "./mono_canvas.js";

export * from "./oled_font57.js";

import { font5x7 } from "./oled_font57.js";
import { Oled } from "./mono_canvas.js";
import { sendSysexBitmap } from "./fire_oled.js";

const lineHeight = 8;
const font = font5x7;
const oledBitmap: Oled = new Oled(64, 128);

export function drawHeading(heading: string) {
  oledBitmap.clear();
  oledBitmap.setCursor(0, 0);
  oledBitmap.writeString(font, 1, heading, true, true, 1);
  oledBitmap.setCursor(0, lineHeight);
  oledBitmap.writeString(font, 1, '='.repeat(heading.length), true, true, 1);

  sendSysexBitmap(midiOutput, oledBitmap.bitmap);
}

export function testDraw() {
  oledBitmap.clear();
  oledBitmap.setCursor(20, 20);
  oledBitmap.drawRect(0, 0, 30, 40, true);
  sendSysexBitmap(midiOutput, oledBitmap.bitmap);
}


export function getMidi() {
  navigator.requestMIDIAccess({ sysex: true })
    .then(function (midiAccess) {
      const outputs = midiAccess.outputs.values();
      console.log(outputs);
      for (const output of outputs) {
        console.log(output);
        midiOutput = output;
      }
    });
}

export function clearAll() {
  midiOutput.send([0xB0, 0x7F, 0]);
}

interface Color {
  r: number,
  g: number,
  b: number
}

/// turn on and set the colour of a pad button
// export function colorPad(int padRow, int padColumn, PadColor color) {
export function colorPad(padRow: number, padColumn: number, color: Color) {
  const sysexHeader = [
    0xF0, // System Exclusive
    0x47, // Akai Manufacturer ID
    0x7F, // The All-Call address
    0x43, // “Fire” product
    0x65, // Write LED cmd
    0x00, // mesg length - high byte
    0x04, // mesg length - low byte
  ];
  const sysexFooter = [
    0xF7, // End of Exclusive
  ];

  const ledData = [
    (padRow * 16 + padColumn),
    color.r,
    color.g,
    color.b,
  ];

  const midiData = [...sysexHeader, ...ledData, ...sysexFooter];

  midiOutput.send(midiData);
}
