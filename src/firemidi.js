export let midiOutput = null;

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

/// turn on and set the colour of a pad button
// export function colorPad(int padRow, int padColumn, PadColor color) {
export function colorPad(padRow, padColumn, color) {
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

  // const b = BytesBuilder();
  // b.add(sysexHeader);
  // b.add(ledData);
  // b.add(sysexFooter);

  // final midiData = b.toBytes();
  const midiData = [...sysexHeader, ...ledData, ...sysexFooter];

  midiOutput.send(midiData);
}