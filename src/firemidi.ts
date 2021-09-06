export let midiOutput: WebMidi.MIDIOutput;

export * from "./fire_raw/controlbank_led.js";

export { TransportControls } from "./fire_controls/transport.js";

import { PadControls, PadColour } from "./fire_controls/pads.js";
import { clearAll } from "./fire_controls/device.js";
import { OledScreen } from "./fire_controls/oled.js";
import { MidiDispatcher } from "./midi_dispatcher.js";
import { TrackHead } from "./fire_controls/track_head.js";
import { TransportControls } from "./fire_controls/transport.js";
import { DialControls, dialCallback } from "./fire_controls/dials.js";

export let dispatcher: MidiDispatcher;

let firePads: PadControls;
let oled: OledScreen;
let dials: DialControls;

type voidcallback = () => void;

//TODO: make config param in future
const BAR_LENGTH = 16;

export function setupTransport(
  onPlay: voidcallback,
  onStop: voidcallback,
  onRecord: voidcallback) {

  const transport = new TransportControls({
    midi: dispatcher,
    onPlay: () => {
      console.log('ts play');
      transport.play()
      onPlay()
    },
    onStop: () => {
      transport.stop()
      onStop()
    },
    onRecord: () => {
      transport.record()
      onRecord()
    },
  });
}

export function setupPads(onPad: (padIndex: number) => void) {
  firePads = new PadControls(
    {
      midi: dispatcher,
      onPad: (index) => {
        console.log('PAD:' + index)
        onPad(index);
      }
    }
  );
  firePads.allOff();
  const head = new TrackHead(firePads, BAR_LENGTH);

  return {
    nextBeat: () => { head.next(); },
    resetBeat: () => { head.reset(); },
    padLedOn: (padIndex: number, colour?: PadColour) => {
      firePads.padLedOn(padIndex, colour);
    }
  };
}

export function setupOled() {
  oled = new OledScreen(midiOutput);
  return {
    heading: oledHeading,
    text: oledText
  };
}

export function setupDials({
  onVolume,
  onPan,
  onFilter,
  onResonance,
  onSelect
}: {
  onVolume: dialCallback,
  onPan: dialCallback,
  onFilter: dialCallback,
  onResonance: dialCallback,
  onSelect: dialCallback
}) {

  dials = new DialControls({
    midi: dispatcher,
    onVolume: onVolume,
    onPan: onPan,
    onFilter: onFilter,
    onResonance: onResonance,
    onSelect: onSelect
  });
}

function oledHeading(heading: string) {
  oled.heading(heading);
}

function oledText(line: number, text: string, highlight?: boolean) {
  oled.textline(line, highlight ?? false, text);
}

// export function testsolo(track: number) {
//   firePads.rowButtonLed(track, RowButtonState.Off)
// }


export function getMidi(midiReadyCallback: () => void) {
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
      let midiInput;
      for (const input of inputs) {
        console.log(input);
        midiInput = input;
      }
      midiOutput.onstatechange = (state) =>
        console.log("state change:" + state);

      if (midiInput != null) {
        dispatcher = new MidiDispatcher(midiInput, midiOutput);
      } else {
        console.error("== MISSING midiInput cannot create Dispatcher ==");
      }

      midiReadyCallback();
    });
}

export function allOff() { clearAll(midiOutput); }