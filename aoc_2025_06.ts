import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) => {
	const pre = input.split("\n").map((x) => x.split(" ").filter((x) => x));
	return z
		.object({
			numbers: z.coerce.number().array().array(),
			operations: z.literal(["+", "*"]).array(),
			length: z.number(),
		})
		.parseAsync({
			numbers: pre.slice(0, -1),
			operations: pre.slice(-1)[0],
			length: pre[0]?.length,
		});
};
const _example = await parse(`123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  `);
const _input = await fetchInput().then(parse);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let grandTotal = 0;
	for (let problemIdx = 0; problemIdx < input.length; problemIdx++) {
		const operation = input.operations[problemIdx] as "+" | "*";
		let problemResult: number | undefined;
		for (let rowIdx = 0; rowIdx < input.numbers.length; rowIdx++) {
			const num = input.numbers[rowIdx]?.[problemIdx] as number;
			if (problemResult === undefined) {
				problemResult = num;
			} else {
				if (operation === "+") {
					problemResult += num;
				} else if (operation === "*") {
					problemResult *= num;
				}
			}
		}
		if (problemResult !== undefined) {
			grandTotal += problemResult;
		}
	}

	return grandTotal;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	result += input.length;
	return result;
};
