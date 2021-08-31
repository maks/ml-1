
interface Color {
  r: number,
  g: number,
  b: number
}

/// turn on and set the colour of a pad button
// export function colorPad(int padRow, int padColumn, PadColor color) {
export function colorPad(midiOutput: WebMidi.MIDIOutput, padRow: number, padColumn: number, color: Color) {
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
