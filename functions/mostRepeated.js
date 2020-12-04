function mostRepeated(data)
{
  var word={}
  var wordList=[];
  data.forEach(key=>{
    if(word[key]!=undefined)
    {
      word[key]++;
    }
    else
    {
      word[key]=1;
    }
  });
  for(var w in word)
  {
    wordList.push([w,word[w]]);
  }
  wordList.sort((a,b)=>b[1]-a[1]);
  return wordList;
}

module.exports=mostRepeated;
