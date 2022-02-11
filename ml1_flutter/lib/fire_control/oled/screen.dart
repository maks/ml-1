import 'dart:math';

import 'package:monochrome_draw/monochrome_draw.dart';
import 'package:oled_font_57/oled_font_57.dart' as font57;

import 'menu.dart';

/// Access to drawing onto the Fire's OLED
class Screen {
  final Function(List<bool>) onPaint;
  final MainMenu menu;

  static const maxVisibleItems = 4;
  static const lineHeight = 8;

  final font = Font(
    monospace: font57.monospace,
    width: font57.width,
    height: font57.height,
    fontData: font57.fontData,
    lookup: font57.lookup,
  );
  final MonoCanvas oledBitmap = MonoCanvas(128, 64);

  Screen(this.onPaint, this.menu) {
    redraw();
  }

  void drawHeading(String heading) {
    oledBitmap.setCursor(0, 0);
    oledBitmap.writeString(font, 1, heading, true, true, 1);
    oledBitmap.setCursor(0, lineHeight);
    oledBitmap.writeString(font, 1, '=' * heading.length, true, true, 1);
    onPaint(oledBitmap.data);
  }

  void drawContent(List<String> content, {bool large = false}) {
    const offset = lineHeight * 2;
    for (int line = 0; line < min(content.length, maxVisibleItems); line++) {
      oledBitmap.setCursor(0, (8 * line) + offset);
      oledBitmap.writeString(font, large ? 2 : 1, content[line], true, true, 1);
    }
    onPaint(oledBitmap.data);
  }

  void redraw() {
    menu.draw(this);
  }

  void clear() {
    oledBitmap.clear();
  }
}
