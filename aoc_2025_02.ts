import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.array(z.tuple([z.number(), z.number()]))
		.parse(input.split(",").map((x) => x.split("-").map(Number)));
const _input = await fetchInput().then(parse);
const _example =
	parse(`11-22,95-115,998-1012,1188511880-1188511890,222220-222224,
1698522-1698528,446443-446449,38593856-38593862,565653-565659,
824824821-824824827,2121212118-2121212124`);
export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	return input.length;
};
export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	return input.length;
};
