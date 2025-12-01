import { bench, run } from "mitata";
import z from "zod";

console.log("\x1B[2J\x1B[3J\x1B[H");
const file = z.string().parse(Bun.argv[2]);
console.log(`[++++++] Start ${file} [++++++]`);
const pkg = await import(`./${file}`);

for (const key of Object.keys(pkg)) {
	const fn = pkg[key];
	if (typeof fn !== "function") continue;
	console.time(`Time ${key}`);
	const result = await fn();
	console.timeEnd(`Time ${key}`);
	console.log(result);
}
console.log("[------] End [------]");

console.log("\n[++++++] Benchmark [++++++]");
for (const key of Object.keys(pkg)) {
	if (key.endsWith("ex")) continue;
	const fn = pkg[key];
	if (typeof fn !== "function") continue;
	bench(key, () => fn());
}
await run();
console.log("[------] End [------]");
