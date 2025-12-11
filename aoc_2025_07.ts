import { fetchInput } from "./session";

const parse = async (input: string) => {
	const lines = input.trim().split("\n");
	if (lines.length === 0) {
		return {
			grid: new Uint8Array(0),
			width: 0,
			height: 0,
			startR: -1,
			startC: -1,
		};
	}
	const width = lines[0]?.length ?? 0;
	const height = lines.length;
	const grid = new Uint8Array(width * height);
	let startR = -1;
	let startC = -1;

	for (let r = 0; r < height; r++) {
		const line = lines[r];
		if (!line) continue;
		const offset = r * width;
		for (let c = 0; c < width; c++) {
			const char = line.charCodeAt(c);
			// ^ is 94
			if (char === 94) {
				grid[offset + c] = 1;
			} else if (char === 83) {
				// S is 83
				startR = r;
				startC = c;
			}
		}
	}
	return { grid, width, height, startR, startC };
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
	const { grid, width, height, startR, startC } = input;
	let active = new Uint8Array(width);
	let nextActive = new Uint8Array(width);
	if (startC !== -1) active[startC] = 1;
	let splits = 0;

	for (let r = startR + 1; r < height; r++) {
		const offset = r * width;
		nextActive.fill(0);
		for (let c = 0; c < width; c++) {
			if (active[c] === 0) continue;

			// Check grid cell
			if (grid[offset + c] === 1) {
				// ^
				splits++;
				// TypedArray ignores out-of-bounds writes
				nextActive[c - 1] = 1;
				nextActive[c + 1] = 1;
			} else {
				nextActive[c] = 1;
			}
		}
		const temp = active;
		active = nextActive;
		nextActive = temp;
	}

	return splits;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	const { grid, width, height, startR, startC } = input;
	let active = new Float64Array(width);
	let nextActive = new Float64Array(width);
	if (startC !== -1) active[startC] = 1;

	for (let r = startR + 1; r < height; r++) {
		const offset = r * width;
		nextActive.fill(0);
		for (let c = 0; c < width; c++) {
			const count = active[c] ?? 0;
			if (count === 0) continue;

			if (grid[offset + c] === 1) {
				// ^
				if (c > 0) {
					nextActive[c - 1] = (nextActive[c - 1] ?? 0) + count;
				}
				if (c < width - 1) {
					nextActive[c + 1] = (nextActive[c + 1] ?? 0) + count;
				}
			} else {
				nextActive[c] = (nextActive[c] ?? 0) + count;
			}
		}
		const temp = active;
		active = nextActive;
		nextActive = temp;
	}

	let sum = 0;
	for (let c = 0; c < width; c++) {
		sum += active[c] ?? 0;
	}
	return sum;
};
