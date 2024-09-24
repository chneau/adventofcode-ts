console.log("Start");
const pkg = await import("./aoc_2023_03");

console.time("Time");
console.log(pkg.p1());
console.timeEnd("Time");
