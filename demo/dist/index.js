// <define:__slib_info>
var define_slib_info_default = { isBuild: true, name: "@randajan/queue", description: "Tiny javascript library to pack many calling of the same function to one execution", version: "0.1.2", author: { name: "Jan Randa", email: "jnranda@gmail.com", url: "https://www.linkedin.com/in/randajan/" }, env: "development", mode: "node", port: 3e3, dir: { root: "C:\\dev\\lib\\queue", dist: "demo/dist" } };

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
var Queue = class extends Function {
  constructor(processTasks, opt = {}) {
    super();
    opt = typeof opt === "object" ? opt : {};
    if (typeof processTasks !== "function") {
      throw Error("Queue(...) expect first argument to be function");
    }
    if (!opt.pass) {
      opt.pass = "all";
    } else if (!_pass.includes(opt.pass)) {
      throw Error(`Queue(...) expect opt.pass to be one of: '${_pass.join("|")}'`);
    }
    const args = toArray(opt.args);
    const pass = opt.pass;
    const softMs = numOrZero(opt.softMs);
    const hardMs = numOrZero(opt.hardMs);
    const maxSize = numOrZero(opt.maxSize);
    const hardMsActive = hardMs > softMs;
    let pcq, intA, intB, startAt, tasks = [];
    if (pass === "all") {
      pcq = (q2) => processTasks(...args, q2);
    } else if (pass === "first") {
      pcq = (q2) => processTasks(...args, ...q2[0]);
    } else if (pass === "last") {
      pcq = (q2) => processTasks(...args, ...q2[q2.length - 1]);
    }
    const execute = (_) => {
      clearTimeout(intA);
      clearTimeout(intB);
      const q2 = tasks;
      tasks = [];
      startAt = void 0;
      pcq(q2);
    };
    const call = (...args2) => {
      clearTimeout(intA);
      tasks.push(args2);
      if (maxSize && tasks.length >= maxSize) {
        return execute();
      }
      intA = setTimeout(execute, softMs);
      if (tasks.length !== 1) {
        return;
      }
      startAt = Date.now();
      if (hardMsActive) {
        intB = setTimeout(execute, hardMs);
      }
    };
    const self = Object.setPrototypeOf(call, new.target.prototype);
    Object.defineProperties(self, {
      isPending: { enumerable: true, get: (_) => !!startAt },
      size: { enumerable: true, get: (_) => tasks.length },
      startAt: { enumerable: true, get: (_) => startAt },
      softEndAt: { enumerable: true, get: (_) => !startAt ? void 0 : startAt + softMs },
      hardEndAt: { enumerable: true, get: (_) => !startAt || !hardMsActive ? void 0 : startAt + hardMs }
    });
    return self;
  }
};
var createQueue = (processTasks, opt = {}) => new Queue(processTasks, opt);
var src_default = createQueue;

// demo/src/index.js
var q = src_default((...args) => {
  console.log(...args);
}, {
  softMs: 1e3,
  hardMs: 3e3,
  maxSize: 10,
  pass: "all"
});
var c = 0;
setInterval((_) => {
  q(c += 1);
}, 100);
//# sourceMappingURL=index.js.map
