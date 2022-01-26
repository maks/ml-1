import { MidiDispatcher } from "../midi_dispatcher";
import { Color } from "../app/globals";

/// turn on and set the colour of a pad button
// export function colorPad(int padRow, int padColumn, PadColor color) {
export function colorPad(midi: MidiDispatcher, padIndex: number, color: Color) {
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
    padIndex,
    color.r,
    color.g,
    color.b,
  ];

  const midiData = [...sysexHeader, ...ledData, ...sysexFooter];

  midi.send(midiData);
}

export function allPadsColor(midi: MidiDispatcher, color: Color) {
  const sysexHeader = [
    0xF0, // System Exclusive
    0x47, // Akai Manufacturer ID
    0x7F, // The All-Call address
    0x43, // “Fire” product
    0x65, // Write LED cmd
    0x02, // mesg length - high byte
    0x00, // mesg length - low byte
  ];
  const sysexFooter = [
    0xF7, // End of Exclusive
  ];

  let allLeds = [];

  for (var idx = 0; idx < 64; idx++) {
    const ledData = [
      idx,
      color.r,
      color.g,
      color.b,
    ];
    allLeds.push(...ledData);
  }

  const midiData = [...sysexHeader, ...allLeds, ...sysexFooter];

  midi.send(midiData);
}