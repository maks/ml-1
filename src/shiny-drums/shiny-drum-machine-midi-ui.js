/* eslint require-jsdoc: "off" */

// class Slider {
//   constructor(element, opts = {}) {
//     this.element = element;
//     this.onchange = () => { };

//     element.addEventListener('input', () => {
//       this.onchange(this.value);
//     });

//     if (opts && opts.doubleClickValue) {
//       element.addEventListener('dblclick', () => {
//         this.value = opts.doubleClickValue;
//         this.onchange(this.value);
//       });
//     }
//   }

//   get value() {
//     return Number(this.element.value) / 100;
//   }

//   set value(value) {
//     this.element.value = value * 100;
//   }
// }

// class EffectSlider extends Slider {
//   constructor(container = document) {
//     super(container.getElementById('effect_thumb'));
//   }
// }

// class SwingSlider extends Slider {
//   constructor(container = document) {
//     super(container.getElementById('swing_thumb'));
//   }
// }

// class PitchSliders {
//   constructor(container = document) {
//     this.sliders = {};
//     this.onPitchChange = (instrument, pitch) => { };
//     const selector = '[data-instrument][data-pitch]';
//     for (const el of container.querySelectorAll(selector)) {
//       this.sliders[el.dataset.instrument] = new Slider(el,
//         { doubleClickValue: 0.5 });
//       this.sliders[el.dataset.instrument].onchange = (value) => {
//         this.onPitchChange(el.dataset.instrument, value);
//       };
//     }
//   }

//   setPitch(instrument, pitch) {
//     this.sliders[instrument].value = pitch;
//   }
// }

class Playheads {
  constructor() {
    this.current = 0;
    this.leds = {};

    const selector = '[data-led][data-rhythm]';
    for (const el of document.querySelectorAll(selector)) {
      const i = Number(el.dataset.rhythm);
      this.leds[i] = el;
    }
  }

  drawPlayhead(index) {
    this.off();
    this.current = index;
    this.leds[this.current].dataset.led = 'on';
  }

  off() {
    this.leds[this.current].dataset.led = 'off';
  }
}


class TempoInput {
  constructor({ min, max, step }) {
    this.min = min;
    this.max = max;
    this.step = step;
    this.value = min;
  }

  set value(value) {
    this._value = Math.min(this.max, Math.max(this.min, value));
  }

  get value() {
    return this._value;
  }
}

// class Notes {
//   constructor() {
//     this.onClick = (instrument, rhythm) => { };

//     this.buttons = {};
//     const selector = '[data-instrument][data-rhythm]';
//     for (const el of document.querySelectorAll(selector)) {
//       const instrument = el.dataset.instrument;
//       const rhythm = Number(el.dataset.rhythm);

//       if (!this.buttons[instrument]) {
//         this.buttons[instrument] = {};
//       }

//       this.buttons[instrument][rhythm] = new Button(el);
//       this.buttons[instrument][rhythm].onclick = () => this.onClick(
//         instrument, rhythm);
//     }
//   }

//   setNote(instrument, rhythmIndex, note) {
//     this.buttons[instrument][rhythmIndex].state = note;
//   }
// }

// class SaveButton extends Button {
//   constructor(getDataCallback) {
//     super(document.getElementById('save'), () => {
//       const data = getDataCallback();
//       const date = new Date().toISOString().split('T')[0];
//       const filename = `drums-${date}.json`;

//       const blob = new Blob([data], { type: 'application/json' });
//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename;

//       a.click();
//       window.URL.revokeObjectURL(url);
//     });
//   }
// }

// function loadFile(file, onload) {
//   const reader = new FileReader();
//   reader.onload = () => onload(reader.result);
//   reader.readAsText(file);
// }

// class LoadButton extends Button {
//   constructor(onLoadCallback) {
//     super(document.getElementById('load'), () => {
//       const input = document.createElement('input');
//       input.type = 'file';
//       input.accept = '.json,application/json';
//       input.onchange = () => loadFile(input.files[0], onLoadCallback);
//       input.click();
//     });
//   }
// }


export {
  DemoButtons,
  EffectPicker,
  EffectSlider,
  FileDropZone,
  KitPicker,
  LoadButton,
  Notes,
  PitchSliders,
  PlayButton,
  Playheads,
  ResetButton,
  SaveButton,
  SwingSlider,
  TempoInput,
};