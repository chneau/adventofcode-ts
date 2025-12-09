import { Browser } from "happy-dom";
import { bench, run } from "mitata";
import z from "zod";
import { session } from "./session";

const argv = Bun.argv.slice(2);
const problem = await z
	.string()
	.parseAsync(argv.find((x) => !x.startsWith("-")));
const year = await z.coerce
	.number()
	.min(2015)
	.parseAsync(problem.split("_").find((x) => x.length === 4));
const day = await z.coerce
	.number()
	.min(1)
	.max(25)
	.parseAsync(problem.split("_").find((x) => x.length === 2));
const options = await z
	.string()
	.array()
	.parseAsync(argv.filter((x) => x.startsWith("-")));
const isCreate = options.includes("--create");
const isRead = options.includes("--read");
const withBenchmark = options.includes("--bench");

const fileName = `./${problem}.ts`;
const fileExists = await Bun.file(fileName).exists();
if (!fileExists) {
	await Bun.write(
		fileName,
		`import z from "zod";
import { fetchInput } from "./session";
const parse = async (input: string) => z.string().parseAsync(input);
const _rawInput = await fetchInput();
const _rawExample = \`example_input_here\`;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => { let result = 0; result += input.length; return result; };
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => { let result = 0; result += input.length; return result; };`,
	);
	await Bun.$`bun run all`;
}
if (isCreate) {
	await Bun.$`cat ${fileName}`;
	process.exit(0);
}
if (isRead) {
	const html =
		await Bun.$`curl -s "https://adventofcode.com/${year}/day/${day}" -H "Cookie: session=${session}"`.text();
	const browser = new Browser();
	const page = browser.newPage();
	page.content = html;
	console.log(page.mainFrame.document.body.querySelector("main")?.innerText);
	process.exit(0);
}

console.log("\x1B[2J\x1B[3J\x1B[H");
console.log(`[++++++] Start ${fileName} [++++++]`);
const pkg = await import(fileName);

const sortKeys = (obj: Record<string, unknown>) => {
	return Object.keys(obj).sort((a, b) => {
		if (a.endsWith("ex") && !b.endsWith("ex")) return -1;
		if (!a.endsWith("ex") && b.endsWith("ex")) return 1;
		return a.localeCompare(b);
	});
};

for (const key of sortKeys(pkg)) {
	console.time(`Time ${key}`);
	const result = await pkg[key]();
	console.timeEnd(`Time ${key}`);
	console.log(result);
}
console.log("[------] End [------]");

if (!withBenchmark) process.exit(0);
console.log("\n[++++++] Benchmark [++++++]");
for (const key of Object.keys(pkg).filter((x) => !x.endsWith("ex"))) {
	bench(key, pkg[key]);
}
await run();
console.log("[------] End [------]");
