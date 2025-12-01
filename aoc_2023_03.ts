import { fetchInput } from "./session";

const input = await fetchInput();

const example = `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`;

export const p1ex = () => p1(example);

export const p1 = (_input = input) => {
	const lines = _input.split("\n");
	const numbers = "0123456789";
	const numbersOrDot = `${numbers}.`;
	let sum = 0;
	for (const [lineNumber, line] of lines.entries()) {
		for (let i = 0; i < line.length; i++) {
			let j = i;
			const isNumber = numbers.includes(line[i] as string);
			if (!isNumber) continue;
			for (; j < line.length; j++) {
				if (!numbers.includes(line[j] as string)) {
					j--;
					break;
				}
			}
			const number = Number(line.slice(i, j + 1));
			let isNearSpecialChar = false;
			for (let k = i - 1; k <= j + 1; k++) {
				if (
					!numbersOrDot.includes(line[k] as string) ||
					!numbersOrDot.includes(lines[lineNumber - 1]?.[k] ?? ".") ||
					!numbersOrDot.includes(lines[lineNumber + 1]?.[k] ?? ".")
				) {
					isNearSpecialChar = true;
					break;
				}
			}
			if (isNearSpecialChar) sum += number;
			i = j + 1;
		}
	}
	return sum;
};
