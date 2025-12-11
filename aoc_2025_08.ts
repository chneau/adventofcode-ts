import z from "zod";
import { fetchInput } from "./session";

type Point = { x: number; y: number; z: number };
const parse = async (input: string) =>
	z
		.array(z.string())
		.transform((lines) =>
			lines.map((line) => {
				const [x, y, z] = line.split(",").map(Number);
				return { x, y, z } as Point;
			}),
		)
		.parseAsync(input.split("\n"));

const _rawInput = await fetchInput();
const _rawExample = `162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689`;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
class DSU {
	parent: Int32Array;
	size: Int32Array;
	count: number;

	constructor(n: number) {
		this.parent = new Int32Array(n);
		for (let i = 0; i < n; i++) this.parent[i] = i;
		this.size = new Int32Array(n).fill(1);
		this.count = n;
	}

	find(i: number): number {
		let root = i;
		while (root !== this.parent[root]) {
			root = this.parent[root] as number;
		}
		let curr = i;
		while (curr !== root) {
			const next = this.parent[curr] as number;
			this.parent[curr] = root;
			curr = next;
		}
		return root;
	}

	union(i: number, j: number): boolean {
		const rootI = this.find(i);
		const rootJ = this.find(j);

		if (rootI !== rootJ) {
			if ((this.size[rootI] as number) < (this.size[rootJ] as number)) {
				this.parent[rootI] = rootJ;
				(this.size[rootJ] as number) += this.size[rootI] as number;
			} else {
				this.parent[rootJ] = rootI;
				(this.size[rootI] as number) += this.size[rootJ] as number;
			}
			this.count--;
			return true;
		}
		return false;
	}
}

export const p1ex = () => p1(_example, 10);
export const p1 = (input = _input, numConnections: number = 1000) => {
	const n = input.length;
	const xs = new Int32Array(n);
	const ys = new Int32Array(n);
	const zs = new Int32Array(n);
	for (let i = 0; i < n; i++) {
		const p = input[i] as Point;
		xs[i] = p.x;
		ys[i] = p.y;
		zs[i] = p.z;
	}

	const dsu = new DSU(n);

	const bufferSize = numConnections * 4;
	const edgeU = new Int32Array(bufferSize);
	const edgeV = new Int32Array(bufferSize);
	const edgeDist = new Int32Array(bufferSize);
	let edgeCount = 0;
	let maxDistInSet = 2147483647; // Max Int32

	// Temporary array for sorting indices
	const indices = new Int32Array(bufferSize);

	for (let i = 0; i < n; i++) {
		const xi = xs[i] as number;
		const yi = ys[i] as number;
		const zi = zs[i] as number;
		for (let j = i + 1; j < n; j++) {
			const dx = xi - (xs[j] as number);
			const dy = yi - (ys[j] as number);
			const dz = zi - (zs[j] as number);
			const distanceSq = dx * dx + dy * dy + dz * dz;

			if (distanceSq < maxDistInSet) {
				edgeU[edgeCount] = i;
				edgeV[edgeCount] = j;
				edgeDist[edgeCount] = distanceSq;
				edgeCount++;

				if (edgeCount >= bufferSize) {
					// Compact and sort
					for (let k = 0; k < edgeCount; k++) indices[k] = k;
					indices.subarray(0, edgeCount).sort((a, b) => {
						return (edgeDist[a] as number) - (edgeDist[b] as number);
					});

					// Keep top numConnections
					// We need to re-arrange arrays.
					// Since buffer is small, we can create new temp arrays or swap.
					// Easiest is to rewrite to start.
					// But we can't overwrite in place trivially without extra memory or careful swapping.
					// Given bufferSize is small (4000), copy is cheap.
					// Actually, we can just "compact" by picking logic.

					// To avoid allocation, we can do this:
					// We only need to preserve the first `numConnections` elements *after sort*.
					// But we have parallel arrays.
					// Let's just create a small temp buffer for the "kept" part?
					// No, let's just use the `indices` to permute.
					// But we can't permute in-place easily.
					// Let's use a secondary buffer?
					// Or just simpler:
					// We have `indices` sorted.
					// We construct the new state in the first `numConnections` slots.
					// But we might overwrite data we need.
					// So we copy to a temp array then copy back? Or just specific items.

					// OPTIMIZATION: Just use the `indices` to pull data.
					// Since we are iterating strictly, we can move items.
					// But `indices[0]` might be `0` (safe) or `edgeCount-1` (move from end to start).
					// If we process `k` from 0 to `numConnections-1`:
					// `edgeU[k] = edgeU[indices[k]]` -> If `indices[k] > k`, this is fine.
					// If `indices[k] < k`, we might have already overwritten `edgeU[indices[k]]`.
					// So we need to copy out.
					// Given bufferSize=4000, let's just allocate temp arrays for the swap. It's tiny.
					const kept = numConnections;
					const tempU = new Int32Array(kept);
					const tempV = new Int32Array(kept);
					const tempDist = new Int32Array(kept);
					for (let k = 0; k < kept; k++) {
						const idx = indices[k] as number;
						tempU[k] = edgeU[idx] as number;
						tempV[k] = edgeV[idx] as number;
						tempDist[k] = edgeDist[idx] as number;
					}
					edgeU.set(tempU);
					edgeV.set(tempV);
					edgeDist.set(tempDist);
					edgeCount = kept;
					maxDistInSet = edgeDist[kept - 1] as number;
				}
			}
		}
	}

	// Final sort of what remains
	for (let k = 0; k < edgeCount; k++) indices[k] = k;
	indices
		.subarray(0, edgeCount)
		.sort((a, b) => (edgeDist[a] as number) - (edgeDist[b] as number));

	const limit = Math.min(edgeCount, numConnections);
	for (let k = 0; k < limit; k++) {
		const idx = indices[k] as number;
		dsu.union(edgeU[idx] as number, edgeV[idx] as number);
	}

	const componentSizes = new Int32Array(n);
	let cCount = 0;
	for (let i = 0; i < n; i++) {
		if (dsu.parent[i] === i) {
			componentSizes[cCount++] = dsu.size[i] as number;
		}
	}
	// Sort component sizes descending
	componentSizes.subarray(0, cCount).sort((a, b) => b - a);

	let result = 1;
	const top = Math.min(3, cCount);
	for (let i = 0; i < top; i++) {
		result *= componentSizes[i] as number;
	}

	return result;
};

export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	const n = input.length;
	const xs = new Int32Array(n);
	const ys = new Int32Array(n);
	const zs = new Int32Array(n);
	for (let i = 0; i < n; i++) {
		const p = input[i] as Point;
		xs[i] = p.x;
		ys[i] = p.y;
		zs[i] = p.z;
	}

	const minDist = new Float64Array(n).fill(Infinity);
	const parent = new Int32Array(n).fill(-1);
	const visited = new Uint8Array(n);
	minDist[0] = 0;

	let maxEdgeWeight = -1;
	let uMax = -1;
	let vMax = -1;

	// Optimization: Track min value in a loop?
	// With N ~ 1000-5000, plain search is ok.
	// But `xs` access is faster.

	for (let i = 0; i < n; i++) {
		let u = -1;
		let minVal = Infinity;

		// Finding min unvisited
		// This loop is O(N)
		for (let j = 0; j < n; j++) {
			if (visited[j] === 0) {
				const d = minDist[j] as number;
				if (d < minVal) {
					minVal = d;
					u = j;
				}
			}
		}

		if (u === -1) break;
		visited[u] = 1;

		if (parent[u] !== -1) {
			if (minVal > maxEdgeWeight) {
				maxEdgeWeight = minVal;
				uMax = u;
				vMax = parent[u] as number;
			}
		}

		const xu = xs[u] as number;
		const yu = ys[u] as number;
		const zu = zs[u] as number;

		// Update neighbors
		for (let v = 0; v < n; v++) {
			if (visited[v] === 0) {
				const dx = xu - (xs[v] as number);
				const dy = yu - (ys[v] as number);
				const dz = zu - (zs[v] as number);
				const distSq = dx * dx + dy * dy + dz * dz;
				if (distSq < (minDist[v] as number)) {
					minDist[v] = distSq;
					parent[v] = u;
				}
			}
		}
	}

	// uMax and vMax are indices.
	// Return pA.x * pB.x
	return (xs[uMax] as number) * (xs[vMax] as number);
};
