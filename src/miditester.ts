import { MIDIVal } from "@midival/core";

MIDIVal.connect()
    .then(accessObject => {
        console.log("Inputs", accessObject.inputs);
        console.log("Outputs", accessObject.outputs);
    })
