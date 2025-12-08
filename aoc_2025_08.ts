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

const getSortedEdges = (input: Point[]) => {
	const n = input.length;
	const edges: { u: number; v: number; distanceSq: number }[] = [];

	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			const p1 = input[i] as Point;
			const p2 = input[j] as Point;
			const dx = p1.x - p2.x;
			const dy = p1.y - p2.y;
			const dz = p1.z - p2.z;
			const distanceSq = dx * dx + dy * dy + dz * dz;
			edges.push({ u: i, v: j, distanceSq });
		}
	}

	edges.sort((a, b) => a.distanceSq - b.distanceSq);
	return edges;
};

export const p1ex = () => p1(_example, 10);
export const p1 = (input = _input, numConnections: number = 1000) => {
	const n = input.length;
	const dsu = new DSU(n);

	const edges = getSortedEdges(input);

	for (let i = 0; i < numConnections && i < edges.length; i++) {
		const edge = edges[i] as { u: number; v: number; distanceSq: number };
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
	const dsu = new DSU(n);
	const edges = getSortedEdges(input);

	for (const edge of edges) {
		if (dsu.union(edge.u, edge.v)) {
			if (dsu.count === 1) {
				const p1 = input[edge.u] as Point;
				const p2 = input[edge.v] as Point;
				return p1.x * p2.x;
			}
		}
	}
	return 0;
};
