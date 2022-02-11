import 'menu.dart';
import 'screen.dart';
import 'selectable_list.dart';

class Page extends SelectableItem {
  final String title;
  final SelectableList<MenuParam> params;
  final Function onUpdate;
  bool _showingParam = false;

  Page(this.title, this.params, this.onUpdate);

  @override
  void next() {
    if (_showingParam) {
      params.selectedItem.next();
    } else {
      params.next();
    }
  }

  @override
  void prev() {
    if (_showingParam) {
      params.selectedItem.prev();
    } else {
      params.prev();
    }
  }

  @override
  void select() {
    if (!_showingParam) {
      _showingParam = true;
    }
    onUpdate();
  }

  void back() {
    _showingParam = false;
    onUpdate();
  }

  void draw(Screen s) {
    if (_showingParam) {
      params.selectedItem.draw(s);
    } else {
      s.clear();
      s.drawHeading(title);
      s.drawContent(params.items
          .map((p) => (p == params.selectedItem ? '> ' : '') + p.title)
          .toList());
    }
  }
}
