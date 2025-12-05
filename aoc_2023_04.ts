import z from "zod";
import { fetchInput } from "./session";

const parse = (input: string) =>
	z
		.array(
			z.object({
				winning: z.array(z.number()),
				yours: z.array(z.number()),
			}),
		)
		.parse(
			input
				.split("\n")
				.filter((line) => line.trim() !== "")
				.map((line) => {
					const cardContent = line.split(":")[1];
					if (!cardContent) {
						return { winning: [], yours: [] };
					}
					const parts = cardContent.split("|");
					const winning =
						parts[0]
							?.trim()
							.split(/\s+/)
							.map((n) => parseInt(n, 10)) ?? [];
					const yours =
						parts[1]
							?.trim()
							.split(/\s+/)
							.map((n) => parseInt(n, 10)) ?? [];
					return { winning, yours };
				}),
		);

const _input = await fetchInput().then(parse);
const _example = parse(`Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`);

export const p1ex = () => p1(_example);
export const p1 = (input = _input) => {
	let total = 0;
	for (const card of input) {
		const matches = card.yours.filter((n) => card.winning.includes(n));
		if (matches.length > 0) {
			total += 2 ** (matches.length - 1);
		}
	}
	return total;
};

export const p2ex = () => p2(_example);
export const p2 = (input = _input) => {
	let result = 0;
	result += input.length;
	return result;
};
