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
const m = await import('/src/firemidi.js');
m.getMidi();

// test pad color
m.colorPad(1,1,{r: 25, g:25, b:25});

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

refs: 
https://medium.com/@salathielgenese/setup-typescript-for-modern-browser-a75d699673f6

## how to not use bundlers

https://blog.logrocket.com/building-without-bundling/

### import maps
https://stackoverflow.com/a/56746062/85472
https://github.com/WICG/import-maps
https://chromestatus.com/feature/5315286962012160


## WebMidi

https://github.com/djipco/webmidi

### sysex
https://webmidijs.org/docs/v2.5.2/classes/Output.html#method_sendSysex
