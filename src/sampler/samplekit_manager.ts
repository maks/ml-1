import { DSPreset } from './dspreset_parser.js';
import { FileStore } from './file_browser.js';

export class SampleKitManager {
  private _packs: DSPreset[] = [];
  private _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  get packs() { return this._packs; }

  async scanForDSKits() {
    const fileStore = new FileStore(this._baseUrl);

    // top level dir file list
    const topDirlist = await fileStore.getCurrentDirFilelist();

    console.log("top sample dir:", topDirlist)

    for (const dir of topDirlist) {
      fileStore.enterDir(dir.name);
      const dsFiles = await fileStore.currentDirFilesByExtension("dspreset");
      if (dsFiles.length > 0) {
        for (const file of dsFiles) {
          const url = `${this._baseUrl}${dir.name}/${file.name}`;
          const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
          const dspreset = await this._loadDSPreset(url, nameWithoutExtension, dir.name);
          this._packs.push(dspreset);
        }
      }
      fileStore.upDir();
    }
  }

  /// Load a multisample pack using a DecentSampler .dspresets file format at given url
  /// returns a DSPreset
  async _loadDSPreset(url: string, name: string, path: string): Promise<DSPreset> {
    const response = await fetch(url);
    const body = await response.text();
    const ds = new DSPreset(new window.DOMParser().parseFromString(body, "text/xml"), name, path);
    return ds;
  }
}