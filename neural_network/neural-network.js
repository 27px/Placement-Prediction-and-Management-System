const brain=require('brain.js');
var raw_data=require("./data.json");
const fs=require("fs");

const network=new brain.NeuralNetwork({
  hiddenLayers:[100]
});

var data=[];
raw_data.forEach(d=>{
  data.push({
    input:[d["engineering"],d["sslc"],d["plustwo"],d["ug"],d["pg"],d["project"],d["intern"],d["extras"],d["arrears"]],
    output:[d["placed"]]
  });
});

network.train(data,{
  iterations:20000,
  errorThresh:0.00001,
  log:true,
  logPeriod:10
});


console.log(network.toFunction().toString());

fs.writeFileSync('./neural_network/trained-model.js',`module.exports=${network.toFunction().toString()};`);
