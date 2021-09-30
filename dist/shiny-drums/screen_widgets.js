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
    next() {
        this._selectedIndex = Math.min(this._items.length - 1, this._selectedIndex + 1);
        this._updateOffset();
    }
    prev() {
        this._selectedIndex = Math.max(0, this._selectedIndex - 1);
        this._updateOffset();
    }
    select() {
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
