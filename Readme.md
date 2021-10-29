# ML-1

This is intended to be a "diy-groovebox" project, using a RPI4 and a Akai Fire midicontroller.

The intention is to run Chromium headless (using puppeteer to launch & control) on a headless RPI4, connected to the Fire and using a USB battery for power to make the complete setup standalone and portable.

Using Chromium gives easy access to Midi to interface with the Akai Fire (as well as other midi devices in future) as well as WebAudio API and WASM support in the new AudioWorklet API.

## Status

The initial version is implementing all the controls for the shiny-drum-machine and then to extend it a little, mainly around improving the sequencer functionality. Once the "drum machine" functionality is working, will move on to 


## Features:

A rough roadmap of planned features:

- [x] connect to Fire via webmidi
- [x] send bitmap to OLED with sysex from webmidi
- [x] high level interface for Fire controlsurface
- [x] drum sequencer based on shiny-drum-machine
- [ ] sampler playback using decent sampler instrument preset files
- [ ] seq based on shiny-drums, using sampler instruments
- [ ] improved seq: upto 64 step, microtiming
- [ ] control dx7 FM synth via Fire controls
- [ ] OLED wave, spectrum visualiser
- [ ] ADSR control-visualiser on OLED
- [ ] midi sequencer
- [ ] audio mixer
- [ ] record/playback audio
- [ ] audio looper
- [ ] fx (using impulses from shiny-drum or tuna?)

---
## Trying it out

Install deps using npm or yarn.

To run http server to serve code and samples content:
```
node src/file_server/servedir.js 8008 .
```

### Devtools

testing using devtools console:
``` javascript
const m = await import('/dist/firemidi.js');
m.getMidi();

m.testTransport();

// test OLED
function testBitmap() {
  const oled = [];
  for (var i = 0; i < 128 * 8; i++) {
    oled[i] = (i % 2) == 0;
  }
  sendSysexBitmap(oled);
}
```
---

## Refs and notes

### Typescript

https://www.prisma.io/blog/learn-typescript-a-pocketguide-tutorial-q329XmXQHUjz

https://medium.com/@salathielgenese/setup-typescript-for-modern-browser-a75d699673f6

### ES Modules

https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

### how to not use bundlers

https://blog.logrocket.com/building-without-bundling/

### import maps
https://stackoverflow.com/a/56746062/85472
https://github.com/WICG/import-maps
https://chromestatus.com/feature/5315286962012160

## WebMidi

https://github.com/djipco/webmidi

### sysex
https://webmidijs.org/docs/v2.5.2/classes/Output.html#method_sendSysex

### Chrome Audio samples

https://googlechromelabs.github.io/web-audio-samples/

https://googlechromelabs.github.io/web-audio-samples/shiny-drum-machine/

https://googlechromelabs.github.io/web-audio-samples/audio-recorder/

https://googlechromelabs.github.io/web-audio-samples/archive/demos/wavetable-synth.html

### WebAudio

https://tonejs.github.io/
https://tonejs.github.io/demos
https://github.com/Tonejs/Tone.js/wiki/Performance

https://github.com/googlecreativelab/chrome-music-lab
https://googlechromelabs.github.io/web-audio-samples/dj/

https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques

https://codepen.io/DonKarlssonSan/post/fun-with-web-audio-api
https://codepen.io/DonKarlssonSan/post/drum-loops-and-effects-with-web-audio-api
https://codepen.io/DonKarlssonSan/post/more-fun-with-web-audio-api

https://teropa.info/blog/2016/07/28/javascript-systems-music.html
https://jakearchibald.com/2016/sounds-fun/

https://www.phpied.com/webaudio-deep-note-part-3-loop-and-change-pitch/

https://github.com/danigb/synth-kit

### WebAudio Sampler

https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop

### License

Various parts of this project are licensed per their original projects licenses. Original code for ML-1 is licensed under BSD license per the license file included in this git repo.