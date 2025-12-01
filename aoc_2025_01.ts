import z from "zod";
import { fetchInput } from "./session";

const parse = z.string().transform((x) =>
	x.split("\n").map((line) => {
		const action = z.enum(["L", "R"]).parse(line[0]);
		const value = z.coerce.number().parse(line.slice(1));
		return action === "L" ? -value : value;
	}),
);

const input = await fetchInput().then(parse.parse);

const example = parse.parse(`L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`);

export const p1ex = () => p1(example);

export const p1 = (nn = input) => {
	let dial = 50;
	let result = 0;
	for (const n of nn) {
		dial += n;
		dial = dial % 100;
		if (dial === 0) ++result;
	}
	return result;
};

export const p2ex = () => p2(example);

export const p2 = (nn = input) => {
	let dial = 50;
	let result = 0;
	for (const n of nn) {
		dial += n;
		const isOverflow = dial < 0 || dial >= 100;
		dial = Math.abs(dial % 100);
		if (isOverflow) ++result;
	}
	return result;
};
