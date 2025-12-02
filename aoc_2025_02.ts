import { fetchInput } from "./session";

const _input = await fetchInput();
const _example = `example input here`;
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	return input.length;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	return input.length;
};
