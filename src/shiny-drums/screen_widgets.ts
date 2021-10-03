export type NumberCallback = (val: number) => void;
export type VoidCallback = () => void;
export type ObjectCallback = (obj: any) => void;

export interface MenuScreen {
  next(): void;
  prev(): void;
  select(): void;
  refresh(): void;
  updateItems(items: ListScreenItem[]): void;
  get visibleItems(): string[];
  get viewportSelected(): number;
}

export class NumberOverlayScreen implements MenuScreen {
  private _title: string;
  private _value: number;
  readonly _max: number;
  readonly _min: number;
  readonly _interval: number;
  readonly _largeInterval: number;
  readonly _decimals;
  private _onUpdate: NumberCallback;

  constructor(title: string, value: number, max: number, min: number, interval: number, largeInterval: number,
    onUpdate: NumberCallback, decimalDisplay: number = 2) {
    this._title = title;
    this._value = value;
    this._max = max;
    this._min = min;
    this._interval = interval;
    this._largeInterval = largeInterval;
    this._decimals = decimalDisplay;
    this._onUpdate = onUpdate;
  }

  prev(mod?: boolean): void {
    const increment = mod ? this._largeInterval : this._interval;
    this._value = Math.max(this._min, this._value - increment);
    this._onUpdate(this._value);
  }

  next(mod?: boolean): void {
    const increment = mod ? this._largeInterval : this._interval;
    this._value = Math.min(this._max, this._value + increment);
    this._onUpdate(this._value);
  }

  get title(): string {
    return this._title;
  }

  set title(t) {
    this._title = t;
  }

  get stringValue(): string {
    return `${this._value.toFixed(this._decimals)}`;
  }

  set value(v: number) {
    this._value = v;
  }


  get visibleItems(): string[] {
    return [];
  }
  get viewportSelected(): number {
    return 0;
  }

  select(): void {
    //NA
  }
  refresh(): void {
    //NA
  }
  updateItems(items: ListScreenItem[]): void {
    //NA
  }
}


export class ListScreenItem {
  readonly _label: string;
  readonly _onSelected: ObjectCallback;
  readonly _data: any;

  get label(): string { return this._label; }

  get data(): any { return this._data; }

  constructor(label: string, onSelected: ObjectCallback, data: any) {
    this._label = label;
    this._onSelected = onSelected;
    this._data = data;
  }

  selected() {
    this._onSelected(this);
  }
}

export class ListScreen implements MenuScreen {
  readonly viewportLength: number;
  private _items: ListScreenItem[];
  private _selectedIndex: number;
  private _viewportTopOffset: number;
  // callback when menu is redisplayed, eg, after another menu was displayed
  private _onRefresh: VoidCallback;

  get selected(): number {
    return this._selectedIndex;
  }

  // the index of the selected item as an index offset within the viewport
  get viewportSelected(): number {
    return this._selectedIndex - this._viewportTopOffset;
  }

  constructor(viewportLength: number, items: ListScreenItem[], onRefresh: VoidCallback) {
    this.viewportLength = viewportLength;
    this._items = items;
    this._selectedIndex = 0;
    this._viewportTopOffset = 0;
    this._onRefresh = onRefresh;
  }
  updateItems(items: ListScreenItem[]): void {
    this._items = items;
  }

  refresh(): void {
    this._onRefresh();
  }

  next(mod?: boolean) {
    this._selectedIndex = Math.min(this._items.length - 1, this._selectedIndex + 1);
    this._updateOffset();
  }

  prev(mod?: boolean) {
    this._selectedIndex = Math.max(0, this._selectedIndex - 1);
    this._updateOffset();
  }

  select(mod?: boolean) {
    this._items[this._selectedIndex].selected();
  }

  get visibleItems(): string[] {
    return this._items.slice(this._viewportTopOffset, this._viewportTopOffset + this.viewportLength).map((item) => item.label);
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