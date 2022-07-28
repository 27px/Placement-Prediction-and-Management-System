const NeuralNetwork = require("../neural_network/trained-model.js");
var raw_data = require("./data.json");

var output,
    prediction,
    correct = 0,
    i = 0;
raw_data.forEach((d) => {
    output = NeuralNetwork([
        d["engineering"],
        d["sslc"],
        d["plustwo"],
        d["ug"],
        d["pg"],
        d["project"],
        d["intern"],
        d["extras"],
        d["arrears"],
    ]);
    console.log(i, parseInt(output[0] * 10000) / 100);
    prediction = parseInt(output[0] * 10000) / 100 < 75 ? 0 : 1;
    if (d["placed"] != prediction) {
        console.log(i, d["placed"], prediction, output[0]);
    } else {
        correct++;
    }
    i++;
});

console.log("\n\nTotal\t\t:\t" + i);
console.log("Correct\t\t:\t" + correct);
console.log("Incorrect\t:\t" + (i - correct));

// function test(inp)
// {
//   var out=NeuralNetwork(inp);
//   console.log(parseInt(out[0]*10000)/100);
// }
//
//
// test([0,0.5,0,0.6,1,0.2,0.5,0.6,0.8]);
