import { fetchInput } from "./session";

interface MathProblem {
	numbers: number[];
	operator: "+" | "*";
}

const parse = async (input: string): Promise<MathProblem[]> => {
	const problemBlocks = input.split(" \n");
	return problemBlocks.map((block) => {
		const lines = block.trim().split("\n");
		const operator = lines.pop() as "+" | "*"; // Last line is the operator
		const numbers = lines.map(Number); // Remaining lines are numbers
		return { numbers, operator };
	});
};

const _input = await fetchInput().then(parse);
const _example = await parse(`1
2
+ \n3
4
*`); // Example input for testing

export const p1ex = () => p1(_example);

export const p1 = (input: MathProblem[] = _input) => {
	let grandTotal = 0;
	for (const problem of input) {
		let problemResult: number;
		if (problem.operator === "+") {
			problemResult = problem.numbers.reduce((sum, num) => sum + num, 0);
		} else if (problem.operator === "*") {
			problemResult = problem.numbers.reduce(
				(product, num) => product * num,
				1,
			);
		} else {
			throw new Error(`Unknown operator: ${problem.operator}`);
		}
		grandTotal += problemResult;
	}
	return grandTotal;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	result += input.length;
	return result;
};
