console.log("Start");
console.time("Time");
console.log(await import("./aoc_2023_01").then((x) => x.aoc_2023_01_part2()));
console.timeEnd("Time");
