import { fetchInput } from "./session";

const parse = (input: string) => input;
const _input = await fetchInput().then(parse);
const _example = parse(`example_input_here`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	return input.length;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	return input.length;
};
