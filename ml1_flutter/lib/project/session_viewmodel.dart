import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'session.dart';

class SessionViewModel extends StateNotifier<Session> {
  SessionViewModel(Session initialState) : super(initialState);

  get bpm => state.bpm;

  void incrementBpm() {
    state = state.copyWith(bpm: state.bpm + 1);
  }

  void decrementBpm() {
    state = state.copyWith(bpm: state.bpm - 1);
  }
}
