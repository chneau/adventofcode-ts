console.log("\x1B[2J\x1B[3J\x1B[H");
console.log("Start");
const pkg = await import("./apug_2024_02");

const possibleFuncs = ["p1ex", "p1", "p2ex", "p2"];

for (const func of possibleFuncs) {
	// biome-ignore lint/suspicious/noExplicitAny: oh let me be, let me beeeeee
	const fn = (pkg as any)[func];
	if (typeof fn !== "function") {
		continue;
	}
	console.log(`[>>>>>>] Time ${func}`);
	console.time(`Time ${func}`);
	console.log(await fn());
	console.timeEnd(`Time ${func}`);
}
console.log("End");
