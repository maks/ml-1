var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DSPreset } from './dspreset_parser.js';
import { FileStore } from './file_browser.js';
export class SampleKitManager {
    constructor(baseUrl) {
        this._packs = [];
        this._baseUrl = baseUrl;
    }
    get packs() { return this._packs; }
    scanForDSKits() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileStore = new FileStore(this._baseUrl);
            // top level dir file list
            const topDirlist = yield fileStore.getCurrentDirFilelist();
            console.log(topDirlist);
            for (const dir of topDirlist) {
                fileStore.enterDir(dir.name);
                const dsFiles = yield fileStore.currentDirFilesByExtension("dspreset");
                if (dsFiles.length > 0) {
                    for (const file of dsFiles) {
                        const url = `${this._baseUrl}${dir.name}/${file.name}`;
                        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                        const dspreset = yield this._loadDSPreset(url, nameWithoutExtension, dir.name);
                        this._packs.push(dspreset);
                    }
                }
                fileStore.upDir();
            }
        });
    }
    /// Load a multisample pack using a DecentSampler .dspresets file format at given url
    /// returns a DSPreset
    _loadDSPreset(url, name, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            const body = yield response.text();
            const ds = new DSPreset(new window.DOMParser().parseFromString(body, "text/xml"), name, path);
            return ds;
        });
    }
}
