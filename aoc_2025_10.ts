import z from "zod";
import { fetchInput } from "./session";

const parseMachine = z.object({
	diagram: z.array(z.boolean()), // e.g., [false, true, true, false] for [.##.]
	buttons: z.array(z.array(z.number())), // e.g., [[3], [1,3], [2], [2,3], [0,2], [0,1]]
});

const parse = async (input: string) => {
	return z.array(parseMachine).parseAsync(
		input
			.split("\n")
			.filter(Boolean)
			.map((line) => {
				const [, diagramStr, buttonsStr] = line.match(
					/\[(.*?)\]\s+\((.*?)\)\s+\{.*?}/,
				) as RegExpMatchArray;

				if (!diagramStr || !buttonsStr) {
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

				return { diagram, buttons };
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
	const result = 0;
	return result;
};
