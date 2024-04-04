// <define:__slib_info>
var define_slib_info_default = { isBuild: false, name: "@randajan/queue", description: "Tiny javascript library to pack many calling of the same function to one execution", version: "0.0.1", author: { name: "Jan Randa", email: "jnranda@gmail.com", url: "https://www.linkedin.com/in/randajan/" }, env: "development", mode: "node", port: 3e3, dir: { root: "C:\\dev\\lib\\queue", dist: "demo/dist" } };

// node_modules/@randajan/simple-lib/dist/chunk-JLCKRPTS.js
import chalkNative from "chalk";
var chalkProps = Object.getOwnPropertyNames(Object.getPrototypeOf(chalkNative)).filter((v) => v !== "constructor");
var Logger = class extends Function {
  constructor(formater, chalkInit) {
    super();
    const chalk = chalkInit || chalkNative;
    const log3 = (...msgs) => {
      console.log(chalk(formater(msgs)));
    };
    const self = Object.setPrototypeOf(log3.bind(), new.target.prototype);
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
import chalkNative2 from "chalk";
var define_slib_info_default2 = { isBuild: false, name: "@randajan/queue", description: "Tiny javascript library to pack many calling of the same function to one execution", version: "0.0.1", author: { name: "Jan Randa", email: "jnranda@gmail.com", url: "https://www.linkedin.com/in/randajan/" }, env: "development", mode: "node", port: 3e3, dir: { root: "C:\\dev\\lib\\queue", dist: "dist" } };
var chalkProps2 = Object.getOwnPropertyNames(Object.getPrototypeOf(chalkNative2)).filter((v) => v !== "constructor");
var Logger2 = class extends Function {
  constructor(formater, chalkInit) {
    super();
    const chalk = chalkInit || chalkNative2;
    const log22 = (...msgs) => {
      console.log(chalk(formater(msgs)));
    };
    const self = Object.setPrototypeOf(log22.bind(), new.target.prototype);
    for (const prop of chalkProps2) {
      Object.defineProperty(self, prop, { get: (_) => new Logger2(formater, chalk[prop]), enumerable: false });
    }
    return self;
  }
};
var logger2 = (...prefixes) => {
  const now = (_) => new Date().toLocaleTimeString("cs-CZ");
  prefixes = prefixes.filter((v) => !!v).join(" ");
  return new Logger2((msgs) => `${prefixes} | ${now()} | ${msgs.join(" ")}`);
};
var enumerable2 = true;
var lockObject2 = (o) => {
  if (typeof o !== "object") {
    return o;
  }
  const r = {};
  for (const i in o) {
    const descriptor = { enumerable: enumerable2 };
    let val = o[i];
    if (val instanceof Array) {
      descriptor.get = (_) => [...val];
    } else {
      descriptor.value = lockObject2(val);
    }
    Object.defineProperty(r, i, descriptor);
  }
  return r;
};
var info2 = lockObject2(define_slib_info_default2);
var log2 = logger2(info2.name, info2.version, info2.env);
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
      bufferEndAt: { enumerable: true, get: (_) => !startAt ? void 0 : startAt + softMs },
      queueEndAt: { enumerable: true, get: (_) => !startAt || !hardMsActive ? void 0 : startAt + hardMs }
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
