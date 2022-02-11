import 'dart:convert';

class Session {
  final String name;
  final int bpm;

  Session({
    required this.name,
    required this.bpm,
  });

  factory Session.init() => Session(name: 'new session', bpm: 120);

  Session copyWith({
    String? name,
    int? bpm,
  }) {
    return Session(
      name: name ?? this.name,
      bpm: bpm ?? this.bpm,
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'name': name,
      'bpm': bpm,
    };
  }

  factory Session.fromMap(Map<String, dynamic> map) {
    return Session(
      name: map['name'] as String,
      bpm: map['bpm'] as int,
    );
  }

  String toJson() => json.encode(toMap());

  factory Session.fromJson(String source) =>
      Session.fromMap(json.decode(source) as Map<String, dynamic>);

  @override
  String toString() => 'Session(name: $name, bpm: $bpm)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }

    return other is Session && other.name == name && other.bpm == bpm;
  }

  @override
  int get hashCode => name.hashCode ^ bpm.hashCode;
}
