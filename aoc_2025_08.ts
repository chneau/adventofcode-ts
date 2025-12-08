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
	parent: number[];
	size: number[];
	count: number;

	constructor(n: number) {
		this.parent = Array.from({ length: n }, (_, i) => i);
		this.size = Array(n).fill(1);
		this.count = n;
	}

	find(i: number): number {
		if (this.parent[i] === i) {
			return i;
		}
		this.parent[i] = this.find(this.parent[i] as number);
		return this.parent[i];
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
	const dsu = new DSU(n);

	// Optimization: Only keep the smallest `numConnections` edges.
	// We use a buffer and periodically sort/prune to keep memory low and avoid sorting N^2 items.
	const edges: { u: number; v: number; distanceSq: number }[] = [];
	const bufferSize = numConnections * 4;
	let maxDistInSet = Infinity;

	for (let i = 0; i < n; i++) {
		const p1 = input[i] as Point;
		for (let j = i + 1; j < n; j++) {
			const p2 = input[j] as Point;
			const dx = p1.x - p2.x;
			const dy = p1.y - p2.y;
			const dz = p1.z - p2.z;
			const distanceSq = dx * dx + dy * dy + dz * dz;

			if (distanceSq < maxDistInSet) {
				edges.push({ u: i, v: j, distanceSq });
				if (edges.length >= bufferSize) {
					edges.sort((a, b) => a.distanceSq - b.distanceSq);
					edges.length = numConnections;
					maxDistInSet = (edges[numConnections - 1] as { distanceSq: number })
						.distanceSq;
				}
			}
		}
	}

	edges.sort((a, b) => a.distanceSq - b.distanceSq);
	if (edges.length > numConnections) {
		edges.length = numConnections;
	}

	for (const edge of edges) {
		dsu.union(edge.u, edge.v);
	}

	const componentSizes: number[] = [];
	for (let i = 0; i < n; i++) {
		if (dsu.parent[i] === i) {
			componentSizes.push(dsu.size[i] as number);
		}
	}

	componentSizes.sort((a, b) => b - a);

	let result = 1;
	for (let i = 0; i < Math.min(3, componentSizes.length); i++) {
		result *= componentSizes[i] as number;
	}

	return result;
};

export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	const n = input.length;
	// Prim's Algorithm to build MST O(N^2)
	const minDist = new Float64Array(n).fill(Infinity);
	const parent = new Int32Array(n).fill(-1);
	const visited = new Uint8Array(n); // 0 or 1
	minDist[0] = 0;

	let maxEdgeWeight = -1;
	let uMax = -1;
	let vMax = -1;

	for (let i = 0; i < n; i++) {
		let u = -1;
		let minVal = Infinity;
		// Find min unvisited node
		for (let j = 0; j < n; j++) {
			if (visited[j] === 0 && (minDist[j] as number) < minVal) {
				minVal = minDist[j] as number;
				u = j;
			}
		}

		if (u === -1) break; // Should not happen for connected graph
		visited[u] = 1;

		// If not root, consider the edge used to reach u
		if (parent[u] !== -1) {
			const dist = minDist[u] as number;
			if (dist > maxEdgeWeight) {
				maxEdgeWeight = dist;
				uMax = u;
				vMax = parent[u] as number;
			}
		}

		const p1 = input[u] as Point;
		for (let v = 0; v < n; v++) {
			if (visited[v] === 0) {
				const p2 = input[v] as Point;
				const dx = p1.x - p2.x;
				const dy = p1.y - p2.y;
				const dz = p1.z - p2.z;
				const distSq = dx * dx + dy * dy + dz * dz;
				if (distSq < (minDist[v] as number)) {
					minDist[v] = distSq;
					parent[v] = u;
				}
			}
		}
	}

	const pA = input[uMax] as Point;
	const pB = input[vMax] as Point;
	return pA.x * pB.x;
};
