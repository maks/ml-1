To install dev server:
```
yarn add --dev live-server
```

```
tsc --project tsconfig.json
```
and then:
```
yarn run live-server
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

## Features:

- [x] connect to Fire via webmidi
- [x] send bitmap to OLED with sysex from webmidi
- [x] high level interface for Fire controlsurface
- [ ] drum sequencer based on shiny-drum-machine
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