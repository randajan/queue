
import { info, log } from "@randajan/simple-lib/node";
import createQueue from "../../dist/index.js";



const q = createQueue((...args)=>{
    console.log(...args);
}, {
    softMs:1000,
    hardMs:3000,
    maxSize:10,
    pass:"all"
});

let c = 0;
setInterval(_=>{
    q(c+=1);
}, 100);
