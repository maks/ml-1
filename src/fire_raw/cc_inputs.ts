export class CCInputs {
  public static readonly buttonDown = 144;
  public static readonly buttonUp = 128;
  public static readonly dialRotate = 176;

  public static readonly rotateLeft = 127;
  public static readonly rotateRight = 1;

  public static readonly dialTouchOn = 127;
  public static readonly dialTouchOff = 0;

  public static readonly volume = 16;
  public static readonly pan = 17;
  public static readonly filter = 18;
  public static readonly resonance = 19;

  public static readonly selectDown = 25;
  public static readonly bankSelect = 26;

  public static readonly patternUp = 31;
  public static readonly patternDown = 32;
  public static readonly browser = 33;
  public static readonly gridLeft = 34;
  public static readonly gridRight = 35;

  public static readonly muteButton1 = 36;
  public static readonly muteButton2 = 37;
  public static readonly muteButton3 = 38;
  public static readonly muteButton4 = 39;

  public static readonly row0Led = 40;
  public static readonly row1Led = 41;
  public static readonly row2Led = 42;
  public static readonly row3Led = 43;

  public static readonly step = 44;
  public static readonly note = 45;
  public static readonly drum = 46;
  public static readonly perform = 47;
  public static readonly shift = 48;
  public static readonly alt = 49;
  public static readonly pattern = 50;

  public static readonly play = 51;
  public static readonly stop = 52;
  public static readonly record = 53;

  public static readonly firstPad = 54;
  public static readonly lastPad = 117;

  public static readonly select = 118;

  // All
  public static readonly off = 0;

  // Red Only
  // pattern up/down, browser, grid left/right
  public static readonly paleRed = 1;
  public static readonly red = 2;

  // Green only
  // mute 1,2,3,4
  public static readonly mutePaleGreen = 1;
  public static readonly muteGreen = 2;

  // Yellow only
  // alt, stop
  public static readonly paleYellow = 1;
  public static readonly yellow = 2;

  // Yellow-Red
  // step, note, drum, perform, shift
  public static readonly paleRed2 = 1;
  public static readonly paleYellow2 = 2;
  public static readonly red2 = 3;
  public static readonly yellow2 = 4;

  //record
  public static readonly recPaleRed = 1;
  public static readonly recPaleYellow = 2;
  public static readonly recRed = 3;
  public static readonly recYellow = 4;

  // Yellow-Green
  // pattern, play
  public static readonly paleGreen3 = 1;
  public static readonly paleYellow3 = 2;
  public static readonly green3 = 3;
  public static readonly yellow3 = 4;

  // row leds
  public static readonly rowPaleRed = 1;
  public static readonly rowPalegreen = 2;
  public static readonly rowRed = 3;
  public static readonly rowGreen = 4;

  public static readonly rowDim = 1;
  public static readonly rowBright = 2;


  static on(id: number, value: number) {
    return [
      0xB0, // midi control change code
      id,
      value,
    ];
  }
}
