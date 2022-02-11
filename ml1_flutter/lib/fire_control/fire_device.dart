import 'dart:async';

import 'package:bonsai/bonsai.dart';
import 'package:dart_fire_midi/dart_fire_midi.dart' as fire;
import 'package:flutter_midi_command/flutter_midi_command.dart';
import 'package:collection/collection.dart';
import 'package:ml1_flutter/fire_control/oled/screen.dart';
import 'package:monochrome_draw/monochrome_draw.dart';

class FireDevice {
  final MidiCommand _midi;
  MidiDevice? _device;
  StreamSubscription<MidiPacket>? _rxSubscription;
  final _inputStreamController = StreamController<fire.FireInputEvent>();

  Stream get fireEvents => _inputStreamController.stream.asBroadcastStream();

  FireDevice(this._midi);

  Future<void> connectDevice() async {
    final devices = await _midi.devices;
    final device = devices?.firstWhereOrNull((dev) => dev.name.startsWith('FL STUDIO FIRE'));
    if (device != null) {
      await _midi.connectToDevice(device);

      _rxSubscription ??= _midi.onMidiDataReceived?.listen((packet) {
        log('received packet: ${packet.data}');
        _inputStreamController.add(fire.FireInputEvent.fromMidi(packet.data));
      });

      _midi.sendData(fire.allOffMessage);

      _device = device;
      log('connected device:$_device');

      final MonoCanvas oledBitmap = MonoCanvas(128, 64);
      oledBitmap.setCursor(0, 0);
      oledBitmap.writeString(defaultFont, 2, "Hello :-)", true, true, 1);
      _midi.sendData(fire.sendBitmap(oledBitmap.data));
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
