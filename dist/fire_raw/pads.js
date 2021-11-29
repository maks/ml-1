/// turn on and set the colour of a pad button
// export function colorPad(int padRow, int padColumn, PadColor color) {
export function colorPad(midi, padIndex, color) {
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
        padIndex,
        color.r,
        color.g,
        color.b,
    ];
    const midiData = [...sysexHeader, ...ledData, ...sysexFooter];
    midi.send(midiData);
}
export function allPadsColor(midi, color) {
    const sysexHeader = [
        0xF0,
        0x47,
        0x7F,
        0x43,
        0x65,
        0x02,
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
//# sourceMappingURL=pads.js.map