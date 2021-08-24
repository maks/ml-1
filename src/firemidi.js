WebMidi.enable(function (err) {

    if (err) {
        console.log("WebMidi could not be enabled.", err);
    } else {
        console.log("WebMidi enabled!");

        console.log(WebMidi.inputs);
        console.log(WebMidi.outputs);

        // Reacting when a new device becomes available
        WebMidi.addListener("connected", function (e) {
            console.log(e);
        });

        // Reacting when a device becomes unavailable
        WebMidi.addListener("disconnected", function (e) {
            console.log(e);
        });

        const input = WebMidi.inputs[1];

        input.addListener('noteon', "all",
            function (e) {
                console.log("Received 'noteon' message (" + e.note.name + "--" + e.note.number + ").");
            }
        );

        // Listen to control change message on all channels
        input.addListener('controlchange', "all",
            function (e) {
                console.log("Received 'controlchange' message.", e);
            }
        );
    }
    // true to sysex support
}, true);