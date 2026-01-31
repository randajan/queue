
import { info, log } from "@randajan/simple-lib/node";
import createQueue from "../../dist/index.js";



const q = createQueue((c)=>{
    console.log("processQueue", c);
    return c;
}, {
    hardMs:5000,
    minSize:27,
    pass:"all",
    returnResult:true,
    onInit:_=>console.log("AAA")
});

let c = 0;
setInterval(async _=>{
    q(c+=1)
    //console.log("result", await q(c+=1));
}, 200);
