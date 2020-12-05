async function getResultFromCursor(cursor)
{
  var result=[];
  while(await cursor.hasNext())
  {
    result.push(await cursor.next());
  }
  return result;
}

module.exports=getResultFromCursor;
