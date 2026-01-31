// <define:__slib_info>
var define_slib_info_default = { isBuild: true, name: "@randajan/queue", description: "Tiny javascript library to pack many calling of the same function to one execution", version: "0.1.7", author: { name: "Jan Randa", email: "jnranda@gmail.com", url: "https://www.linkedin.com/in/randajan/" }, env: "development", mode: "node", port: 3e3, dir: { root: "C:\\dev\\lib\\queue", dist: "demo/dist" } };

// node_modules/@randajan/simple-lib/dist/chunk-JLCKRPTS.js
import chalkNative from "chalk";
var chalkProps = Object.getOwnPropertyNames(Object.getPrototypeOf(chalkNative)).filter((v) => v !== "constructor");
var Logger = class extends Function {
  constructor(formater, chalkInit) {
    super();
    const chalk = chalkInit || chalkNative;
    const log2 = (...msgs) => {
      console.log(chalk(formater(msgs)));
    };
    const self = Object.setPrototypeOf(log2.bind(), new.target.prototype);
    for (const prop of chalkProps) {
      Object.defineProperty(self, prop, { get: (_) => new Logger(formater, chalk[prop]), enumerable: false });
    }
    return self;
  }
};
var logger = (...prefixes) => {
  const now = (_) => new Date().toLocaleTimeString("cs-CZ");
  prefixes = prefixes.filter((v) => !!v).join(" ");
  return new Logger((msgs) => `${prefixes} | ${now()} | ${msgs.join(" ")}`);
};

// node_modules/@randajan/simple-lib/dist/chunk-XM4YD4K6.js
var enumerable = true;
var lockObject = (o) => {
  if (typeof o !== "object") {
    return o;
  }
  const r = {};
  for (const i in o) {
    const descriptor = { enumerable };
    let val = o[i];
    if (val instanceof Array) {
      descriptor.get = (_) => [...val];
    } else {
      descriptor.value = lockObject(val);
    }
    Object.defineProperty(r, i, descriptor);
  }
  return r;
};
var info = lockObject(define_slib_info_default);

// node_modules/@randajan/simple-lib/dist/node/index.js
import { parentPort } from "worker_threads";
var log = logger(info.name, info.version, info.env);
parentPort.on("message", (msg) => {
  if (msg === "shutdown") {
    process.exit(0);
  }
});
process.on("uncaughtException", (e) => {
  console.log(e.stack);
});

// dist/index.js
var numOrZero = (num) => {
  const n = Number(num);
  return isNaN(n) ? 0 : Math.max(0, n);
};
var toArray = (any) => {
  if (any == null) {
    return [];
  }
  if (Array.isArray(any)) {
    return any;
  }
  return [any];
};
var _pass = ["all", "first", "last"];
var fakePromise = () => {
  const prom = {};
  prom.result = new Promise((res, rej) => {
    prom.resolve = res;
    prom.reject = rej;
  });
  return prom;
};
var Queue = class extends Function {
  constructor(processTasks, opt = {}) {
    super();
    opt = typeof opt === "object" ? opt : {};
    if (typeof processTasks !== "function") {
      throw Error("Queue(...) expect first argument to be function");
    }
    const onInit = opt.onInit;
    if (onInit && typeof onInit !== "function") {
      throw Error("Queue(...) expect opt.onInit to be function");
    }
    const pass = opt.pass != null ? opt.pass : "all";
    if (!_pass.includes(pass)) {
      throw Error(`Queue(...) expect opt.pass to be one of: '${_pass.join("|")}'`);
    }
    const args = toArray(opt.args);
    const minSize = numOrZero(opt.minSize);
    const maxSize = numOrZero(opt.maxSize);
    const hardMs = numOrZero(opt.hardMs);
    const softMs = numOrZero(opt.softMs);
    const softMsActive = !!softMs;
    const hardMsActive = hardMs > softMs;
    let pcq, intA, intB, startAt, prom, tasks = [];
    if (pass === "all") {
      pcq = async (q2) => processTasks(...args, q2);
    } else if (pass === "first") {
      pcq = async (q2) => processTasks(...args, ...q2[0]);
    } else if (pass === "last") {
      pcq = async (q2) => processTasks(...args, ...q2[q2.length - 1]);
    }
    const init = (_) => {
      startAt = Date.now();
      prom = fakePromise();
      if (onInit) {
        onInit();
      }
      if (hardMsActive) {
        intB = setTimeout(execute, hardMs);
      }
    };
    const flush = (_) => {
      clearTimeout(intA);
      clearTimeout(intB);
      tasks = [];
      startAt = void 0;
    };
    const execute = async (_) => {
      const q2 = tasks;
      flush();
      if (q2.length < minSize) {
        return prom?.resolve();
      }
      return pcq(q2).then(prom.resolve).catch(prom.reject);
    };
    const attach = async (...args2) => {
      clearTimeout(intA);
      tasks.push(args2);
      if (tasks.length === 1) {
        init();
      }
      if (maxSize && tasks.length >= maxSize) {
        execute();
      } else if (softMsActive) {
        intA = setTimeout(execute, softMs);
      }
      if (opt.returnResult) {
        return prom.result;
      }
    };
    const self = Object.setPrototypeOf(attach, new.target.prototype);
    Object.defineProperties(self, {
      isPending: { enumerable: true, get: (_) => !!startAt },
      size: { enumerable: true, get: (_) => tasks.length },
      startAt: { enumerable: true, get: (_) => startAt },
      softEndAt: { enumerable: true, get: (_) => !startAt || !softMsActive ? void 0 : startAt + softMs },
      hardEndAt: { enumerable: true, get: (_) => !startAt || !hardMsActive ? void 0 : startAt + hardMs },
      execute: { value: execute },
      flush: { value: flush }
    });
    return self;
  }
};
var createQueue = (processTasks, opt = {}) => new Queue(processTasks, opt);
var src_default = createQueue;

// demo/src/index.js
var q = src_default((c2) => {
  console.log("processQueue", c2);
  return c2;
}, {
  hardMs: 5e3,
  minSize: 27,
  pass: "all",
  returnResult: true,
  onInit: (_) => console.log("AAA")
});
var c = 0;
setInterval(async (_) => {
  q(c += 1);
}, 200);
//# sourceMappingURL=index.js.map
