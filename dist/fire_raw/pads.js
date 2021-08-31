/// turn on and set the colour of a pad button
// export function colorPad(int padRow, int padColumn, PadColor color) {
export function colorPad(midiOutput, padRow, padColumn, color) {
    const sysexHeader = [
        0xF0,
        0x47,
        0x7F,
        0x43,
        0x65,
        0x00,
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
