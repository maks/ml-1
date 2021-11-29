export function clearAll(midiOutput) {
    midiOutput.send([0xB0, 0x7F, 0]);
}
//# sourceMappingURL=device.js.map