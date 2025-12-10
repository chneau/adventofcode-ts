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
		const numButtons = buttons.length;
		const numLights = targetDiagram.length;

		let target = 0n;
		for (let i = 0; i < numLights; i++) {
			if (targetDiagram[i]) target |= 1n << BigInt(i);
		}

		const btnMasks = new BigUint64Array(numButtons);
		for (let i = 0; i < numButtons; i++) {
			let b = 0n;
			const indices = buttons[i] as number[];
			for (let j = 0; j < indices.length; j++) {
				b |= 1n << BigInt(indices[j] as number);
			}
			btnMasks[i] = b;
		}

		let minPressesForMachine = Infinity;
		if (target === 0n) minPressesForMachine = 0;

		let current = 0n;
		let gray = 0;
		let pressCount = 0;
		const limit = 1 << numButtons;

		for (let i = 1; i < limit; i++) {
			// ctz(i)
			const bit = 31 - Math.clz32(i & -i);

			current ^= btnMasks[bit] as bigint;

			// Update gray state and press count
			// gray code property: we flip the 'bit'-th bit of the gray code value
			if ((gray >> bit) & 1) {
				pressCount--;
				gray ^= 1 << bit;
			} else {
				pressCount++;
				gray ^= 1 << bit;
			}

			if (current === target) {
				if (pressCount < minPressesForMachine) {
					minPressesForMachine = pressCount;
				}
			}
		}

		if (minPressesForMachine !== Infinity) {
			totalMinPresses += minPressesForMachine;
		}
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
		const stride = numCols + 1;

		// Augmented Matrix M = [A | T]
		// Flattened: M[r, c] -> M[r * stride + c]
		const M = new Float64Array(numRows * stride);

		// Fill Matrix
		// A[r][c] = 1 if button c affects row r
		for (let c = 0; c < numCols; c++) {
			const btnRows = buttons[c] as number[];
			for (let k = 0; k < btnRows.length; k++) {
				const r = btnRows[k] as number;
				if (r < numRows) {
					M[r * stride + c] = 1.0;
				}
			}
		}
		// Fill Target column
		for (let r = 0; r < numRows; r++) {
			M[r * stride + numCols] = targetJoltages[r] as number;
		}

		// Gaussian Elimination
		const pivotColOfRow = new Int32Array(numRows).fill(-1);
		let pivotRow = 0;
		// Bitset for pivot cols would be fast, but simple boolean array or Set is fine for small N
		// Using Int8Array for pivotCols lookup
		const isPivotCol = new Uint8Array(numCols);

		for (let col = 0; col < numCols && pivotRow < numRows; col++) {
			// Find pivot
			let sel = pivotRow;
			while (sel < numRows) {
				const val = M[sel * stride + col] as number;
				if (val > 1e-9 || val < -1e-9) break;
				sel++;
			}
			if (sel === numRows) continue;

			// Swap rows
			if (sel !== pivotRow) {
				const off1 = pivotRow * stride;
				const off2 = sel * stride;
				for (let k = col; k < stride; k++) {
					const tmp = M[off1 + k] as number;
					M[off1 + k] = M[off2 + k] as number;
					M[off2 + k] = tmp;
				}
			}

			// Normalize pivot row
			const pOff = pivotRow * stride;
			const div = M[pOff + col] as number;
			const invDiv = 1.0 / div;
			for (let k = col; k < stride; k++) {
				(M[pOff + k] as number) *= invDiv;
			}

			// Eliminate other rows
			for (let i = 0; i < numRows; i++) {
				if (i !== pivotRow) {
					const iOff = i * stride;
					const fac = M[iOff + col] as number;
					if (fac > 1e-9 || fac < -1e-9) {
						for (let k = col; k < stride; k++) {
							(M[iOff + k] as number) -= fac * (M[pOff + k] as number);
						}
					}
				}
			}

			pivotColOfRow[pivotRow] = col;
			isPivotCol[col] = 1;
			pivotRow++;
		}

		// Check inconsistency
		let consistent = true;
		for (let i = pivotRow; i < numRows; i++) {
			if (Math.abs(M[i * stride + numCols] as number) > 1e-9) {
				consistent = false;
				break;
			}
		}
		if (!consistent) continue;

		// Identify Free Variables
		// We can collect indices
		const freeCols = new Int32Array(numCols);
		let freeCount = 0;
		for (let c = 0; c < numCols; c++) {
			if (isPivotCol[c] === 0) {
				freeCols[freeCount++] = c;
			}
		}

		// Calculate bounds
		const freeVarBounds = new Int32Array(freeCount);
		for (let i = 0; i < freeCount; i++) {
			const col = freeCols[i] as number;
			let limit = 277; // Fallback
			let minLim = Infinity;
			// Check rows affected by this column in original A
			// Re-scanning buttons input is easier than scanning M
			const btnRows = buttons[col] as number[];
			for (let k = 0; k < btnRows.length; k++) {
				const r = btnRows[k] as number;
				if (r < numRows) {
					const t = targetJoltages[r] as number;
					if (t < minLim) minLim = t;
				}
			}
			if (minLim !== Infinity) limit = minLim;
			freeVarBounds[i] = limit;
		}

		let minPressesForMachine = Infinity;
		const assignment = new Int32Array(numCols);

		// Recursive search
		const search = (idx: number, currentFreeSum: number) => {
			if (currentFreeSum >= minPressesForMachine) return;

			if (idx === freeCount) {
				// Solve Dependent Variables
				let currentTotal = currentFreeSum;
				let valid = true;

				for (let i = 0; i < pivotRow; i++) {
					const off = i * stride;
					let val = M[off + numCols] as number; // RHS
					// Subtract free variable contributions
					// M[i][fc] is non-zero only if it wasn't eliminated...
					// Wait, we eliminated ABOVE and BELOW the pivot.
					// So M[i] only has the pivot column (value 1) and potentially free columns.
					// Pivots are unit vectors.
					// So x_pivot + sum(coeff * x_free) = RHS
					// x_pivot = RHS - sum(coeff * x_free)

					for (let k = 0; k < freeCount; k++) {
						const fc = freeCols[k] as number;
						const coeff = M[off + fc] as number;
						if (coeff > 1e-9 || coeff < -1e-9) {
							val -= coeff * (assignment[fc] as number);
						}
					}

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

				if (valid && currentTotal < minPressesForMachine) {
					minPressesForMachine = currentTotal;
				}
				return;
			}

			const col = freeCols[idx] as number;
			const limit = freeVarBounds[idx] as number;
			for (let val = 0; val <= limit; val++) {
				assignment[col] = val;
				search(idx + 1, currentFreeSum + val);
			}
		};

		search(0, 0);

		if (minPressesForMachine !== Infinity) {
			totalMinPresses += minPressesForMachine;
		}
	}
	return totalMinPresses;
};
