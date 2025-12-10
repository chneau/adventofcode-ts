import z from "zod";
import { fetchInput } from "./session";

const parseMachine = z.object({
	diagram: z.array(z.boolean()), // e.g., [false, true, true, false] for [.##.]
	buttons: z.array(z.array(z.number())), // e.g., [[3], [1,3], [2], [2,3], [0,2], [0,1]]
	joltage: z.array(z.number()),
});
const parse = async (input: string) => {
	return z.array(parseMachine).parseAsync(
		input
			.split("\n")
			.filter(Boolean)
			.map((line) => {
				const [, diagramStr, buttonsStr, joltageStr] = line.match(
					/\[(.*?)\]\s+\((.*?)\)\s+\{(.*?)\}/,
				) as RegExpMatchArray;

				if (!diagramStr || !buttonsStr || !joltageStr) {
					throw new Error(`Invalid line format: ${line}`);
				}

				const diagram = diagramStr.split("").map((char) => char === "#");

				const buttons = buttonsStr
					.split(") (")
					.map((btn) => {
						return btn
							.replace("(", "")
							.replace(")", "")
							.split(",")
							.map(Number)
							.filter((s) => !Number.isNaN(s));
					})
					.filter((arr) => arr.length > 0);

				const joltage = joltageStr
					.split(",")
					.map(Number)
					.filter((s) => !Number.isNaN(s));

				return { diagram, buttons, joltage };
			}),
	);
};
const _rawInput = await fetchInput();
const _rawExample = `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let totalMinPresses = 0;

	for (const machine of input) {
		const targetDiagram = machine.diagram;
		const buttons = machine.buttons;
		const numLights = targetDiagram.length;
		const numButtons = buttons.length;

		let minPressesForMachine = Infinity;

		for (let i = 0; i < 1 << numButtons; i++) {
			const currentLights = new Array(numLights).fill(false);
			let pressesCount = 0;

			for (let j = 0; j < numButtons; j++) {
				if ((i >> j) & 1) {
					pressesCount++;
					for (const lightIndex of buttons[j] as number[]) {
						if (lightIndex >= 0 && lightIndex < numLights) {
							currentLights[lightIndex] = !currentLights[lightIndex];
						}
					}
				}
			}

			let matches = true;
			for (let k = 0; k < numLights; k++) {
				if (currentLights[k] !== targetDiagram[k]) {
					matches = false;
					break;
				}
			}

			if (matches) {
				minPressesForMachine = Math.min(minPressesForMachine, pressesCount);
			}
		}
		totalMinPresses += minPressesForMachine;
	}
	return totalMinPresses;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let totalMinPresses = 0;

	for (const machine of input) {
		const targetJoltages = machine.joltage;
		const buttons = machine.buttons;
		const numRows = targetJoltages.length;
		const numCols = buttons.length;

		// Matrix A: A[row][col] = 1 if button col affects row
		const A = Array(numRows)
			.fill(0)
			.map(() => Array(numCols).fill(0)) as number[][];
		for (let c = 0; c < numCols; c++) {
			for (const r of buttons[c] as number[]) {
				if (r < numRows) (A[r] as number[])[c] = 1;
			}
		}

		// Augmented Matrix M = [A | T]
		const M = A.map((row, i) => [
			...row,
			targetJoltages[i] as number,
		]) as number[][];

		// Gaussian Elimination
		const pivotColOfRow = Array(numRows).fill(-1);
		let pivotRow = 0;
		const pivotCols = new Set<number>();

		for (let col = 0; col < numCols && pivotRow < numRows; col++) {
			// Find pivot
			let sel = pivotRow;
			while (
				sel < numRows &&
				Math.abs((M[sel] as number[])[col] as number) < 1e-9
			)
				sel++;
			if (sel === numRows) continue;

			// Swap
			[M[pivotRow], M[sel]] = [M[sel] as number[], M[pivotRow] as number[]];

			// Normalize pivot row
			const div = (M[pivotRow] as number[])[col] as number;
			for (let k = col; k <= numCols; k++) {
				((M[pivotRow] as number[])[k] as number) /= div;
			}

			// Eliminate other rows
			for (let i = 0; i < numRows; i++) {
				if (i !== pivotRow) {
					const fac = (M[i] as number[])[col] as number;
					if (Math.abs(fac) > 1e-9) {
						for (let k = col; k <= numCols; k++) {
							((M[i] as number[])[k] as number) -=
								fac * ((M[pivotRow] as number[])[k] as number);
						}
					}
				}
			}

			pivotColOfRow[pivotRow] = col;
			pivotCols.add(col);
			pivotRow++;
		}

		// Check for inconsistency (0 = non-zero) in remaining rows
		let consistent = true;
		for (let i = pivotRow; i < numRows; i++) {
			if (Math.abs((M[i] as number[])[numCols] as number) > 1e-9) {
				consistent = false;
				break;
			}
		}

		if (!consistent) {
			// No solution possible
			continue;
		}

		// Identify Free Variables
		const freeCols: number[] = [];
		for (let c = 0; c < numCols; c++) {
			if (!pivotCols.has(c)) freeCols.push(c);
		}

		// Calculate conservative upper bounds for free variables
		// A free variable can't be pressed more than min(Target[r]) for any r it affects,
		// because all coeffs are non-negative in original problem.
		const freeVarBounds = freeCols.map((col) => {
			let limit = Infinity;
			for (let r = 0; r < numRows; r++) {
				if ((((A as number[][])[r] as number[])[col] as number) > 0) {
					limit = Math.min(limit, targetJoltages[r] as number);
				}
			}
			return limit === Infinity ? 277 : limit; // Fallback to max seen joltage
		});

		let minPressesForMachine = Infinity;
		const assignment = Array(numCols).fill(0);

		const search = (freeIdx: number, currentFreeSum: number) => {
			// Pruning
			if (currentFreeSum >= minPressesForMachine) return;

			if (freeIdx === freeCols.length) {
				// Calculate Dependent Variables (Pivots)
				let currentTotal = currentFreeSum;
				let valid = true;

				// We need to check all pivot rows
				for (let i = 0; i < pivotRow; i++) {
					let val = (M[i] as number[])[numCols] as number; // RHS
					for (let k = 0; k < freeCols.length; k++) {
						const fc = freeCols[k] as number;
						val -= ((M[i] as number[])[fc] as number) * assignment[fc];
					}

					// Check integer and non-negative
					if (val < -1e-4) {
						valid = false;
						break;
					}
					const roundVal = Math.round(val);
					if (Math.abs(val - roundVal) > 1e-4) {
						valid = false;
						break;
					}
					currentTotal += roundVal;
				}

				if (valid) {
					if (currentTotal < minPressesForMachine) {
						minPressesForMachine = currentTotal;
					}
				}
				return;
			}

			const col = freeCols[freeIdx] as number;
			const limit = freeVarBounds[freeIdx] as number;

			for (let val = 0; val <= limit; val++) {
				assignment[col] = val;
				search(freeIdx + 1, currentFreeSum + val);
			}
		};

		search(0, 0);

		if (minPressesForMachine !== Infinity) {
			totalMinPresses += minPressesForMachine;
		}
	}
	return totalMinPresses;
};
