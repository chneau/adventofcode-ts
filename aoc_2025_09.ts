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
	// Collect vertices and unique coordinates
	const xSet = new Set<number>();
	const ySet = new Set<number>();
	for (const p of input) {
		xSet.add(p.x);
		ySet.add(p.y);
	}
	const sortedX = Array.from(xSet).sort((a, b) => a - b);
	const sortedY = Array.from(ySet).sort((a, b) => a - b);

	const xMap = new Map<number, number>();
	sortedX.forEach((x, i) => {
		xMap.set(x, i);
	});

	const yMap = new Map<number, number>();
	sortedY.forEach((y, i) => {
		yMap.set(y, i);
	});

	const getIdx = (map: Map<number, number>, val: number) => {
		const res = map.get(val);
		if (res === undefined) throw new Error(`Value ${val} not found in map`);
		return res;
	};

	const W = sortedX.length * 2 - 1;
	const H = sortedY.length * 2 - 1;

	// Grid: 0 = invalid, 1 = valid
	const grid = new Int8Array(W * H);
	const setGrid = (r: number, c: number, val: number) => {
		grid[r * W + c] = val;
	};
	const getGrid = (r: number, c: number) => grid[r * W + c] ?? 0;

	const vSegments: { x: number; y1: number; y2: number }[] = [];
	const hSegments: { y: number; x1: number; x2: number }[] = [];

	for (let i = 0; i < input.length; i++) {
		const p1 = input[i] as { x: number; y: number };
		const p2 = input[(i + 1) % input.length] as { x: number; y: number };

		if (p1.x === p2.x) {
			vSegments.push({
				x: p1.x,
				y1: Math.min(p1.y, p2.y),
				y2: Math.max(p1.y, p2.y),
			});
		} else {
			hSegments.push({
				y: p1.y,
				x1: Math.min(p1.x, p2.x),
				x2: Math.max(p1.x, p2.x),
			});
		}
	}

	// 1. Mark Horizontal segments on Vertex Rows (Even rows)
	for (const h of hSegments) {
		const r = getIdx(yMap, h.y) * 2;
		const c1 = getIdx(xMap, h.x1) * 2;
		const c2 = getIdx(xMap, h.x2) * 2;
		for (let c = c1; c <= c2; c++) {
			setGrid(r, c, 1);
		}
	}

	// 2. Process Interval Rows (Odd rows) using Scan-line Parity
	for (let r = 1; r < H; r += 2) {
		const yStartIdx = (r - 1) / 2;
		const yEndIdx = (r + 1) / 2;

		const walls: number[] = [];
		for (const v of vSegments) {
			const vy1 = getIdx(yMap, v.y1);
			const vy2 = getIdx(yMap, v.y2);
			// Check if vertical segment covers this interval
			if (vy1 <= yStartIdx && vy2 >= yEndIdx) {
				walls.push(getIdx(xMap, v.x) * 2);
			}
		}
		walls.sort((a, b) => a - b);

		for (let k = 0; k < walls.length; k += 2) {
			if (k + 1 >= walls.length) break;
			const start = walls[k] as number;
			const end = walls[k + 1] as number;
			for (let c = start; c <= end; c++) {
				setGrid(r, c, 1);
			}
		}
	}

	// 3. Update Vertex Rows (Even rows) by Union with neighbors
	for (let r = 0; r < H; r += 2) {
		for (let c = 0; c < W; c++) {
			let val = getGrid(r, c);
			if (r > 0) val |= getGrid(r - 1, c);
			if (r < H - 1) val |= getGrid(r + 1, c);
			if (val) setGrid(r, c, 1);
		}
	}

	// Build 2D Prefix Sum
	const prefixSum = new Int32Array(W * H);
	const getSum = (r: number, c: number) => {
		if (r < 0 || c < 0) return 0;
		return prefixSum[r * W + c] ?? 0;
	};

	for (let r = 0; r < H; r++) {
		for (let c = 0; c < W; c++) {
			const val = getGrid(r, c);
			const top = getSum(r - 1, c);
			const left = getSum(r, c - 1);
			const diag = getSum(r - 1, c - 1);
			prefixSum[r * W + c] = val + top + left - diag;
		}
	}

	const areaSum = (r1: number, c1: number, r2: number, c2: number) => {
		const rMin = Math.min(r1, r2);
		const rMax = Math.max(r1, r2);
		const cMin = Math.min(c1, c2);
		const cMax = Math.max(c1, c2);

		return (
			getSum(rMax, cMax) -
			getSum(rMin - 1, cMax) -
			getSum(rMax, cMin - 1) +
			getSum(rMin - 1, cMin - 1)
		);
	};

	let maxArea = 0;

	// Iterate pairs
	for (let i = 0; i < input.length; i++) {
		for (let j = i + 1; j < input.length; j++) {
			const t1 = input[i] as { x: number; y: number };
			const t2 = input[j] as { x: number; y: number };

			if (t1.x === t2.x || t1.y === t2.y) continue;

			const c1 = getIdx(xMap, t1.x) * 2;
			const r1 = getIdx(yMap, t1.y) * 2;
			const c2 = getIdx(xMap, t2.x) * 2;
			const r2 = getIdx(yMap, t2.y) * 2;

			const expectedCount = (Math.abs(r1 - r2) + 1) * (Math.abs(c1 - c2) + 1);
			const actualCount = areaSum(r1, c1, r2, c2);

			if (actualCount === expectedCount) {
				const area = (Math.abs(t1.x - t2.x) + 1) * (Math.abs(t1.y - t2.y) + 1);
				if (area > maxArea) maxArea = area;
			}
		}
	}

	return maxArea;
};
