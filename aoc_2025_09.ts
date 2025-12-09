import z from "zod";
import { fetchInput } from "./session";

const parse = async (input: string) => {
	return z
		.array(
			z.object({
				x: z.coerce.number(),
				y: z.coerce.number(),
			}),
		)
		.parseAsync(
			input
				.split("\n")
				.filter(Boolean)
				.map((line) => {
					const [x, y] = line.split(",").map(Number);
					return { x, y };
				}),
		);
};
const _rawInput = await fetchInput();
const _rawExample = `7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let maxArea = 0;

	for (let i = 0; i < input.length; i++) {
		for (let j = i + 1; j < input.length; j++) {
			const tile1 = input[i] as { x: number; y: number };
			const tile2 = input[j] as { x: number; y: number };

			// If x coordinates or y coordinates are the same, they can't form a non-degenerate rectangle
			if (tile1.x === tile2.x || tile1.y === tile2.y) {
				continue;
			}

			const width = Math.abs(tile1.x - tile2.x) + 1;
			const height = Math.abs(tile1.y - tile2.y) + 1;
			const area = width * height;
			if (area > maxArea) {
				maxArea = area;
			}
		}
	}
	return maxArea;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	result += input.length;
	return result;
};
