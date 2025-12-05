import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.string()
		.transform((x) => x.split("\n"))
		.parse(input);
const _input = await fetchInput().then(parse);
const _example = parse(`..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let result = 0;
	let __r = 0;
	for (const line of input) {
		const row = __r++;
		for (let col = 0; col < line.length; col++) {
			if (line[col] !== "@") continue;
			let adjacent = 0;
			for (let dr = -1; dr <= 1; dr++) {
				for (let dc = -1; dc <= 1; dc++) {
					if (dr === 0 && dc === 0) continue;
					const rr = row + dr;
					const cc = col + dc;
					const otherLine = input[rr];
					if (!otherLine) continue;
					if (otherLine[cc] === "@") {
						adjacent++;
						if (adjacent >= 4) break;
					}
				}
				if (adjacent >= 4) break;
			}
			if (adjacent < 4) result++;
		}
	}
	return result;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	const grid = input.map((r) => r.split(""));
	const rows = grid.length;
	const cols = grid[0]?.length ?? 0;

	while (true) {
		const toRemove: [number, number][] = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if ((grid[r] as string[])[c] !== "@") continue;
				let adjacent = 0;
				for (let dr = -1; dr <= 1; dr++) {
					for (let dc = -1; dc <= 1; dc++) {
						if (dr === 0 && dc === 0) continue;
						const rr = r + dr;
						const cc = c + dc;
						if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
						if ((grid[rr] as string[])[cc] === "@") {
							adjacent++;
							if (adjacent >= 4) break;
						}
					}
					if (adjacent >= 4) break;
				}
				if (adjacent < 4) toRemove.push([r, c]);
			}
		}
		if (toRemove.length === 0) break;
		for (const [r, c] of toRemove) {
			(grid[r] as string[])[c] = ".";
			result++;
		}
	}
	return result;
};
