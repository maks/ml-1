var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class FileStore {
    constructor(baseUrl) {
        this._pathArray = [];
        this._baseUrl = baseUrl;
    }
    // file list for a path from custom http server comes back as simple json
    getCurrentDirFilelist() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this._baseUrl}${this._pathArray.join('/')}/`;
            const response = yield fetch(url);
            const dirListing = yield response.json();
            return dirListing;
        });
    }
    enterDir(subDirName) {
        //TODO: validate current dir filelist actually constains the subdir
        this._pathArray.push(subDirName);
    }
    upDir() {
        this._pathArray.pop();
    }
    // returns filenames of current dir with matching filename extension only, eg. "wav" will match foo.wav
    currentDirFilesByExtension(fileExt) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getCurrentDirFilelist()).filter(f => f.name.endsWith(`.${fileExt}`));
        });
    }
}
//# sourceMappingURL=file_browser.js.map