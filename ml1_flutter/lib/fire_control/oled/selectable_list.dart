import 'package:bonsai/bonsai.dart';

class SelectableList<T extends SelectableItem> {
  bool _showingItem = false;
  int _selectedIndex = 0;
  List<T> items;
  T get selectedItem => items[_selectedIndex];
  final Function() onUpdate;

  SelectableList(this.onUpdate, this.items);

  void prev() {
    log('prev');
    if (_showingItem) {
      selectedItem.prev();
    } else {
      _selectedIndex = _selectedIndex == 0 ? _selectedIndex : _selectedIndex - 1;
    }
    onUpdate();
  }

  void next() {
    log('next');
    if (_showingItem) {
      selectedItem.next();
    } else {
      _selectedIndex = _selectedIndex == (items.length - 1) ? _selectedIndex : _selectedIndex + 1;
    }
    onUpdate();
  }

  void select() {
    log('select');
    if (_showingItem) {
      selectedItem.select();
    } else {
      _showingItem = true;
    }
    onUpdate();
  }

  void back() {
    log('back');
    _showingItem = false;
    onUpdate();
  }
}

abstract class SelectableItem {
  void next();
  void prev();
  void select();
}
