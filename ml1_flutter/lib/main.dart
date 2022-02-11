import 'dart:async';
import 'dart:typed_data';

import 'package:bonsai/bonsai.dart';
import 'package:flutter/material.dart';

import 'package:flutter_midi_command/flutter_midi_command.dart';
import 'package:ml1_flutter/fire_control/fire_device.dart';

void main() {
  Log.init();
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final MidiCommand _midiCommand = MidiCommand();
  late final FireDevice _fireDevice;
  StreamSubscription? _fireSubscription;

  Uint8List? lastMidiMesg;

  @override
  void initState() {
    super.initState();
    _fireDevice = FireDevice(_midiCommand);
    _subscribeFireEvents();
  }

  @override
  void dispose() {
    _fireSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('ML-1'),
        ),
        body: Column(
          children: [
            Row(
              children: [
                MaterialButton(
                  child: const Text('Disconnect'),
                  onPressed: () async {
                    _fireDevice.disconnect();
                    log('device disconnected');
                  },
                ),
                MaterialButton(
                  child: const Text('Connect'),
                  onPressed: () async {
                    _fireDevice.connectDevice();
                    _subscribeFireEvents();
                    log('device connected');
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _subscribeFireEvents() {
    _fireSubscription = _fireDevice.fireEvents.listen((packet) {
      log('received packet: $packet');
    });
    log('subscribed to Fire events');
  }
}
