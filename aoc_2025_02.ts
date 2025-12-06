import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.array(z.tuple([z.number(), z.number()]))
		.parseAsync(input.split(",").map((x) => x.split("-").map(Number)));
const _input = await fetchInput().then(parse);
const _example = await parse(
	`11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
	1698522-1698528,446443-446449,38593856-38593862,565653-565659,
	824824821-824824827,2121212118-2121212124
	`,
);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let result = 0;
	for (const [start, end] of input) {
		if (end < 10) continue;
		const maxLen = Math.floor(Math.log10(end)) + 1;
		const maxHalf = Math.floor(maxLen / 2);
		for (let half = 1; half <= maxHalf; half++) {
			const pow = 10 ** half;
			const scale = pow + 1;
			const minFirst = 10 ** (half - 1);
			const maxFirst = pow - 1;
			const low = Math.max(minFirst, Math.ceil(start / scale));
			const high = Math.min(maxFirst, Math.floor(end / scale));
			for (let first = low; first <= high; first++) {
				result += first * scale;
			}
		}
	}
	return result;
};
export const p2ex = () => p2(_example);
export const p2 = async (input = _input) => {
	let result = 0;
	for (const [start, end] of input) {
		const seen = new Set<number>();
		if (end < 10) continue;
		const maxLen = Math.floor(Math.log10(end)) + 1;
		for (let L = 1; L <= Math.floor(maxLen / 2); L++) {
			const powL = 10 ** L;
			const kMax = Math.floor(maxLen / L);
			for (let k = 2; k <= kMax; k++) {
				const totalLen = L * k;
				const powTotal = 10 ** totalLen;
				const scale = (powTotal - 1) / (powL - 1);
				const minFirst = 10 ** (L - 1);
				const maxFirst = powL - 1;
				const low = Math.max(minFirst, Math.ceil(start / scale));
				const high = Math.min(maxFirst, Math.floor(end / scale));
				for (let first = low; first <= high; first++) {
					const num = first * scale;
					if (num >= start && num <= end) seen.add(num);
				}
			}
		}
		for (const v of seen) result += v;
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
