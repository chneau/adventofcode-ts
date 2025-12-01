import z from "zod";

console.log("\x1B[2J\x1B[3J\x1B[H");
const file = z.string().parse(Bun.argv[2]);
console.log(`[++++++] Start ${file} [++++++]`);
const pkg = await import(`./${file}`);

const possibleFuncs = ["p1ex", "p1", "p2ex", "p2"];

for (const func of possibleFuncs) {
	// biome-ignore lint/suspicious/noExplicitAny: oh let me be, let me beeeeee
	const fn = (pkg as any)[func];
	if (typeof fn !== "function") {
		continue;
	}
	console.time(`Time ${func}`);
	const result = await fn();
	console.timeEnd(`Time ${func}`);
	console.log(result);
}
console.log("[------] End [------]");
