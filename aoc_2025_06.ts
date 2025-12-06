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
const _rawInput = await fetchInput();
const _rawExample = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  `;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
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
const parse2 = async (input: string) => {
	const lines = input.split("\n");
	const length = lines[0]?.length ?? 0;
	const groups = [] as {
		operation: "+" | "*" | "";
		nums: number[];
	}[];
	let group = {
		operation: "" as "+" | "*" | "",
		nums: [] as number[],
	};
	for (let i = 0; i < length; i++) {
		const characters = lines.map((x) => x[i] as string);
		const isSpaceOnly = characters.every((x) => x === " ");
		if (isSpaceOnly) {
			groups.push(structuredClone(group));
			group = { operation: "", nums: [] };
			continue;
		}
		const num = Number.parseInt(characters.slice(0, -1).join(""), 10);
		const operation = characters[lines.length - 1];
		if (operation === "+" || operation === "*") {
			group.operation = operation as "+" | "*";
		}
		group.nums.push(num);
	}
	groups.push(group);
	return z
		.object({
			operation: z.literal(["+", "*"]),
			nums: z.array(z.number()),
		})
		.array()
		.parseAsync(groups);
};
const _example2 = await parse2(_rawExample);
const _input2 = await parse2(_rawInput);
export const p2ex = () => p2(_example2);
export const p2 = (input = _input2) => {
	let result = 0;
	for (const group of input) {
		let groupResult: number | undefined;
		for (const num of group.nums) {
			if (groupResult === undefined) {
				groupResult = num;
			} else {
				if (group.operation === "+") {
					groupResult += num;
				} else if (group.operation === "*") {
					groupResult *= num;
				}
			}
		}
		if (groupResult !== undefined) {
			result += groupResult;
		}
	}
	return result;
};
