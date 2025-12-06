import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) => z.string().parseAsync(input);
const _input = await fetchInput().then(parse);
const _example = await parse(`example_input_here`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let result = 0;
	result += input.length;
	return result;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	result += input.length;
	return result;
};
