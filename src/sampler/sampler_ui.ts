import { getMidi, setupTransport, setupPads, setupOled, setupDials, setupButtons, allOff, ButtonsSetup } from '../firemidi.js';

import { MenuController } from '../menu/menu_controller.js'

import { ListScreen, ListScreenItem, NumberOverlayScreen } from '../shiny-drums/screen_widgets.js'

const MENU_LIST_ITEMS_COUNT = 9;

let oled: any;
let menu: any;
let buttons: any;
let dials: any;
let padControl: any;

export function initControls(instrumentNames: string[], handlePlay: VoidFunction) {
  getMidi(midiReady, (isConnected: boolean) => {
    if (isConnected) { console.log('reconnected'); midiReady(); }
  });

  function midiReady() {
    console.log('MIDI IS READY');

    setupTransport(
      handlePlay, function () { }, function () { }
    );
    padControl = setupPads(handleNoteClick);
    oled = setupOled();

    const _topMenu = new ListScreen(MENU_LIST_ITEMS_COUNT, _topMenuListItems(instrumentNames),
      () => {
        _topMenu.updateItems(_topMenuListItems(instrumentNames));
      });

    menu = new MenuController(oled);
    menu.pushMenuScreen(_topMenu);

    dials = setupDials(
      {
        onVolume: (dir) => {
          // handleDialInput(dir, overlays["volume"]);
        },
        onPan: (dir) => {

        },
        onFilter: (dir) => {
          // const instrumentName = machineState.currentInstrumentName;
          // const overlay = overlays["pitch"];
          // if (instrumentName == null) {
          //   return;
          // }
          // let pitch = theBeat.getPitch(instrumentName);
          // overlay.title = `P:${instrumentName}`;
          // overlay.value = pitch;
          // handleDialInput(dir, overlay);
        },
        onResonance: (dir) => {
          // handleDialInput(dir, overlays["effects"]);
        },
        onSelect: (dir) => {
          if (dir == 2 || dir == 3) {
            if (dir == 2) {
              menu.onSelect();
            }
          } else {
            menu.onDial(dir);
          }
        }
      }
    );

    const bSetup: ButtonsSetup = {
      browser: (up: boolean) => menu.onBack(),
      patternUp: (up: boolean) => console.log('patternup button'),
      shift: (up: boolean) => {
        //_shiftON = !up;
      },
      pattern: (up: boolean) => {
        console.log('pattern:' + up);
        if (up) {
          // need to repaint showing menu
          menu.updateOled();
        }
      },
      solomute1: (up: boolean) => {
        //_selectedInstrumentIndex = up ? null : 0;
        console.log('SOLO1' + up);
      },
      solomute2: (up: boolean) => {
        //_selectedInstrumentIndex = up ? null : 1;
      },
      solomute3: (up: boolean) => {
        //_selectedInstrumentIndex = up ? null : 2;
      },
      solomute4: (up: boolean) => {
        //_selectedInstrumentIndex = up ? null : 3;
      },
      patternDown: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      },
      gridLeft: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      },
      gridRight: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      },
      step: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      },
      note: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      },
      drum: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      },
      perform: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      },
      alt: function (dir: boolean): void {
        throw new Error('Function not implemented.');
      }
    };

    buttons = setupButtons(bSetup);


    // clear all now that we have finished init
    allOff();

    // update OLED with loaded preset
    menu.updateOled();
  }
}

function _topMenuListItems(entries: string[]): ListScreenItem[] {
  return entries.map((x) => new ListScreenItem(x, (item: ListScreenItem) => onInstrumentSelected(item), {}));
}

function onInstrumentSelected(item: ListScreenItem) {
  console.log("SELECTED:", item.label)
}

function handleNoteClick(index: number) {
  const rowIndex = Math.floor(index / 16);
  const columnIndex = index % 16;
  const padColour = { r: 0, g: 10, b: 30 };
  padControl.padLedOn(index, padColour);

  // const instrument = INSTRUMENTS.find((instr) => instr.name === instrumentName);
  // player.playNote(instrument, rhythmIndex);
  console.log('PLAY NOTE:' + index);
}