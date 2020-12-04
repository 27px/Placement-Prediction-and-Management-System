const word=require("../static/plugins/words.json");
function notInEnglishWords(data)
{
  var include=[];
  // var exclude=[];
  data.forEach(key=>{
    let k=key[0].toLowerCase();
    if(!word.includes(k))
    {
      include.push(key[0]);
    }
    // else
    // {
    //   exclude.push(key[0]);
    // }
  })
  // console.log("Include : \n");
  // console.log(JSON.stringify(include,null,2));
  // console.log("Exclude : \n");
  // console.log(JSON.stringify(exclude,null,2));
  return include;
}

module.exports=notInEnglishWords;
