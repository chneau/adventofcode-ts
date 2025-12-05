import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.string()
		.transform((x) => x.split("\n"))
		.parse(input);
const _input = await fetchInput().then(parse);
const _example = parse(`987654321111111
811111111111119
234234234234278
818181911112111`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let result = 0;
	for (const line of input) {
		if (!line) continue;
		let best = 0;
		for (let i = 0; i < line.length - 1; i++) {
			const a = line.charCodeAt(i) - 48;
			for (let j = i + 1; j < line.length; j++) {
				const b = line.charCodeAt(j) - 48;
				const val = a * 10 + b;
				if (val > best) best = val;
			}
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
