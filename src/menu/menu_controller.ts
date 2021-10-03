import { MenuScreen, NumberOverlayScreen } from '../shiny-drums/screen_widgets.js';
import { OledControl } from "../firemidi.js";

export class MenuController {

  _screenStack: MenuScreen[] = [];

  private _oled: OledControl;

  get _currentScreen() { return this._screenStack[this._screenStack.length - 1]; };

  private _overlay: NumberOverlayScreen | null = null;

  constructor(oled: OledControl,) {
    this._oled = oled;
  }

  pushMenuScreen(menu: MenuScreen): void {
    this._screenStack.push(menu);
    console.log('menu' + this._screenStack[1]?.visibleItems[0])
    this.updateOled();
  }

  setOverlay(overlay: NumberOverlayScreen): void {
    this._overlay = overlay;
    // console.log('set overlay', overlay)
    this.updateOled();
  }

  clearOverlay(): void {
    this._overlay = null;
    this.updateOled();
  }

  onDial(dir: number) {
    const left = (dir == 0);

    if (left) {
      this._currentScreen.prev();
    } else {
      this._currentScreen.next();
    }
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
    if (this._overlay != null) {
      this._oled.clear();
      this._oled.bigTitled(this._overlay.title, this._overlay.stringValue);
    } else {
      const items = this._currentScreen.visibleItems;
      for (let i = 0; i < items.length; i++) {
        let highlight = (i == this._currentScreen.viewportSelected)
        this._oled.text(i, items[i], highlight);
      }
    }
    // make sure to send outside loop as too many send via sysex can overwhelm the Fire
    this._oled.send();
  }
}