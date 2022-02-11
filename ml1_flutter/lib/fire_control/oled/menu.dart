import 'package:bonsai/bonsai.dart';
import 'package:dart_fire_midi/dart_fire_midi.dart';

import '../../project/session_viewmodel.dart';
import '../fire_device.dart';
import 'page.dart';
import 'screen.dart';
import 'selectable_list.dart';

abstract class MenuParam extends SelectableItem {
  final String title;
  final Function() onUpdate;

  MenuParam(this.title, this.onUpdate);

  void draw(Screen s);
}

class IntMenuParam extends MenuParam {
  final Stream<int> valueStream;
  final Function() onIncrement;
  final Function() onDecrement;

  int _currentValue = 0;

  IntMenuParam(
    String name,
    Function() onUpdate, {
    required int initialValue,
    required this.valueStream,
    required this.onIncrement,
    required this.onDecrement,
  }) : super(name, onUpdate) {
    //TODO: need to be able to close stream subscription
    _currentValue = initialValue;
    valueStream.forEach((v) {
      _currentValue = v;
    });
  }

  @override
  void next() {
    onIncrement();
    onUpdate();
  }

  @override
  void prev() {
    onDecrement();
    onUpdate();
  }

  @override
  void select() {/* NA */}

  @override
  void draw(Screen s) {
    s.clear();
    s.drawHeading(title);
    s.drawContent([_currentValue.toString()], large: true);
  }
}

abstract class Menu {
  Menu(this.onUpdate);

  String get title;
  SelectableList<Page> get pages;
  void draw(Screen s);
  final Function() onUpdate;
}

/// simple 2-level menu system
class MainMenu implements Menu {
  static const _title = 'FireTribe';

  @override
  String get title => _title;

  @override
  late final SelectableList<Page> pages;

  Page get selectedPage => pages.selectedItem;

  bool _showingPage = false;

  @override
  Function() onUpdate;

  MainMenu(this.onUpdate, {required SessionViewModel viewmodel}) {
    pages = SelectableList(
      onUpdate,
      [
        Page(
          'Sequencer',
          SelectableList<MenuParam>(
            onUpdate,
            [
              IntMenuParam(
                'BPM',
                onUpdate,
                initialValue: viewmodel.bpm,
                valueStream: viewmodel.stream.map((v) => v.bpm),
                onIncrement: viewmodel.incrementBpm,
                onDecrement: viewmodel.decrementBpm,
              ),
            ],
          ),
          onUpdate,
        ),
        Page(
          'Sampler',
          SelectableList<MenuParam>(onUpdate, []),
          onUpdate,
        ),
        Page(
          'Synth',
          SelectableList<MenuParam>(onUpdate, []),
          onUpdate,
        ),
        Page(
          'Settings',
          SelectableList<MenuParam>(onUpdate, []),
          onUpdate,
        ),
      ],
    );
  }

  void onMidiEvent(FireDevice device, FireInputEvent event) {
    if (event is DialEvent && event.type == DialType.Select) {
      if (event.dir == DialDirection.Left) {
        prev();
      } else {
        next();
      }
    }
    if (event is ButtonEvent && event.dir == ButtonDirection.Down) {
      if (event.type == ButtonType.Select) {
        select();
      } else if (event.type == ButtonType.Browser) {
        back();
      }
    }
  }

  void prev() {
    log('prev');
    if (_showingPage) {
      selectedPage.prev();
    } else {
      pages.prev();
    }
    onUpdate();
  }

  void next() {
    log('next');
    if (_showingPage) {
      selectedPage.next();
    } else {
      pages.next();
    }
    onUpdate();
  }

  void select() {
    log('select');
    if (_showingPage) {
      selectedPage.select();
    } else {
      _showingPage = true;
    }
    onUpdate();
  }

  void back() {
    log('back');
    _showingPage = false;
    onUpdate();
  }

  @override
  void draw(Screen s) {
    if (_showingPage) {
      selectedPage.draw(s);
    } else {
      s.clear();
      s.drawHeading(_title);
      s.drawContent(pages.items.map((p) => (p == selectedPage ? '>' : '') + p.title).toList());
    }
  }
}
