export let midiOutput: WebMidi.MIDIOutput;
export let midiInput: WebMidi.MIDIInput;

export * from "./fire_raw/controlbank_led.js";

import { TransportControls } from "./fire_controls/transport.js";
import { PadControls } from "./fire_controls/pads.js";
import { clearAll } from "./fire_controls/device.js";
import { OledScreen } from "./fire_controls/oled.js";
import { MidiDispatcher } from "./midi_dispatcher.js";

export function allOff() { clearAll(midiOutput); }

export let dispatcher: MidiDispatcher;

export function testTransport() {
  const t = new TransportControls({
    midi: dispatcher,
    onPlay: () => {
      console.log('Play')
      t.play();
    },
    onStop: () => {
      console.log('Stop')
      t.stop();
    },
    onRecord: () => {
      console.log('Rec');
      t.record();
    },
  });
  t.allOff();

  const p = new PadControls(
    {
      midi: dispatcher,
      onPad: (index) => {
        console.log('PAD:' + index)
        p.ledOn(index);
      }
    }
  );
  p.allOff();
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

      dispatcher = new MidiDispatcher(midiInput, midiOutput);

    });
}

