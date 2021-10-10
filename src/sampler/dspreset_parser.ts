export class DSPreset {
  _xml: XMLDocument;
  readonly name: string;
  readonly path: string;

  constructor(dspreset: XMLDocument, name: string, path: string) {
    this._xml = dspreset;
    this.name = name;
    this.path = path;
  }

  get group(): DSSample[] {
    //TODO: for now only handling a single, first group found
    const group = this._xml.getElementsByTagName("group")[0];

    let res: DSSample[] = [];
    if (group != null) {
      for (let i = 0; i < group.children.length; i++) {
        const g = group.children[i];
        res.push(new DSSample({
          path: g.getAttribute("path")?.toString(),
          start: parseInt(g.getAttribute("start") as string),
          end: parseInt(g.getAttribute("end") as string),
          rootNote: g.getAttribute("rootNote")?.toString()
        }));
      }
    }
    return res;
  }
}

export class DSSample {
  path: string = "";
  start: number = 0;
  end: number = 0;
  rootNote: string = "";
  loNote: string = "";
  hiNote: string = "";

  constructor(init?: Partial<DSSample>) {
    Object.assign(this, init);
  }
}