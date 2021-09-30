export type NumberCallback = (index: number) => void;
export type VoidCallback = () => void;

export interface MenuScreen {
  next(): void;
  prev(): void;
  select(): void;
  refresh(): void;
  updateItems(items: string[]): void;
  get visibleItems(): string[];
  get viewportSelected(): number;
}

export class ListScreen implements MenuScreen {
  readonly viewportLength: number;
  private _items: string[];
  private _selectedIndex: number;
  private _viewportTopOffset: number;
  // callback when a menu item is selected
  private _onSelected: NumberCallback;
  // callback when menu is redisplayed, eg, after another menu was displayed
  private _onRefresh: VoidCallback;

  get selected(): number {
    return this._selectedIndex;
  }

  // the index of the selected item as an index offset within the viewport
  get viewportSelected(): number {
    return this._selectedIndex - this._viewportTopOffset;
  }

  constructor(viewportLength: number, items: string[], onSelected: NumberCallback, onRefresh: VoidCallback) {
    this.viewportLength = viewportLength;
    this._items = items;
    this._selectedIndex = 0;
    this._viewportTopOffset = 0;
    this._onSelected = onSelected;
    this._onRefresh = onRefresh;
  }
  updateItems(items: string[]): void {
    this._items = items;
  }

  refresh(): void {
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

  get visibleItems(): string[] {
    return this._items.slice(this._viewportTopOffset, this._viewportTopOffset + this.viewportLength);
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