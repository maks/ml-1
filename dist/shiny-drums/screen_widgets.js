export class NumberOverlayScreen {
    constructor(title, value, max, min, interval, largeInterval, onUpdate) {
        this._title = title;
        this._value = value;
        this._max = max;
        this._min = min;
        this._interval = interval;
        this._largeInterval = largeInterval;
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
    get value() {
        return `${this._value.toFixed(2)}`;
    }
    set value(v) {
        this.value = v;
    }
}
export class ListScreen {
    constructor(viewportLength, items, onSelected, onRefresh) {
        this.viewportLength = viewportLength;
        this._items = items;
        this._selectedIndex = 0;
        this._viewportTopOffset = 0;
        this._onSelected = onSelected;
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
        this._onSelected(this._selectedIndex);
    }
    get visibleItems() {
        return this._items.slice(this._viewportTopOffset, this._viewportTopOffset + this.viewportLength);
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
