export let midiOutput;
export * from "./controlbank_led.js";
export * from "./mono_canvas.js";
export * from "./oled_font57.js";
import { font5x7 } from "./oled_font57.js";
import { Oled } from "./mono_canvas.js";
const lineHeight = 8;
const font = font5x7;
const oledBitmap = new Oled(64, 128);
export function drawHeading(heading) {
    oledBitmap.clear();
    oledBitmap.setCursor(0, 0);
    oledBitmap.writeString(font, 1, heading, true, true, 1);
    oledBitmap.setCursor(0, lineHeight);
    oledBitmap.writeString(font, 1, '='.repeat(heading.length), true, true, 1);
    sendSysexBitmap(oledBitmap.bitmap);
}
export function testDraw() {
    oledBitmap.clear();
    oledBitmap.setCursor(20, 20);
    oledBitmap.drawRect(0, 0, 30, 40, true);
    sendSysexBitmap(oledBitmap.bitmap);
}
export function getMidi() {
    navigator.requestMIDIAccess({ sysex: true })
        .then(function (midiAccess) {
        const outputs = midiAccess.outputs.values();
        console.log(outputs);
        for (const output of outputs) {
            console.log(output);
            midiOutput = output;
        }
    });
}
export function clearAll() {
    midiOutput.send([0xB0, 0x7F, 0]);
}
/// turn on and set the colour of a pad button
// export function colorPad(int padRow, int padColumn, PadColor color) {
export function colorPad(padRow, padColumn, color) {
    const sysexHeader = [
        0xF0,
        0x47,
        0x7F,
        0x43,
        0x65,
        0x00,
        0x04, // mesg length - low byte
    ];
    const sysexFooter = [
        0xF7, // End of Exclusive
    ];
    const ledData = [
        (padRow * 16 + padColumn),
        color.r,
        color.g,
        color.b,
    ];
    const midiData = [...sysexHeader, ...ledData, ...sysexFooter];
    midiOutput.send(midiData);
}
const _aBitMutate = [
    [13, 19, 25, 31, 37, 43, 49],
    [0, 20, 26, 32, 38, 44, 50],
    [1, 7, 27, 33, 39, 45, 51],
    [2, 8, 14, 34, 40, 46, 52],
    [3, 9, 15, 21, 41, 47, 53],
    [4, 10, 16, 22, 28, 48, 54],
    [5, 11, 17, 23, 29, 35, 55],
    [6, 12, 18, 24, 30, 36, 42],
];
var _aOLEDBitmap = new Uint8Array(1175);
export function sendSysexBitmap(boolMap) {
    const bitmap = _aOLEDBitmap;
    // these need to go after the bitmap length high/low bytes
    // but need to be included in the payload length, hence we just
    // put them at the start of the sent "bitmap" payload
    _aOLEDBitmap[0] = 0x00;
    _aOLEDBitmap[1] = 0x07;
    _aOLEDBitmap[2] = 0x00;
    _aOLEDBitmap[3] = 0x7f;
    // Clear the screen
    var x = 0;
    var y = 0;
    for (x = 0; x < 128; ++x) {
        for (y = 0; y < 64; ++y) {
            _plotPixel(x, y, 0);
        }
    }
    x = 0;
    y = 0;
    for (x = 0; x < 128; ++x) {
        for (y = 0; y < 64; ++y) {
            const pxl = boolMap[x + (y * 128)] ? 1 : 0;
            _plotPixel(x, y, pxl);
        }
    }
    const length = bitmap.length;
    console.log("BIITMAP:" + length);
    const sysexHeader = [
        0xF0,
        0x47,
        0x7F,
        0x43,
        0x0E,
        //(length >> 7), // Payload length high
        0x09,
        (length & 0x7F), // Payload length low
    ];
    const sysexFooter = [
        0xF7, // End of Exclusive
    ];
    const midiData = [...sysexHeader, ...bitmap, ...sysexFooter];
    midiOutput.send(midiData);
}
/// Plot pixel on bitmap.
/// X - X coordinate of pixel (0..127).
/// Y - Y coordinate of pixel (0..63).
/// C - Color, 0=black, nonzero=white.
/// ref: https://blog.segger.com/decoding-the-akai-fire-part-3/
function _plotPixel(X, Y, C) {
    var remapBit;
    //
    if (X < 128 && Y < 64) {
        //
        // Unwind 128x64 arrangement into a 1024x8 arrangement of pixels.
        //
        X += 128 * Math.floor(Y / 8);
        Y %= 8;
        //
        // Remap by tiling 7x8 block of translated pixels.
        //
        remapBit = _aBitMutate[Y][X % 7];
        if (C > 0) {
            _aOLEDBitmap[4 + Math.floor(X / 7) * 8 + Math.floor(remapBit / 7)] |= 1 << (remapBit % 7);
        }
        else {
            _aOLEDBitmap[4 + Math.floor(X / 7) * 8 + Math.floor(remapBit / 7)] &= ~(1 << (remapBit % 7));
        }
    }
}
