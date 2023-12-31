const gfname="MrsRandom";
const gfname2="MrsRandom2";
const gfname3="MrsRandom3";


export default gfname // it only pick one we use {} for more
export {gfname2,gfname3}

//if we want to import a function

export const generatelovepercent=()=>
{
   return `${Math.floor(Math.random()*100)} percent` 
} 