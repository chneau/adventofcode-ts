import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.string()
		.transform((x) => x.split("\n"))
		.parseAsync(input);
const _input = await fetchInput().then(parse);
const _example = await parse(`987654321111111
811111111111119
234234234234278
818181911112111`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let result = 0;
	for (const line of input) {
		if (!line || line.length < 2) continue;
		let best = 0;
		let maxSuffix = line.charCodeAt(line.length - 1) - 48;
		for (let i = line.length - 2; i >= 0; i--) {
			const d = line.charCodeAt(i) - 48;
			const val = d * 10 + maxSuffix;
			if (val > best) best = val;
			if (d > maxSuffix) maxSuffix = d;
		}
		result += best;
	}
	return result;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	for (const line of input) {
		if (!line) continue;
		const k = 12;
		const n = line.length;
		if (n <= k) {
			result += Number(line);
			continue;
		}
		const stack: string[] = [];
		for (let i = 0; i < n; i++) {
			const ch = line[i] as string;
			while (
				stack.length > 0 &&
				stack.length + (n - i) > k &&
				(stack[stack.length - 1] as string) < ch
			) {
				stack.pop();
			}
			if (stack.length < k) stack.push(ch);
		}
		const chosen = stack.slice(0, k).join("");
		result += Number(chosen);
	}
	return result;
};
