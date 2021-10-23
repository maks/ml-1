import { NumberEditScreen } from '../shiny-drums/screen_widgets.js';
export class MenuController {
    constructor(oled) {
        this._screenStack = [];
        this._overlay = null;
        this._oled = oled;
    }
    get _currentScreen() { return this._screenStack[this._screenStack.length - 1]; }
    ;
    pushMenuScreen(menu) {
        var _a;
        this._screenStack.push(menu);
        console.log('menu' + ((_a = this._screenStack[1]) === null || _a === void 0 ? void 0 : _a.visibleItems[0]));
        this.updateOled();
    }
    setOverlay(overlay) {
        this._overlay = overlay;
        // console.log('set overlay', overlay)
        this.updateOled();
    }
    clearOverlay() {
        this._overlay = null;
        this.updateOled();
    }
    onDial(dir) {
        const left = (dir == 0);
        if (left) {
            this._currentScreen.prev();
        }
        else {
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
        }
        else {
            if (this._currentScreen instanceof NumberEditScreen) {
                this._oled.clear();
                this._oled.bigTitled(this._currentScreen.title, this._currentScreen.stringValue);
            }
            const items = this._currentScreen.visibleItems;
            for (let i = 0; i < items.length; i++) {
                let highlight = (i == this._currentScreen.viewportSelected);
                this._oled.text(i, items[i], highlight);
            }
        }
        // make sure to send outside loop as too many send via sysex can overwhelm the Fire
        this._oled.send();
    }
}
