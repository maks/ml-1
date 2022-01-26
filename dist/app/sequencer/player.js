import * as Tone from "https://unpkg.com/tone@14.7.77/build/esm/index.js?module";
export class ML1Player {
    constructor(project) {
        this._project = project;
    }
    togglePlay() {
        if (Tone.Transport.state !== 'started') {
            console.log('ML1 Playing');
            Tone.Transport.start();
        }
        else {
            console.log('ML1 Stopped');
            Tone.Transport.stop();
        }
    }
}
//# sourceMappingURL=player.js.map