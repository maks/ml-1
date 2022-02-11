import 'dart:async';

import 'package:bonsai/bonsai.dart';
import 'package:dart_fire_midi/dart_fire_midi.dart' as fire;
import 'package:flutter_midi_command/flutter_midi_command.dart';
import 'package:collection/collection.dart';

class FireDevice {
  final MidiCommand _midi;
  MidiDevice? _device;
  late final StreamSubscription<MidiPacket>? _rxSubscription;
  final _inputStreamController = StreamController<fire.FireInputEvent>();

  Stream get fireEvents => _inputStreamController.stream.asBroadcastStream();

  FireDevice(this._midi);

  Future<void> connectDevice() async {
    final devices = await _midi.devices;
    final device = devices?.firstWhereOrNull((dev) => dev.name.startsWith('FL STUDIO FIRE'));
    if (device != null) {
      await _midi.connectToDevice(device);

      _rxSubscription = _midi.onMidiDataReceived?.listen((packet) {
        log('received packet: ${packet.data}');
        _inputStreamController.add(fire.FireInputEvent.fromMidi(packet.data));
      });

      _midi.sendData(fire.allOffMessage);

      _device = device;
      log('connected device:$_device');
    } else {
      Log.e('no Fire device to connect to');
    }
  }

  void disconnect() {
    if (_device != null) {
      _midi.disconnectDevice(_device!);
    } else {
      log('no device to disconnect');
    }
  }

  void close() {
    _rxSubscription?.cancel();
  }
}
