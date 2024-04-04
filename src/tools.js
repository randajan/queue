export const numOrZero = num=>{ 
    const n = Number(num);
    return isNaN(n) ? 0 : Math.max(0, n);
}

export const toArray = any=>{
    if (any == null) { return []; }
    if (Array.isArray(any)) { return any; }
    return [ any ];
}