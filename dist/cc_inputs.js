export class CCInputs {
    on(id, value) {
        return [
            0xB0,
            id,
            value,
        ];
    }
}
CCInputs.buttonDown = 144;
CCInputs.buttonUp = 128;
CCInputs.dialRotate = 176;
CCInputs.rotateLeft = 127;
CCInputs.rotateRight = 1;
CCInputs.dialTouchOn = 127;
CCInputs.dialTouchOff = 0;
CCInputs.volume = 16;
CCInputs.pan = 17;
CCInputs.filter = 18;
CCInputs.resonance = 19;
CCInputs.selectDown = 25;
CCInputs.bankSelect = 26;
CCInputs.patternUp = 31;
CCInputs.patternDown = 32;
CCInputs.browser = 33;
CCInputs.gridLeft = 34;
CCInputs.gridRight = 35;
CCInputs.muteButton1 = 36;
CCInputs.muteButton2 = 37;
CCInputs.muteButton3 = 38;
CCInputs.muteButton4 = 39;
CCInputs.step = 44;
CCInputs.note = 45;
CCInputs.drum = 46;
CCInputs.perform = 47;
CCInputs.shift = 48;
CCInputs.alt = 49;
CCInputs.pattern = 50;
CCInputs.play = 51;
CCInputs.stop = 52;
CCInputs.record = 53;
CCInputs.select = 118;
// All
CCInputs.off = 0;
// Red Only
// pattern up/down, browser, grid left/right
CCInputs.paleRed = 1;
CCInputs.red = 2;
// Green only
// mute 1,2,3,4
CCInputs.paleGreen = 1;
CCInputs.green = 2;
// Yellow only
// alt, stop
CCInputs.paleYellow = 1;
CCInputs.yellow = 2;
// Yellow-Red
// step, note, drum, perform, shift, record
CCInputs.paleYellow2 = 1;
CCInputs.paleRed2 = 2;
CCInputs.yellow2 = 3;
CCInputs.red2 = 4;
// Yellow-Green
// pattern, play
CCInputs.paleGreen3 = 1;
CCInputs.paleYellow3 = 2;
CCInputs.green3 = 3;
CCInputs.yellow3 = 4;