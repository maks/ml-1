import { MenuScreen } from '../shiny-drums/screen_widgets.js';
import { OledControl } from "../firemidi.js";

export class MenuController {

  _screenStack: MenuScreen[] = [];

  private _oled: OledControl;

  get _currentScreen() { return this._screenStack[this._screenStack.length - 1]; };

  constructor(oled: OledControl,) {
    this._oled = oled;
  }

  pushMenu(menu: MenuScreen) {
    this._screenStack.push(menu);
    console.log('menu' + this._screenStack[1]?.visibleItems[0])
    this.updateOled();
  }

  onDial(dir: number) {
    const left = (dir == 0);
    // if (_editTempoMode) {
    //   const increment = _shiftON ? 10 : 1;
    //   if (left) {
    //     theBeat.tempo = Math.max(MIN_TEMPO, theBeat.tempo - increment);
    //   } else {
    //     theBeat.tempo = Math.min(MAX_TEMPO, theBeat.tempo + increment);
    //   }
    // } else {
    if (left) {
      this._currentScreen.prev();
    } else {
      this._currentScreen.next();
    }
    // }
    this.updateOled();
  }

  onSelect() {
    this._currentScreen.select();
    this.updateOled();
  }

  onBack() {
    console.log('menu back' + this._screenStack.length);
    if (this._screenStack.length > 1) {
      this._screenStack.pop();
    }
    this._currentScreen.refresh();
    this.updateOled();
  }

  updateOled() {
    this._oled.clear();
    // if (_editTempoMode) {
    //   oled.bigTitled("BPM", `${theBeat.tempo}`);
    // } 
    const items = this._currentScreen.visibleItems;
    for (let i = 0; i < items.length; i++) {
      let highlight = (i == this._currentScreen.viewportSelected)
      this._oled.text(i, items[i], highlight);
    }
    // make sure to send outside loop as too many send via sysex can overwhelm the Fire
    this._oled.send();
  }
}