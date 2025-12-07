import { fetchInput } from "./session";

const parse = async (input: string) => {
	return input
		.trim()
		.split("\n")
		.map((line) => line.split(""));
};
const _rawInput = await fetchInput();
const _rawExample = `.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let splits = 0;
	let active = new Set<number>();
	let startR = -1;

	// Find S
	for (let r = 0; r < input.length; r++) {
		for (let c = 0; c < (input[r]?.length ?? 0); c++) {
			if (input[r]?.[c] === "S") {
				active.add(c);
				startR = r;
				break;
			}
		}
		if (startR !== -1) break;
	}

	for (let r = startR + 1; r < input.length; r++) {
		const nextActive = new Set<number>();
		for (const c of active) {
			if (c < 0 || c >= (input[r]?.length ?? 0)) continue;
			const cell = input[r]?.[c];
			if (cell === "^") {
				splits++;
				nextActive.add(c - 1);
				nextActive.add(c + 1);
			} else {
				nextActive.add(c);
			}
		}
		active = nextActive;
	}

	return splits;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	result += input.length;
	return result;
};
