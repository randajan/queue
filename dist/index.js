// src/tools.js
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

// src/index.js
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
    let pcq, intA, intB, startAt, prom, tasks = [];
    if (pass === "all") {
      pcq = async (q) => processTasks(...args, q);
    } else if (pass === "first") {
      pcq = async (q) => processTasks(...args, ...q[0]);
    } else if (pass === "last") {
      pcq = async (q) => processTasks(...args, ...q[q.length - 1]);
    }
    const init = (_) => {
      startAt = Date.now();
      prom = fakePromise();
      if (hardMsActive) {
        intB = setTimeout(execute, hardMs);
      }
    };
    const execute = async (_) => {
      clearTimeout(intA);
      clearTimeout(intB);
      const q = tasks;
      tasks = [];
      startAt = void 0;
      pcq(q).then(prom.resolve).catch(prom.reject);
    };
    const call = async (...args2) => {
      clearTimeout(intA);
      tasks.push(args2);
      if (tasks.length === 1) {
        init();
      }
      if (maxSize && tasks.length >= maxSize) {
        execute();
      } else {
        intA = setTimeout(execute, softMs);
      }
      if (opt.returnResult) {
        return prom.result;
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
export {
  Queue,
  createQueue,
  src_default as default,
  fakePromise
};
//# sourceMappingURL=index.js.map
