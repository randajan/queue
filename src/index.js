import { numOrZero, toArray } from "./tools";

const _pass = ["all", "first", "last"];

export const fakePromise = ()=>{
    const prom = {};
    prom.result = new Promise((res, rej)=>{
        prom.resolve = res;
        prom.reject = rej;
    });
    return prom;
}

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

        let pcq, intA, intB, startAt, prom, tasks = [];

        if (pass === "all") { pcq = async q=>processTasks(...args, q); }
        else if (pass === "first") { pcq = async q=>processTasks(...args, ...q[0]); }
        else if (pass === "last") { pcq = async q=>processTasks(...args, ...q[q.length-1]); }

        const init = _=>{
            startAt = Date.now();
            prom = fakePromise();
            if (hardMsActive) { intB = setTimeout(execute, hardMs); }
        }

        const execute = async _=>{
            clearTimeout(intA);
            clearTimeout(intB);
            const q = tasks;
            tasks = [];
            startAt = undefined;
            pcq(q).then(prom.resolve).catch(prom.reject);
        };

        const call = async (...args)=>{
            clearTimeout(intA);
            tasks.push(args);

            if (tasks.length === 1) {init();}
            if (maxSize && tasks.length >= maxSize) { execute(); }
            else { intA = setTimeout(execute, softMs); }

            return prom.result;
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