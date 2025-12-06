import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z.array(z.union([z.tuple([z.number(), z.number()]), z.number()])).parseAsync(
		input
			.split("\n")
			.map((line) => {
				if (line.trim() === "") return null;
				const rangeMatch = line.match(/^(\d+)-(\d+)$/);
				if (rangeMatch) {
					return [
						parseInt(rangeMatch[1] as string, 10),
						parseInt(rangeMatch[2] as string, 10),
					];
				}
				return parseInt(line, 10);
			})
			.filter((x) => x != null),
	);
const _input = await fetchInput().then(parse);
const _example = await parse(`3-5
10-14
16-20
12-18

1
5
8
11
17
32`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let result = 0;
	var ranges: [number, number][] = [];
	for (const line of input) {
		if (typeof line === "object") {
			ranges.push(line);
		} else {
			const num = line;
			if (ranges.some(([start, end]) => num >= start && num <= end)) {
				result += 1;
			}
		}
	}
	return result;
};
const _example2 = _example
	.filter((x) => typeof x === "object")
	.sort((x, y) => x[0] - y[0]);
const input2 = _input
	.filter((x) => typeof x === "object")
	.sort((x, y) => x[0] - y[0]);
export const p2ex = () => p2(_example2);
export const p2 = (input = input2) => {
	let result = 0;

	let curStart: number | null = null;
	let curEnd = 0;
	for (const [s, e] of input) {
		if (curStart === null) {
			curStart = s;
			curEnd = e;
			continue;
		}
		if (s > curEnd + 1) {
			result += curEnd - curStart + 1;
			curStart = s;
			curEnd = e;
		} else {
			curEnd = Math.max(curEnd, e);
		}
	}
	if (curStart !== null) result += curEnd - curStart + 1;
	return result;
};
