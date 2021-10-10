export class FileStore {
  readonly _baseUrl: string;
  private _pathArray: string[] = [];

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  // file list for a path from custom http server comes back as simple json
  async getCurrentDirFilelist(): Promise<DirEntry[]> {
    const url = `${this._baseUrl}${this._pathArray.join('/')}/`;
    const response = await fetch(url);
    const dirListing = await response.json() as DirEntry[];
    return dirListing;
  }

  enterDir(subDirName: string): void {
    //TODO: validate current dir filelist actually constains the subdir
    this._pathArray.push(subDirName);
  }

  upDir(): void {
    this._pathArray.pop();
  }

  // returns filenames of current dir with matching filename extension only, eg. "wav" will match foo.wav
  async currentDirFilesByExtension(fileExt: string) {
    return (await this.getCurrentDirFilelist()).filter(f => f.name.endsWith(`.${fileExt}`));
  }
}

export interface DirEntry {
  readonly name: string;
  readonly isDir: boolean;
}