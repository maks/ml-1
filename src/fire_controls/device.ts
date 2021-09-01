
export function clearAll(midiOutput: WebMidi.MIDIOutput) {
  midiOutput.send([0xB0, 0x7F, 0]);
}
