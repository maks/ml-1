export class LabelOverlayScreen {
    constructor(title, value) {
        this._title = title;
        this._value = value;
    }
    get title() {
        return this._title;
    }
    get stringValue() {
        return this._value;
    }
}
export class NumberEditScreen {
    constructor(title, value, max, min, interval, largeInterval, onUpdate, decimalDisplay = 2) {
        this._title = title;
        this._value = value;
        this._max = max;
        this._min = min;
        this._interval = interval;
        this._largeInterval = largeInterval;
        this._decimals = decimalDisplay;
        this._onUpdate = onUpdate;
    }
    prev(mod) {
        const increment = mod ? this._largeInterval : this._interval;
        this._value = Math.max(this._min, this._value - increment);
        this._onUpdate(this._value);
    }
    next(mod) {
        const increment = mod ? this._largeInterval : this._interval;
        this._value = Math.min(this._max, this._value + increment);
        this._onUpdate(this._value);
    }
    get title() {
        return this._title;
    }
    set title(t) {
        this._title = t;
    }
    get stringValue() {
        return `${this._value.toFixed(this._decimals)}`;
    }
    set value(v) {
        this._value = v;
    }
    get visibleItems() {
        return [];
    }
    get viewportSelected() {
        return 0;
    }
    select() {
        //NA
    }
    refresh() {
        //NA
    }
    updateItems(items) {
        //NA
    }
}
export class ListScreenItem {
    constructor(label, onSelected, data) {
        this._label = label;
        this._onSelected = onSelected;
        this._data = data;
    }
    get label() { return this._label; }
    get data() { return this._data; }
    selected() {
        this._onSelected(this);
    }
}
export class ListScreen {
    constructor(viewportLength, items, onRefresh) {
        this.viewportLength = viewportLength;
        this._items = items;
        this._selectedIndex = 0;
        this._viewportTopOffset = 0;
        this._onRefresh = onRefresh;
    }
    get selected() {
        return this._selectedIndex;
    }
    // the index of the selected item as an index offset within the viewport
    get viewportSelected() {
        return this._selectedIndex - this._viewportTopOffset;
    }
    updateItems(items) {
        this._items = items;
    }
    refresh() {
        this._onRefresh();
    }
    next(mod) {
        this._selectedIndex = Math.min(this._items.length - 1, this._selectedIndex + 1);
        this._updateOffset();
    }
    prev(mod) {
        this._selectedIndex = Math.max(0, this._selectedIndex - 1);
        this._updateOffset();
    }
    select(mod) {
        this._items[this._selectedIndex].selected();
    }
    get visibleItems() {
        return this._items.slice(this._viewportTopOffset, this._viewportTopOffset + this.viewportLength).map((item) => item.label);
    }
    _updateOffset() {
        while (this._selectedIndex > (this._viewportTopOffset + this.viewportLength - 1)) {
            this._viewportTopOffset++;
        }
        while (this._selectedIndex < this._viewportTopOffset) {
            this._viewportTopOffset--;
        }
    }
}
