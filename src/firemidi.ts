export let midiOutput: WebMidi.MIDIOutput;
export let midiInput: WebMidi.MIDIInput;

export * from "./fire_raw/controlbank_led.js";

export * from "./oled/mono_canvas.js";

export * from "./oled/oled_font57.js";

import { font5x7 } from "./oled/oled_font57.js";
import { Oled } from "./oled/mono_canvas.js";
import { sendSysexBitmap } from "./fire_raw/fire_oled.js";
import { CCInputs } from "./fire_raw/cc_inputs.js";

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

export function testTransport() {
  const t = new TransportControls({
    midiInput: midiInput,
    onPlay: () => {
      console.log('Play')
    },
    onStop: () => {
      console.log('Stop')
    },
    onRecord: () => {
      console.log('Rec')
    },
  });
}


export function getMidi() {
  navigator.requestMIDIAccess({ sysex: true })
    .then(function (midiAccess) {
      const outputs = midiAccess.outputs.values();
      const inputs = midiAccess.inputs.values();

      console.log(outputs);
      for (const output of outputs) {
        console.log(output);
        midiOutput = output;
      }

      console.log(inputs);
      for (const input of inputs) {
        console.log(input);
        midiInput = input;
      }

      midiOutput.onstatechange = (state) =>
        console.log("state change:" + state);

      midiInput.onmidimessage = listenMidi;

    });
}

export function listenMidi(mesg: WebMidi.MIDIMessageEvent) {
  console.log(`Midi mesg data: ${mesg.data}`);
}

export function clearAll() {
  midiOutput.send([0xB0, 0x7F, 0]);
}

export class TransportControls {
  playListener: () => void;
  stopListener: () => void;
  recordListener: () => void;

  constructor({ midiInput, onPlay, onStop, onRecord }:
    {
      midiInput: WebMidi.MIDIInput,
      onPlay: () => void
      onStop: () => void
      onRecord: () => void
    }) {
    midiInput.onmidimessage = (e) => this.onMidiMessage(e);
    this.playListener = onPlay;
    this.stopListener = onStop;
    this.recordListener = onRecord;
  }

  private onMidiMessage(mesg: WebMidi.MIDIMessageEvent) {
    if (mesg.data[0] != CCInputs.buttonDown) {
      return;
    }
    switch (mesg.data[1]) {
      case CCInputs.play:
        this.playListener();
        break;
      case CCInputs.stop:
        this.stopListener();
        break;
      case CCInputs.record:
        this.recordListener();
        break;
    }
  }

}