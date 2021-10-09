export class DSPreset {
    constructor(dspreset) {
        this._xml = dspreset;
    }
    get group() {
        var _a, _b;
        const group = this._xml.getElementsByTagName("group")[0];
        console.log('group', group);
        let res = [];
        if (group != null) {
            for (let i = 0; i < group.children.length; i++) {
                const g = group.children[i];
                res.push(new DSSample({
                    path: (_a = g.getAttribute("path")) === null || _a === void 0 ? void 0 : _a.toString(),
                    start: parseInt(g.getAttribute("start")),
                    end: parseInt(g.getAttribute("end")),
                    rootNote: (_b = g.getAttribute("rootNote")) === null || _b === void 0 ? void 0 : _b.toString()
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
