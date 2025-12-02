import { bench, run } from "mitata";
import z from "zod";

console.log("\x1B[2J\x1B[3J\x1B[H");
const file = z.string().parse(Bun.argv[2]);
const fileName = `./${file}.ts`;
const fileExists = await Bun.file(fileName).exists();
if (!fileExists) {
	await Bun.write(
		fileName,
		`import z from "zod";
import { fetchInput } from "./session";
const parse = (input: string) => z.string().parse(input);
const _input = await fetchInput().then(parse);
const _example = parse(\`example_input_here\`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => { let result = 0; result += input.length; return result; };
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => { let result = 0; result += input.length; return result; };`,
	);
	await Bun.$`bun run all`;
}
console.log(`[++++++] Start ${file} [++++++]`);
const pkg = await import(fileName);

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
