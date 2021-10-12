export class DSPreset {
    constructor(dspreset, name, path) {
        this._xml = dspreset;
        this.name = name;
        this.path = path;
    }
    get group() {
        var _a, _b, _c, _d;
        //TODO: for now only handling a single, first group found
        const group = this._xml.getElementsByTagName("group")[0];
        let res = [];
        if (group != null) {
            for (let i = 0; i < group.children.length; i++) {
                const g = group.children[i];
                res.push(new DSSample({
                    path: (_a = g.getAttribute("path")) === null || _a === void 0 ? void 0 : _a.toString(),
                    start: parseInt(g.getAttribute("start")),
                    end: parseInt(g.getAttribute("end")),
                    rootNote: (_b = g.getAttribute("rootNote")) === null || _b === void 0 ? void 0 : _b.toString(),
                    loNote: (_c = g.getAttribute("loNote")) === null || _c === void 0 ? void 0 : _c.toString(),
                    hiNote: (_d = g.getAttribute("hiNote")) === null || _d === void 0 ? void 0 : _d.toString()
                }));
            }
        }
        return res;
    }
}
export class DSSample {
    constructor(init) {
        this.path = "";
        this.start = 0;
        this.end = 0;
        this.rootNote = "";
        this.loNote = "";
        this.hiNote = "";
        Object.assign(this, init);
    }
}
