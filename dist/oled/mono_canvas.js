// subset of: https://github.com/noopkat/oled-js/blob/master/oled.ts
export class MonoCanvas {
    constructor(height, width) {
        this.HEIGHT = height;
        this.WIDTH = width;
        this.cursor_x = 0;
        this.cursor_y = 0;
        this._bitmap = new Array(this.WIDTH * this.HEIGHT);
        const screenSize = `${this.WIDTH}x${this.HEIGHT}`;
        console.log('oled:' + screenSize);
    }
    bitmap() {
        return this._bitmap.map(x => x);
    }
    clear() {
        for (let i = 0; i < this._bitmap.length; i++) {
            this._bitmap[i] = false;
        }
    }
    /// draw single pixel
    drawPixel(pixel) {
        this._bitmap[pixel[0] + (this.WIDTH * pixel[1])] = pixel[2];
    }
    // set starting position of a text string on the oled
    setCursor(x, y) {
        this.cursor_x = Math.round(Math.min(x, 127));
        this.cursor_y = Math.round(Math.min(y, 63));
    }
    _invertColor(color) {
        return !color;
    }
    // write string to single line, truncate if exceeds screen width
    writeString(font, size, string, color) {
        const letspace = 1;
        let offset = this.cursor_x;
        let padding = 0;
        const lineY = this.cursor_y;
        // loop through the array of each char to draw
        for (let i = 0; i < string.length; i++) {
            // look up the position of the char, pull out the buffer slice
            const charBuf = this._findCharBuf(font, string[i]);
            // read the bits in the bytes that make up the char
            const charBytes = this._readCharBytes(charBuf);
            // draw the entire character
            this._drawChar(font, charBytes, size, color);
            // fills in background behind the text pixels so that it's easier to read the text
            this.fillRect(offset - padding, this.cursor_y, padding, (font.height * size), this._invertColor(color));
            // calc new x position for the next char, add a touch of padding too if it's a non space char
            padding = (string[i] === ' ') ? 0 : size + letspace;
            offset += (font.width * size) + padding;
            // clip to max width
            if (offset >= this.WIDTH - (font.width * size)) {
                return;
            }
            // set the 'cursor' for the next char to be drawn, then loop again for next char
            this.setCursor(offset, lineY);
        }
    }
    // write text to the oled
    writeStringFormatted(font, size, string, color, wrap, linespacing) {
        const wordArr = string.split(' ');
        const len = wordArr.length;
        // start x offset at cursor pos
        let offset = this.cursor_x;
        let padding = 0;
        const letspace = 1;
        const leading = linespacing || 2;
        // loop through words
        for (let i = 0; i < len; i += 1) {
            // put the word space back in
            if (i < len - 1)
                wordArr[i] += ' ';
            const stringArr = wordArr[i].split('');
            const slen = stringArr.length;
            const compare = (font.width * size * slen) + (size * (len - 1));
            // wrap words if necessary
            if (wrap && len > 1 && (offset >= (this.WIDTH - compare))) {
                offset = 1;
                this.cursor_y += (font.height * size) + size + leading;
                this.setCursor(offset, this.cursor_y);
            }
            // loop through the array of each char to draw
            for (let i = 0; i < slen; i += 1) {
                // look up the position of the char, pull out the buffer slice
                const charBuf = this._findCharBuf(font, stringArr[i]);
                // read the bits in the bytes that make up the char
                const charBytes = this._readCharBytes(charBuf);
                // draw the entire character
                this._drawChar(font, charBytes, size, color);
                // fills in background behind the text pixels so that it's easier to read the text
                this.fillRect(offset - padding, this.cursor_y, padding, (font.height * size), this._invertColor(color));
                // calc new x position for the next char, add a touch of padding too if it's a non space char
                padding = (stringArr[i] === ' ') ? 0 : size + letspace;
                offset += (font.width * size) + padding;
                // wrap letters if necessary
                if (wrap && (offset >= (this.WIDTH - font.width - letspace))) {
                    offset = 1;
                    this.cursor_y += (font.height * size) + size + leading;
                }
                // set the 'cursor' for the next char to be drawn, then loop again for next char
                this.setCursor(offset, this.cursor_y);
            }
        }
    }
    // draw an individual character to the screen
    _drawChar(font, byteArray, size, color) {
        // take your positions...
        const x = this.cursor_x;
        const y = this.cursor_y;
        let c = 0;
        let pagePos = 0;
        // loop through the byte array containing the hexes for the char
        for (let i = 0; i < byteArray.length; i += 1) {
            pagePos = Math.floor(i / font.width) * 8;
            for (let j = 0; j < 8; j += 1) {
                // pull color out (invert the color if user chose black)
                const pixelState = (byteArray[i][j] === 1) ? color : this._invertColor(color);
                let xpos;
                let ypos;
                // standard font size
                if (size === 1) {
                    xpos = x + c;
                    ypos = y + j + pagePos;
                    this.drawPixel([xpos, ypos, pixelState]);
                }
                else {
                    // MATH! Calculating pixel size multiplier to primitively scale the font
                    xpos = x + (i * size);
                    ypos = y + (j * size);
                    this.fillRect(xpos, ypos, size, size, pixelState);
                }
            }
            c = (c < font.width - 1) ? c += 1 : 0;
        }
    }
    // get character bytes from the supplied font object in order to send to framebuffer
    _readCharBytes(byteArray) {
        let bitArr = [];
        const bitCharArr = [];
        // loop through each byte supplied for a char
        for (let i = 0; i < byteArray.length; i += 1) {
            // set current byte
            const byte = byteArray[i];
            // read each byte
            for (let j = 0; j < 8; j += 1) {
                // shift bits right until all are read
                const bit = byte >> j & 1;
                bitArr.push(bit);
            }
            // push to array containing flattened bit sequence
            bitCharArr.push(bitArr);
            // clear bits for next byte
            bitArr = [];
        }
        return bitCharArr;
    }
    // find where the character exists within the font object
    _findCharBuf(font, c) {
        const charLength = Math.ceil((font.width * font.height) / 8);
        // use the lookup array as a ref to find where the current char bytes start
        const cBufPos = font.lookup.indexOf(c) * charLength;
        // slice just the current char's bytes out of the fontData array and return
        return font.fontData.slice(cBufPos, cBufPos + charLength);
    }
    // draw an image pixel array on the screen
    drawBitmap(pixels) {
        for (let i = 0; i < pixels.length; i++) {
            const x = Math.floor(i % this.WIDTH);
            const y = Math.floor(i / this.WIDTH);
            this.drawPixel([x, y, pixels[i]]);
        }
    }
    // using Bresenham's line algorithm
    drawLine(x0, y0, x1, y1, color) {
        const dx = Math.abs(x1 - x0);
        const sx = x0 < x1 ? 1 : -1;
        const dy = Math.abs(y1 - y0);
        const sy = y0 < y1 ? 1 : -1;
        let err = (dx > dy ? dx : -dy) / 2;
        while (true) {
            this.drawPixel([x0, y0, color]);
            if (x0 === x1 && y0 === y1)
                break;
            const e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dy) {
                err += dx;
                y0 += sy;
            }
        }
    }
    // Draw an outlined  rectangle
    drawRect(x, y, w, h, color) {
        // top
        this.drawLine(x, y, x + w, y, color);
        // left
        this.drawLine(x, y + 1, x, y + h - 1, color);
        // right
        this.drawLine(x + w, y + 1, x + w, y + h - 1, color);
        // bottom
        this.drawLine(x, y + h - 1, x + w, y + h - 1, color);
    }
    ;
    // draw a filled rectangle on the oled
    fillRect(x, y, w, h, color) {
        // one iteration for each column of the rectangle
        for (let i = x; i < x + w; i += 1) {
            // draws a vert line
            this.drawLine(i, y, i, y + h - 1, color);
        }
    }
    /**
     * Draw a circle outline
     *
     * This method is ad verbatim translation from the corresponding
     * method on the Adafruit GFX library
     * https://github.com/adafruit/Adafruit-GFX-Library
     */
    drawCircle(x0, y0, r, color) {
        let f = 1 - r;
        let ddF_x = 1;
        let ddF_y = -2 * r;
        let x = 0;
        let y = r;
        const pointlist = [
            [x0, y0 + r, color],
            [x0, y0 - r, color],
            [x0 + r, y0, color],
            [x0 - r, y0, color]
        ];
        pointlist.forEach((element) => { this.drawPixel(element); });
        while (x < y) {
            if (f >= 0) {
                y--;
                ddF_y += 2;
                f += ddF_y;
            }
            x++;
            ddF_x += 2;
            f += ddF_x;
            const pointlist = [
                [x0 + x, y0 + y, color],
                [x0 - x, y0 + y, color],
                [x0 + x, y0 - y, color],
                [x0 - x, y0 - y, color],
                [x0 + y, y0 + x, color],
                [x0 - y, y0 + x, color],
                [x0 + y, y0 - x, color],
                [x0 - y, y0 - x, color]
            ];
            pointlist.forEach((element) => { this.drawPixel(element); });
        }
    }
    ;
}
//# sourceMappingURL=mono_canvas.js.map