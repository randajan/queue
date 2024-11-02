
import { info, log } from "@randajan/simple-lib/node";
import createQueue from "../../dist/index.js";



const q = createQueue((c)=>{
    console.log("processQueue", c);
    return c;
}, {
    softMs:1000,
    hardMs:3000,
    maxSize:10,
    pass:"last",
    onInit:_=>console.log("AAA")
});

let c = 0;
setInterval(async _=>{
    console.log("result", await q(c+=1));
}, 100);
