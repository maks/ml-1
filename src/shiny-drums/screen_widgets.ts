export class ListScreen {
  readonly viewportLength: number;
  readonly items: String[];
  private _selectedIndex: number;
  private _viewportTopOffset: number;

  get selected() {
    return this._selectedIndex;
  }

  // the index of the selected item as an index offset within the viewport
  get viewportSelected() {
    return this._selectedIndex - this._viewportTopOffset;
  }

  constructor(viewportLength: number, items: String[]) {
    this.viewportLength = viewportLength;
    this.items = items;
    this._selectedIndex = 0;
    this._viewportTopOffset = 0;
  }

  next() {
    this._selectedIndex = Math.min(this.items.length - 1, this._selectedIndex + 1);
    this._updateOffset();
  }

  prev() {
    this._selectedIndex = Math.max(0, this._selectedIndex - 1);
    this._updateOffset();
  }

  get visibleItems(): String[] {
    return this.items.slice(this._viewportTopOffset, this._viewportTopOffset + this.viewportLength);
  }

  private _updateOffset() {
    while (this._selectedIndex > (this._viewportTopOffset + this.viewportLength - 1)) {
      this._viewportTopOffset++;
    }
    while (this._selectedIndex < this._viewportTopOffset) {
      this._viewportTopOffset--;
    }
  }
}