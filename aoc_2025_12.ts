import { cc, ptr } from "bun:ffi";
import z from "zod";
// @ts-expect-error
import source from "./c/aoc_2025_12.c" with { type: "file" };
import { fetchInput } from "./session";

const lib = cc({
	source,
	symbols: {
		solve: {
			args: ["ptr", "ptr", "int", "int", "int", "int", "int", "int"],
			returns: "int",
		},
	},
});

const ShapeSchema = z.array(z.array(z.boolean())); // boolean[][]

const RegionSchema = z.object({
	width: z.number(),
	height: z.number(),
	presentCounts: z.array(z.number()),
});

const InputSchema = z.object({
	shapes: z.map(z.number(), ShapeSchema),
	regions: z.array(RegionSchema),
});

const parse = async (input: string) => {
	const lines = input.split("\n");
	let regionStartIndex = -1;
	for (let i = 0; i < lines.length; i++) {
		if (
			(lines[i] as string).includes("x") &&
			(lines[i] as string).includes(":")
		) {
			regionStartIndex = i;
			break;
		}
	}

	const rawShapes = lines.slice(0, regionStartIndex).join("\n");
	const rawRegions = lines.slice(regionStartIndex).join("\n").trim();

	const shapesMap = new Map<number, boolean[][]>();
	const shapeLines = rawShapes.split("\n").filter((line) => line.trim() !== "");

	let currentShapeIndex: number | null = null;
	let currentShapeData: string[] = [];

	for (const line of shapeLines) {
		const shapeHeaderMatch = line.match(/^(\d+):(.*)/);
		if (shapeHeaderMatch) {
			if (currentShapeIndex !== null) {
				shapesMap.set(
					currentShapeIndex,
					currentShapeData
						.filter((row) => row !== "")
						.map((row) => row.split("").map((char) => char === "#")),
				);
			}
			currentShapeIndex = parseInt(shapeHeaderMatch[1] as string, 10);
			currentShapeData = [(shapeHeaderMatch[2] as string).trim()];
		} else {
			currentShapeData.push(line.trim());
		}
	}
	if (currentShapeIndex !== null) {
		shapesMap.set(
			currentShapeIndex,
			currentShapeData
				.filter((row) => row !== "")
				.map((row) => row.split("").map((char) => char === "#")),
		);
	}

	const regions: z.infer<typeof RegionSchema>[] = rawRegions
		.split("\n")
		.filter((line) => line.trim() !== "")
		.map((line) => {
			const [dims, countsStr] = line.split(":").map((s) => s.trim()) as [
				string,
				string,
			];
			const [width, height] = dims.split("x").map(Number) as [number, number];
			const presentCounts = countsStr.split(" ").map(Number);
			return { width, height, presentCounts };
		});

	return InputSchema.parseAsync({
		shapes: shapesMap,
		regions: regions,
	});
};

type Shape = boolean[][];

const rotate = (shape: Shape): Shape => {
	const rows = shape.length;
	const cols = (shape[0] as boolean[]).length;
	const newShape: Shape = Array.from({ length: cols }, () =>
		Array(rows).fill(false),
	);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			(newShape[c] as boolean[])[rows - 1 - r] = (shape[r] as boolean[])[
				c
			] as boolean;
		}
	}
	return newShape;
};

const flip = (shape: Shape): Shape => {
	return shape.map((row) => [...row].reverse());
};

const normalizeShape = (shape: Shape): Shape => {
	let minR = shape.length,
		maxR = -1;
	let minC = (shape[0] as boolean[]).length,
		maxC = -1;

	for (let r = 0; r < shape.length; r++) {
		for (let c = 0; c < (shape[0] as boolean[]).length; c++) {
			if ((shape[r] as boolean[])[c]) {
				minR = Math.min(minR, r);
				maxR = Math.max(maxR, r);
				minC = Math.min(minC, c);
				maxC = Math.max(maxC, c);
			}
		}
	}

	if (minR > maxR) return [[]];

	const normalized: Shape = [];
	for (let r = minR; r <= maxR; r++) {
		const newRow: boolean[] = [];
		for (let c = minC; c <= maxC; c++) {
			newRow.push((shape[r] as boolean[])[c] as boolean);
		}
		normalized.push(newRow);
	}
	return normalized;
};

const shapeToString = (shape: Shape): string => {
	return shape
		.map((row) => row.map((b) => (b ? "#" : ".")).join(""))
		.join("\n");
};

const generateOrientations = (initialShape: Shape): Shape[] => {
	const orientations: Shape[] = [];
	const seen: Set<string> = new Set();
	let currentShape = normalizeShape(initialShape);

	for (let r = 0; r < 4; r++) {
		let stringified = shapeToString(currentShape);
		if (!seen.has(stringified)) {
			orientations.push(currentShape);
			seen.add(stringified);
		}
		const flippedShape = flip(currentShape);
		stringified = shapeToString(flippedShape);
		if (!seen.has(stringified)) {
			orientations.push(flippedShape);
			seen.add(stringified);
		}
		currentShape = rotate(currentShape);
	}
	return orientations;
};

const _rawInput = await fetchInput();
const _rawExample = `0:###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2`;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
export const p1ex = () => p1(_example);

// Optimized P1 using C FFI
export const p1 = (input = _input) => {
	let regionsThatFit = 0;

	// Cache orientations for each shape ID
	const orientationsCache = new Map<number, Shape[]>();
	const areaCache = new Map<number, number>();

	for (const [id, shape] of input.shapes.entries()) {
		orientationsCache.set(id, generateOrientations(shape));
		// Calculate area (number of #)
		let area = 0;
		for (const row of shape) {
			for (const cell of row) if (cell) area++;
		}
		areaCache.set(id, area);
	}

	for (const region of input.regions) {
		const { width, height, presentCounts } = region;
		const words = Math.ceil((width * height) / 64);

		// Pre-check: Total area
		let totalPresentArea = 0;
		for (let id = 0; id < presentCounts.length; id++) {
			totalPresentArea +=
				(presentCounts[id] as number) * (areaCache.get(id) ?? 0);
		}
		if (totalPresentArea > width * height) {
			continue;
		}

		// 1. Prepare Tasks
		const tasks: {
			id: number;
			count: number;
			moves: BigUint64Array[];
			area: number;
		}[] = [];
		let possible = true;

		for (let id = 0; id < presentCounts.length; id++) {
			const count = presentCounts[id];
			if (count === 0) continue;

			const orientations = orientationsCache.get(id);
			if (!orientations) {
				possible = false;
				break;
			}

			const moves: BigUint64Array[] = [];
			for (const shape of orientations) {
				const shapeH = shape.length;
				const shapeW = (shape[0] as boolean[]).length;

				for (let r = 0; r <= height - shapeH; r++) {
					for (let c = 0; c <= width - shapeW; c++) {
						const mask = new BigUint64Array(words);
						for (let sr = 0; sr < shapeH; sr++) {
							for (let sc = 0; sc < shapeW; sc++) {
								if ((shape[sr] as boolean[])[sc]) {
									const bitIndex = (r + sr) * width + (c + sc);
									const wordIdx = Math.floor(bitIndex / 64);
									const bitIdx = bitIndex % 64;
									(mask[wordIdx] as bigint) |= 1n << BigInt(bitIdx);
								}
							}
						}
						moves.push(mask);
					}
				}
			}

			if (moves.length === 0) {
				possible = false;
				break;
			}
			tasks.push({
				id,
				count: count as number,
				moves,
				area: areaCache.get(id) ?? 0,
			});
		}

		if (!possible) continue;
		if (tasks.length === 0) {
			regionsThatFit++;
			continue;
		}

		// 2. Sort Tasks: Area Desc, Moves Asc
		tasks.sort((a, b) => {
			if (b.area !== a.area) return b.area - a.area;
			return a.moves.length - b.moves.length;
		});

		// 3. Serialize for C
		const allMoves: bigint[] = [];
		const metadata: number[] = [];

		for (const task of tasks) {
			metadata.push(task.count);
			metadata.push(task.moves.length);
			metadata.push(allMoves.length); // Offset
			for (const m of task.moves) {
				for (let w = 0; w < words; w++) {
					allMoves.push(m[w] as bigint);
				}
			}
		}

		const movesBuf = new BigInt64Array(allMoves);
		const metaBuf = new Int32Array(metadata);

		const allowedWasted = width * height - totalPresentArea;
		let minPieceArea = 1000;
		for (const t of tasks) {
			if (t.area < minPieceArea) minPieceArea = t.area;
		}

		// 4. Call C Solver
		if (
			lib.symbols.solve(
				ptr(movesBuf),
				ptr(metaBuf),
				tasks.length,
				words,
				width,
				height,
				allowedWasted,
				minPieceArea,
			)
		) {
			regionsThatFit++;
		}
	}

	return regionsThatFit;
};
