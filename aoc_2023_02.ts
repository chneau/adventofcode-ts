import { fetchInput } from "./session";

const input = await fetchInput(2023, 2);

export const p1 = (_input = input) => {
	const lines = _input.split("\n");
	const limits: { [k: string]: number } = {
		red: 12,
		green: 13,
		blue: 14,
	};
	let sum = 0;
	for (const line of lines) {
		const [game, sets] = line.split(": ");
		if (!game || !sets) throw new Error("Invalid input");
		const gameId = Number.parseInt(game.slice(5));
		let isOk = true;
		for (const set of sets.split("; ")) {
			const cubes = set.split(", ");
			for (const cube of cubes) {
				const [_count, color] = cube.split(" ");
				if (!color || !_count) throw new Error("Invalid input");
				const count = Number.parseInt(_count);
				const limit = limits[color];
				if (limit !== undefined && count > limit) {
					isOk = false;
					break;
				}
			}
		}
		if (isOk) sum += gameId;
	}
	return sum;
};

export const p2 = (_input = input) => {
	const lines = _input.split("\n");
	let sum = 0;
	for (const line of lines) {
		const [game, sets] = line.split(": ");
		if (!game || !sets) throw new Error("Invalid input");
		const minimums = {
			red: 0,
			green: 0,
			blue: 0,
		};
		for (const set of sets.split("; ")) {
			const cubes = set.split(", ");
			for (const cube of cubes) {
				const [_count, color] = cube.split(" ");
				if (!color || !_count) throw new Error("Invalid input");
				const count = Number.parseInt(_count);
				const c = color as keyof typeof minimums;
				minimums[c] = Math.max(minimums[c], count);
			}
		}
		sum += minimums.red * minimums.green * minimums.blue;
	}
	return sum;
};
