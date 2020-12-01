const length=10;
const character="abcdefghjkmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ2346789";//not all letters are used due to similarity of characters
const x=character.length-1;
function generateCharacter()
{
  return character[Math.floor(Math.random()*x)];
}
function generatePassword()
{
  return new Array(length).fill(0).map(generateCharacter).join("");
}
module.exports=generatePassword;
