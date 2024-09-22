console.log("Start");
console.time("Time");
console.log(await import("./aoc_2023_02").then((x) => x.aoc_2023_02()));
console.timeEnd("Time");
