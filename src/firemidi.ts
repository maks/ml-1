export let midiOutput: WebMidi.MIDIOutput;

export * from "./fire_raw/controlbank_led.js";

export { TransportControls } from "./fire_controls/transport.js";

export { ButtonCode } from "./fire_controls/buttons.js";

import { PadControls, PadColour } from "./fire_controls/pads.js";
import { clearAll } from "./fire_controls/device.js";
import { OledScreen } from "./fire_controls/oled.js";
import { MidiDispatcher } from "./midi_dispatcher.js";
import { TrackHead } from "./fire_controls/track_head.js";
import { TransportControls } from "./fire_controls/transport.js";
import { DialControls, dialCallback } from "./fire_controls/dials.js";
import { ButtonControls, ButtonCode } from "./fire_controls/buttons.js";

export let dispatcher: MidiDispatcher;



let firePads: PadControls;
let oled: OledScreen;
let dials: DialControls;
let buttons: ButtonControls;

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

export function setupButtons(
  {
    browser,
    patternUp,
    patternDown,
    gridLeft,
    gridRight,
    step,
    note,
    drum,
    perform,
    shift,
    alt,
    pattern
  }:
    {
      browser: voidcallback,
      patternUp: voidcallback,
      patternDown: voidcallback,
      gridLeft: voidcallback,
      gridRight: voidcallback,
      step: voidcallback,
      note: voidcallback,
      drum: voidcallback,
      perform: voidcallback,
      shift: voidcallback,
      alt: voidcallback,
      pattern: voidcallback
    }
) {

  buttons = new ButtonControls(
    {
      midi: dispatcher,
      onButton: (code: ButtonCode) => {
        switch (code) {
          case ButtonCode.Browser:
            browser();
            break;
          case ButtonCode.PatternUp:
            patternUp();
            break;
          case ButtonCode.PatternDown:
            patternDown();
            break;
          case ButtonCode.GridLeft:
            gridLeft();
            break;
          case ButtonCode.GridRight:
            gridRight();
            break;
          case ButtonCode.Step:
            step();
            break;
          case ButtonCode.Note:
            note();
            break;
          case ButtonCode.Drum:
            drum();
            break;
          case ButtonCode.Perform:
            perform();
            break;
          case ButtonCode.Shift:
            shift();
            break;
          case ButtonCode.Alt:
            alt();
            break;
          case ButtonCode.Pattern:
            pattern();
            break;
        }
      }
    }
  );
  return {
    buttonLedOn: (button: number, colour?: number) => {
      buttons.buttonOn(button, colour);
    }
  };
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