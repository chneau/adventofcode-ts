import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.array(z.tuple([z.number(), z.number()]))
		.parse(input.split(",").map((x) => x.split("-").map(Number)));
const _input = await fetchInput().then(parse);
const _example =
	parse(`11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
	1698522-1698528,446443-446449,38593856-38593862,565653-565659,
	824824821-824824827,2121212118-2121212124
	`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let result = 0;
	for (const [start, end] of input) {
		for (let x = start; x <= end; x++) {
			const length = Math.floor(Math.log10(x)) + 1;
			if (length % 2 !== 0) continue;
			const leftPart = x % 10 ** Math.floor(length / 2);
			const rightPart = Math.floor(x / 10 ** Math.ceil(length / 2));
			if (leftPart !== rightPart) continue;
			result += x;
		}
	}
	return result;
};
export const p2ex = () => p2(_example);
export const p2 = async (input = _input) => {
	let result = 0;
	for (const [start, end] of input) {
		for (let x = start; x <= end; x++) {
			const length = Math.floor(Math.log10(x)) + 1;
			for (let split = 1; split < length; split++) {
				if (length % split !== 0) continue;
				const parts: number[] = [];
				for (let pos = 0; pos < length; pos += split) {
					const part = Math.floor((x % 10 ** (pos + split)) / 10 ** pos);
					parts.push(part);
				}
				const firstPart = parts[0];
				if (firstPart == null) throw new Error("unreachable");
				if (!parts.every((p) => p === firstPart)) continue;
				result += x;
				break;
			}
		}
	}
	return result;
};

import { cc, ptr } from "bun:ffi";
// @ts-expect-error
import source from "./c/aoc_2025_02.c" with { type: "file" };

const lib = cc({
	source,
	symbols: {
		p1: {
			args: ["ptr", "int"],
			returns: "i64",
		},
		p2: {
			args: ["ptr", "int"],
			returns: "i64",
		},
	},
});

const parseToBuffer = (input = _input) => {
	const bigints = new BigInt64Array(input.flat().map(BigInt));
	return { ptr: ptr(bigints), count: input.length };
};

export const p1_c = ({ ptr, count } = parseToBuffer()) =>
	Number(lib.symbols.p1(ptr, count));

export const p2_c = ({ ptr, count } = parseToBuffer()) =>
	Number(lib.symbols.p2(ptr, count));
