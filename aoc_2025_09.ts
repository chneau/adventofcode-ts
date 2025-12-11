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
	const n = input.length;
	const xs = new Int32Array(n);
	const ys = new Int32Array(n);
	const xSet = new Set<number>();
	const ySet = new Set<number>();

	for (let i = 0; i < n; i++) {
		const p = input[i] as { x: number; y: number };
		xs[i] = p.x;
		ys[i] = p.y;
		xSet.add(p.x);
		ySet.add(p.y);
	}

	const sortedX = new Int32Array(Array.from(xSet).sort((a, b) => a - b));
	const sortedY = new Int32Array(Array.from(ySet).sort((a, b) => a - b));

	// Pre-compute ranks
	const xRanks = new Int32Array(n);
	const yRanks = new Int32Array(n);

	// Map lookup is fast enough for setup, or use binary search.
	// Map is O(1) avg, Binary Search is O(log M). M is unique coords.
	// Given M <= N, Map is fine.
	const xMap = new Map<number, number>();
	for (const [i, x] of sortedX.entries()) {
		xMap.set(x, i);
	}
	const yMap = new Map<number, number>();
	for (const [i, y] of sortedY.entries()) {
		yMap.set(y, i);
	}

	for (let i = 0; i < n; i++) {
		xRanks[i] = xMap.get(xs[i] as number) as number;
		yRanks[i] = yMap.get(ys[i] as number) as number;
	}

	const W = sortedX.length * 2 - 1;
	const H = sortedY.length * 2 - 1;
	const grid = new Int8Array(W * H);

	// Store segments efficiently
	// vSegments: x, y1, y2 (ranks)
	// hSegments: y, x1, x2 (ranks)
	// We don't know the count exactly, roughly N/2 each.
	// Just use dynamic arrays or pre-allocate N size.
	const vSegX = new Int32Array(n);
	const vSegY1 = new Int32Array(n);
	const vSegY2 = new Int32Array(n);
	let vCount = 0;

	const hSegY = new Int32Array(n);
	const hSegX1 = new Int32Array(n);
	const hSegX2 = new Int32Array(n);
	let hCount = 0;

	for (let i = 0; i < n; i++) {
		const next = (i + 1) % n;
		const x1 = xs[i] as number;
		const x2 = xs[next] as number;

		const xr1 = xRanks[i] as number;
		const yr1 = yRanks[i] as number;
		const xr2 = xRanks[next] as number;
		const yr2 = yRanks[next] as number;

		if (x1 === x2) {
			vSegX[vCount] = xr1;
			vSegY1[vCount] = Math.min(yr1, yr2);
			vSegY2[vCount] = Math.max(yr1, yr2);
			vCount++;
		} else {
			hSegY[hCount] = yr1;
			hSegX1[hCount] = Math.min(xr1, xr2);
			hSegX2[hCount] = Math.max(xr1, xr2);
			hCount++;
		}
	}

	// 1. Mark Horizontal segments
	for (let i = 0; i < hCount; i++) {
		const r = (hSegY[i] as number) * 2;
		const c1 = (hSegX1[i] as number) * 2;
		const c2 = (hSegX2[i] as number) * 2;
		// setGrid(r, c, 1)
		const rowOffset = r * W;
		grid.fill(1, rowOffset + c1, rowOffset + c2 + 1);
	}

	// 2. Interval Rows (Odd rows)
	// Optimize: The walls array.
	const walls = new Int32Array(vCount); // Reuse buffer
	for (let r = 1; r < H; r += 2) {
		const yStartIdx = (r - 1) >>> 1;
		const yEndIdx = (r + 1) >>> 1;

		let wCount = 0;
		for (let i = 0; i < vCount; i++) {
			if (
				(vSegY1[i] as number) <= yStartIdx &&
				(vSegY2[i] as number) >= yEndIdx
			) {
				walls[wCount++] = (vSegX[i] as number) * 2;
			}
		}

		walls.subarray(0, wCount).sort();

		const rowOffset = r * W;
		for (let k = 0; k < wCount; k += 2) {
			const start = walls[k] as number;
			const end = walls[k + 1] as number; // Should exist if parity holds
			grid.fill(1, rowOffset + start, rowOffset + end + 1);
		}
	}

	// 3. Update Vertex Rows (Even rows)
	for (let r = 0; r < H; r += 2) {
		const rowOffset = r * W;
		const prevRowOffset = (r - 1) * W;
		const nextRowOffset = (r + 1) * W;
		for (let c = 0; c < W; c++) {
			let val = grid[rowOffset + c] as number;
			if (val === 0) {
				if (r > 0 && (grid[prevRowOffset + c] as number) !== 0) val = 1;
				else if (r < H - 1 && (grid[nextRowOffset + c] as number) !== 0) {
					val = 1;
				}
				if (val !== 0) grid[rowOffset + c] = 1;
			}
		}
	}

	// Build 2D Prefix Sum
	const prefixSum = new Int32Array(W * H);
	// Unroll the loop slightly or just standard iteration
	// First cell
	prefixSum[0] = grid[0] as number;

	// First row
	for (let c = 1; c < W; c++) {
		prefixSum[c] = (prefixSum[c - 1] as number) + (grid[c] as number);
	}
	// First col
	for (let r = 1; r < H; r++) {
		prefixSum[r * W] =
			(prefixSum[(r - 1) * W] as number) + (grid[r * W] as number);
	}
	// Rest
	for (let r = 1; r < H; r++) {
		const rowOff = r * W;
		const prevRowOff = (r - 1) * W;
		for (let c = 1; c < W; c++) {
			const val = grid[rowOff + c] as number;
			const top = prefixSum[prevRowOff + c] as number;
			const left = prefixSum[rowOff + c - 1] as number;
			const diag = prefixSum[prevRowOff + c - 1] as number;
			prefixSum[rowOff + c] = val + top + left - diag;
		}
	}

	// Helper inline manually
	// getSum(r, c) => if r<0|c<0 0 else prefixSum[...]
	let maxArea = 0;

	for (let i = 0; i < n; i++) {
		const t1x = xs[i] as number;
		const t1y = ys[i] as number;
		const r1 = (yRanks[i] as number) * 2;
		const c1 = (xRanks[i] as number) * 2;

		for (let j = i + 1; j < n; j++) {
			const t2x = xs[j] as number;
			const t2y = ys[j] as number;

			if (t1x === t2x || t1y === t2y) continue;

			const r2 = (yRanks[j] as number) * 2;
			const c2 = (xRanks[j] as number) * 2;

			// Expected count
			const hGrid = Math.abs(r1 - r2) + 1;
			const wGrid = Math.abs(c1 - c2) + 1;
			const expectedCount = hGrid * wGrid;

			// AreaSum
			const rMin = r1 < r2 ? r1 : r2;
			const rMax = r1 > r2 ? r1 : r2;
			const cMin = c1 < c2 ? c1 : c2;
			const cMax = c1 > c2 ? c1 : c2;

			// getSum(rMax, cMax)
			const s1 = prefixSum[rMax * W + cMax] as number;
			// getSum(rMin - 1, cMax)
			const s2 =
				rMin - 1 < 0 ? 0 : (prefixSum[(rMin - 1) * W + cMax] as number);
			// getSum(rMax, cMin - 1)
			const s3 = cMin - 1 < 0 ? 0 : (prefixSum[rMax * W + cMin - 1] as number);
			// getSum(rMin - 1, cMin - 1)
			const s4 =
				rMin - 1 < 0 || cMin - 1 < 0
					? 0
					: (prefixSum[(rMin - 1) * W + cMin - 1] as number);

			const actualCount = s1 - s2 - s3 + s4;

			if (actualCount === expectedCount) {
				const area = (Math.abs(t1x - t2x) + 1) * (Math.abs(t1y - t2y) + 1);
				if (area > maxArea) maxArea = area;
			}
		}
	}

	return maxArea;
};
