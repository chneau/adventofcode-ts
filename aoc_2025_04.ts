import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.string()
		.transform((x) => x.split("\n"))
		.parseAsync(input);
const _input = await fetchInput().then(parse);
const _example = await parse(`..@@.@@@@.
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
	const rows = input.length;
	const cols = input[0]?.length ?? 0;
	if (rows === 0 || cols === 0) return 0;

	// Padded grid dimensions
	const stride = cols + 2;
	const paddedSize = (rows + 2) * stride;

	// 1 = '@', 0 = '.' or boundary
	const grid = new Uint8Array(paddedSize);
	const counts = new Int8Array(paddedSize);
	const queued = new Uint8Array(paddedSize);
	const q = new Int32Array(paddedSize);
	let qHead = 0;
	let qTail = 0;

	// Offsets for 8 neighbors
	const offsets = [
		-stride - 1,
		-stride,
		-stride + 1,
		-1,
		1,
		stride - 1,
		stride,
		stride + 1,
	];

	// Initialize grid
	for (let r = 0; r < rows; r++) {
		const line = input[r];
		if (!line) continue;
		const rowOffset = (r + 1) * stride;
		for (let c = 0; c < cols; c++) {
			if (line[c] === "@") {
				grid[rowOffset + c + 1] = 1;
			}
		}
	}

	// Calculate initial counts and populate queue
	for (let r = 0; r < rows; r++) {
		const rowOffset = (r + 1) * stride;
		for (let c = 0; c < cols; c++) {
			const idx = rowOffset + c + 1;
			if (grid[idx] === 0) continue;

			let count = 0;
			// Manual unroll for performance? V8 handles loop well enough here.
			for (let i = 0; i < 8; i++) {
				if (grid[idx + (offsets[i] as number)] === 1) {
					count++;
				}
			}
			counts[idx] = count;

			if (count < 4) {
				queued[idx] = 1;
				q[qTail++] = idx;
			}
		}
	}

	let result = 0;
	while (qHead < qTail) {
		const idx = q[qHead++] as number;
		result++;

		// "Remove" the cell
		grid[idx] = 0;

		// Update neighbors
		for (let i = 0; i < 8; i++) {
			const nIdx = idx + (offsets[i] as number);
			if (grid[nIdx] === 1) {
				const newCount = (counts[nIdx] as number) - 1;
				counts[nIdx] = newCount;
				if (newCount < 4 && queued[nIdx] === 0) {
					queued[nIdx] = 1;
					q[qTail++] = nIdx;
				}
			}
		}
	}

	return result;
};
