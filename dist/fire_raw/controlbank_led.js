export class ControlBankLED {
    static off() {
        return [
            0xB0,
            0x1B,
            0,
        ];
    }
    static on(channel = false, mixer = false, user1 = false, user2 = false) {
        let value = [];
        value[0] = 0x10;
        if (channel) {
            value[0] = value[0] | 0x01;
        }
        if (mixer) {
            value[0] = value[0] | 0x02;
        }
        if (user1) {
            value[0] = value[0] | 0x04;
        }
        if (user2) {
            value[0] = value[0] | 0x08;
        }
        return [
            0xB0,
            0x1B,
            value[0],
        ];
    }
}
