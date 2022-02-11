import 'dart:async';
import 'dart:typed_data';

import 'package:bonsai/bonsai.dart';
import 'package:flutter/material.dart';

import 'package:flutter_midi_command/flutter_midi_command.dart';

import 'fire_midi.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  StreamSubscription<MidiPacket>? _rxSubscription;
  final MidiCommand _midiCommand = MidiCommand();

  Uint8List? lastMidiMesg;

  @override
  void initState() {
    super.initState();
    _rxSubscription = _midiCommand.onMidiDataReceived?.listen((packet) {
      log('received packet: ${packet.data}');
      setState(() {
        lastMidiMesg = packet.data;
      });
    });
  }

  @override
  void dispose() {
    _rxSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Plugin example app'),
        ),
        body: Center(
            child: FutureBuilder<List<MidiDevice>?>(
                future: _midiCommand.devices,
                builder: (context, snapshot) {
                  if (snapshot.data == null) {
                    return const CircularProgressIndicator();
                  }
                  final devices = snapshot.data;
                  if (devices == null) {
                    return const Text('No Devices');
                  }
                  return Column(
                    children: [
                      SizedBox(
                        height: 200,
                        child: ListView.builder(
                            itemCount: devices.length,
                            itemBuilder: (context, index) {
                              return MaterialButton(
                                child: Text(_deviceLabel(devices[index])),
                                onPressed: () async {
                                  final dev = devices[index];
                                  if (dev.connected) {
                                    _midiCommand.disconnectDevice(dev);
                                    log('device disconnected');
                                  } else {
                                    await _midiCommand.connectToDevice(dev);
                                    log('device connected - reconnect Rx stream');
                                    _rxSubscription =
                                        _midiCommand.onMidiDataReceived?.listen((packet) {
                                      log('received packet: ${packet.data}');
                                      setState(() {
                                        lastMidiMesg = packet.data;
                                      });
                                    });
                                  }
                                  setState(() {});
                                },
                              );
                            }),
                      ),
                      Text('Last midi: $lastMidiMesg'),
                      MaterialButton(
                          child: const Text('FIRE: ALL PADS OFF'),
                          onPressed: () {
                            log('send all off');
                            _midiCommand.sendData(Uint8List.fromList(fireAllPads(0, 0, 0)));
                          })
                    ],
                  );
                })),
      ),
    );
  }

  String _deviceLabel(MidiDevice device) {
    return device.connected ? '${device.name} CONNECTED' : 'connect: ${device.name}';
  }
}
