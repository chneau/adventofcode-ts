import { bench, run } from "mitata";
import z from "zod";

console.log("\x1B[2J\x1B[3J\x1B[H");
const file = z.string().parse(Bun.argv[2]);
console.log(`[++++++] Start ${file} [++++++]`);
const pkg = await import(`./${file}`);

for (const key of Object.keys(pkg)) {
	console.time(`Time ${key}`);
	const result = await pkg[key]();
	console.timeEnd(`Time ${key}`);
	console.log(result);
}
console.log("[------] End [------]");

console.log("\n[++++++] Benchmark [++++++]");
for (const key of Object.keys(pkg).filter((x) => !x.endsWith("ex"))) {
	bench(key, pkg[key]);
}
await run();
console.log("[------] End [------]");
