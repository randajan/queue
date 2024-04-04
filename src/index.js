
import { info, log } from "@randajan/simple-lib/lib";
import { numOrZero, toArray } from "./tools";

const _pass = ["all", "first", "last"];

export class Queue extends Function {

    constructor(processTasks, opt={}) {
        super();

        opt = typeof opt === "object" ? opt : {};

        if (typeof processTasks !== "function") { throw Error("Queue(...) expect first argument to be function"); }

        if (!opt.pass) { opt.pass = "all"; }
        else if (!_pass.includes(opt.pass)) { throw Error(`Queue(...) expect opt.pass to be one of: '${_pass.join("|")}'`); }
        
        const args = toArray(opt.args);
        const pass = opt.pass;
        const softMs = numOrZero(opt.softMs);
        const hardMs = numOrZero(opt.hardMs);
        const maxSize = numOrZero(opt.maxSize);
        const hardMsActive = hardMs > softMs;

        let pcq, intA, intB, startAt, tasks = [];

        if (pass === "all") { pcq = q=>processTasks(...args, q); }
        else if (pass === "first") { pcq = q=>processTasks(...args, ...q[0]); }
        else if (pass === "last") { pcq = q=>processTasks(...args, ...q[q.length-1]); }

        const execute = _=>{
            clearTimeout(intA);
            clearTimeout(intB);
            const q = tasks;
            tasks = [];
            startAt = undefined;
            pcq(q);
        };

        const call = (...args)=>{
            clearTimeout(intA);
            tasks.push(args);
            if (maxSize && tasks.length >= maxSize) { return execute(); }

            intA = setTimeout(execute, softMs);
            if (tasks.length !== 1) { return; }

            startAt = Date.now();
            if (hardMsActive) { intB = setTimeout(execute, hardMs); }
        }

        const self = Object.setPrototypeOf(call, new.target.prototype);

        Object.defineProperties(self, {
            isPending:{ enumerable:true, get:_=>!!startAt },
            size:{ enumerable:true, get:_=>tasks.length },
            startAt:{ enumerable:true, get:_=>startAt },
            softEndAt:{ enumerable:true, get:_=>!startAt ? undefined : (startAt + softMs) },
            hardEndAt:{ enumerable:true, get:_=>(!startAt || !hardMsActive) ? undefined : (startAt + hardMs) }
        });

        return self;
    }
}

export const createQueue = (processTasks, opt={})=>new Queue(processTasks, opt);

export default createQueue;