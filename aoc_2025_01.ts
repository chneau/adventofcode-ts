import z from "zod";
import { fetchInput } from "./session";

const input = await fetchInput(2025, 1);

const example = `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`;

export const p1ex = () => p1(example);

export const p1 = (_input = input) => {
	const lines = _input.split("\n");
	let dial = 50;
	let result = 0;
	for (const line of lines) {
		const action = z.enum(["L", "R"]).parse(line[0]);
		const value = z.coerce.number().parse(line.slice(1));
		dial = action === "L" ? dial - value : dial + value;
		dial %= 100;
		dial === 0 && result++;
	}
	return result;
};
