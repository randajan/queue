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

        const onInit = opt.onInit;
        if (onInit && typeof onInit !== "function") { throw Error("Queue(...) expect opt.onInit to be function"); }

        const pass = opt.pass != null ? opt.pass : "all";
        if (!_pass.includes(pass)) { throw Error(`Queue(...) expect opt.pass to be one of: '${_pass.join("|")}'`); }
        
        const args = toArray(opt.args);
        const minSize = numOrZero(opt.minSize);
        const maxSize = numOrZero(opt.maxSize);
        const hardMs = numOrZero(opt.hardMs);
        const softMs = numOrZero(opt.softMs);
        const softMsActive = !!softMs;
        const hardMsActive = hardMs > softMs;
        
        
        let pcq, intA, intB, startAt, prom, tasks = [];

        if (pass === "all") { pcq = async q=>processTasks(...args, q); }
        else if (pass === "first") { pcq = async q=>processTasks(...args, ...q[0]); }
        else if (pass === "last") { pcq = async q=>processTasks(...args, ...q[q.length-1]); }

        const init = _=>{
            startAt = Date.now();
            prom = fakePromise();
            if (onInit) { onInit(); }
            if (hardMsActive) { intB = setTimeout(execute, hardMs); }
        }

        const flush = _=>{
            clearTimeout(intA);
            clearTimeout(intB);
            tasks = [];
            startAt = undefined;
        }

        const execute = async _=>{
            const q = tasks;
            flush();
            if (q.length < minSize) { return prom?.resolve(); }
            return pcq(q).then(prom.resolve).catch(prom.reject);
        };

        const attach = async (...args)=>{
            clearTimeout(intA);
            tasks.push(args);

            if (tasks.length === 1) {init();}
            if (maxSize && tasks.length >= maxSize) { execute(); }
            else if (softMsActive) { intA = setTimeout(execute, softMs); }

            if (opt.returnResult) { return prom.result; }
        }

        const self = Object.setPrototypeOf(attach, new.target.prototype);

        Object.defineProperties(self, {
            isPending:{ enumerable:true, get:_=>!!startAt },
            size:{ enumerable:true, get:_=>tasks.length },
            startAt:{ enumerable:true, get:_=>startAt },
            softEndAt:{ enumerable:true, get:_=>(!startAt || !softMsActive) ? undefined : (startAt + softMs) },
            hardEndAt:{ enumerable:true, get:_=>(!startAt || !hardMsActive) ? undefined : (startAt + hardMs) },
            execute:{ value:execute },
            flush:{ value:flush }
        });

        return self;
    }
}

export const createQueue = (processTasks, opt={})=>new Queue(processTasks, opt);

export default createQueue;
