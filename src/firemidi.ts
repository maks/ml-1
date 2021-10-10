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
import { sendSysexBitmap } from "./fire_raw/fire_oled.js";

export let dispatcher: MidiDispatcher;

let firePads: PadControls;
let oled: OledScreen;
let dials: DialControls;
let buttons: ButtonControls;

type voidcallback = () => void;
type boolcallback = (dir: boolean) => void;

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

export interface PadsControl {
  nextBeat: VoidFunction,
  resetBeat: VoidFunction,
  padLedOn: (padIndex: number, colour?: PadColour) => void,
}

export function setupPads(onPad: (padIndex: number) => void): PadsControl {
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

export type ShowStringFunction = (a: string) => void;
export type ShowStringStringFunction = (a: string, b: string) => void;
export type VoidFunction = () => void;

export interface OledControl {
  heading: ShowStringFunction,
  text: (line: number, text: string, highlight?: boolean) => void,
  clear: VoidFunction,
  big: ShowStringFunction,
  bigTitled: ShowStringStringFunction,
  send: VoidFunction,
}

export function setupOled(): OledControl {
  oled = new OledScreen(midiOutput);
  return {
    heading: oledHeading,
    text: oledText,
    clear: oledClear,
    big: oledBigText,
    bigTitled: oledBigWithTitle,
    send: oledSendBitmap,
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

export interface ButtonsSetup {
  browser: boolcallback,
  patternUp: boolcallback,
  patternDown: boolcallback,
  gridLeft: boolcallback,
  gridRight: boolcallback,
  step: boolcallback,
  note: boolcallback,
  drum: boolcallback,
  perform: boolcallback,
  shift: boolcallback,
  alt: boolcallback,
  pattern: boolcallback,
  solomute1: boolcallback,
  solomute2: boolcallback,
  solomute3: boolcallback,
  solomute4: boolcallback,
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
    pattern,
    solomute1,
    solomute2,
    solomute3,
    solomute4
  }: ButtonsSetup
) {

  buttons = new ButtonControls(
    {
      midi: dispatcher,
      onButton: (code: ButtonCode, up: boolean) => {
        switch (code) {
          case ButtonCode.Browser:
            browser(up);
            break;
          case ButtonCode.PatternUp:
            patternUp(up);
            break;
          case ButtonCode.PatternDown:
            patternDown(up);
            break;
          case ButtonCode.GridLeft:
            gridLeft(up);
            break;
          case ButtonCode.GridRight:
            gridRight(up);
            break;
          case ButtonCode.Step:
            step(up);
            break;
          case ButtonCode.Note:
            note(up);
            break;
          case ButtonCode.Drum:
            drum(up);
            break;
          case ButtonCode.Perform:
            perform(up);
            break;
          case ButtonCode.Shift:
            shift(up);
            break;
          case ButtonCode.Alt:
            alt(up);
            break;
          case ButtonCode.Pattern:
            pattern(up);
            break;
          case ButtonCode.SoloMute1:
            solomute1(up);
            break;
          case ButtonCode.SoloMute2:
            solomute2(up);
            break;
          case ButtonCode.SoloMute3:
            solomute3(up);
            break;
          case ButtonCode.SoloMute4:
            solomute4(up);
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

function oledClear() {
  oled.clear();
}

function oledBigText(text: string) {
  oled.bigText(text);
}

function oledSendBitmap() {
  oled.sendBitmap();
}

function oledBigWithTitle(title: string, value: string) {
  oled.heading(title);
  oled.bigText(value);
}

export function getMidi(midiReadyCallback: () => void, midiStateChange: (connected: boolean) => void) {
  navigator.requestMIDIAccess({ sysex: true })
    .then(function (midiAccess) {
      console.log("MIDI Access Ready, getting input, outputs...")
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
      midiOutput.onstatechange = (state) => {
        console.log("state change:", state);
        //TODO: callback if connect event for a Fire
        //midiStateChange((state.isTrusted && state.target instanceof  WebMidi.MIDIOutput));
      }

      if (midiInput != null) {
        dispatcher = new MidiDispatcher(midiInput, midiOutput);
      } else {
        console.error("== MISSING midiInput cannot create Dispatcher ==");
      }

      midiReadyCallback();
    });
}

export function allOff() { clearAll(midiOutput); }