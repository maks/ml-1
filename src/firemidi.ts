export let midiOutput: WebMidi.MIDIOutput;
export let midiInput: WebMidi.MIDIInput;

export * from "./fire_raw/controlbank_led.js";

import { TransportControls } from "./fire_controls/transport.js";
import { PadControls, RowButtonState } from "./fire_controls/pads.js";
import { clearAll } from "./fire_controls/device.js";
import { OledScreen } from "./fire_controls/oled.js";
import { MidiDispatcher } from "./midi_dispatcher.js";
import { TrackHead } from "./fire_controls/track_head.js";

export let dispatcher: MidiDispatcher;

export let pads: PadControls;

export function testTransport() {
  let ticker: number | null = null;

  const t = new TransportControls({
    midi: dispatcher,
    onPlay: () => {
      t.play();
      if (ticker) {
        console.log('Pause')
        clearInterval(ticker);
        ticker = null;
      } else {
        console.log('Play');
        head.start();
        ticker = setInterval(tick, 1000);
      }
    },
    onStop: () => {
      console.log('Stop')
      t.stop();
      head.reset();
      head.start();
      if (ticker) {
        clearInterval(ticker);
        ticker = null;
      }
    },
    onRecord: () => {
      console.log('Rec');
      t.record();
    },
  });
  t.allOff();

  pads = new PadControls(
    {
      midi: dispatcher,
      onPad: (index) => {
        console.log('PAD:' + index)
        pads.padLedOn(index, { r: 0, g: 0, b: 100 });
      }
    }
  );
  pads.allOff();

  const head = new TrackHead(pads);

  function tick() {
    head.next();
  }
}

export function testsolo(track: number) {
  pads.rowButtonLed(track, RowButtonState.Off)
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

export function allOff() { clearAll(midiOutput); }