import { fetchInput } from "./session";

const input = await fetchInput(2023, 1);

export const p1 = (_input = input) => {
	const lines = _input.split("\n");
	let sum = 0;
	for (const line of lines) {
		let firstNumber = "";
		let secondNumber = "";
		for (const letter of line) {
			const isDigit = letter >= "0" && letter <= "9";
			if (!isDigit) continue;
			if (firstNumber === "") firstNumber = letter;
			secondNumber = letter;
		}
		const number = Number.parseInt(`${firstNumber}${secondNumber}`, 10);
		sum += number;
	}
	console.log(sum);
};

export const p2 = (_input = input) => {
	const lines = _input.split("\n");
	const spellednumbers = [
		"one",
		"two",
		"three",
		"four",
		"five",
		"six",
		"seven",
		"eight",
		"nine",
	];
	let sum = 0;
	for (const line of lines) {
		let muttatedLine = line;
		for (let i = 0; i < muttatedLine.length; i++) {
			for (const [index, spelledNumber] of spellednumbers.entries()) {
				const size = spelledNumber.length;
				const word = muttatedLine.substring(i, i + size);
				if (word === spelledNumber) {
					muttatedLine = muttatedLine.replace(word, `${index + 1}`);
					break;
				}
			}
		}
		let firstNumber = "";
		let secondNumber = "";
		for (const letter of muttatedLine) {
			const isDigit = letter >= "0" && letter <= "9";
			if (!isDigit) continue;
			if (firstNumber === "") firstNumber = letter;
			secondNumber = letter;
		}
		const number = Number.parseInt(`${firstNumber}${secondNumber}`, 10);
		sum += number;
	}
	// TODO
	return sum;
};
