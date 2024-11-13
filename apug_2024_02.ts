const example = `1.80 80
1.50 160
2.80 50
1.50 140
1.90 180
2.00 80`;

const input = `1.97 111
1.88 25
2.69 75
1.50 43
1.21 107
1.92 84
1.56 138
2.11 138
1.31 135
1.28 82
2.76 139
1.14 115
1.60 40
1.64 31
2.43 121
1.22 91
2.82 70
1.60 84
1.12 122
2.51 89
2.82 57
1.26 145
2.36 12
1.45 78
1.85 78
2.41 116
2.64 32
2.40 96
1.49 45
2.14 14
1.49 102
2.48 14
1.55 174
2.02 91
1.68 172
2.96 75
2.42 60
1.78 82
2.37 115
2.65 97
1.12 91
1.74 81`;

export const p1ex = () => p1(example);

export const p1 = (_input = input) => {
	const lines = _input.split("\n");
	let min = Number.POSITIVE_INFINITY;
	let which = 0;
	for (const line of lines) {
		const [price, chips] = line.split(" ").map(Number) as [number, number];
		const pricePerChip = price / chips;
		if (pricePerChip < min) {
			min = pricePerChip;
			which = chips;
		}
	}
	return which;
};

export const p2ex = () => p2(example);

export const p2 = (_input = input) => {
	const lines = _input.split("\n");
	const chipshops = lines.map((line) => {
		const [price, chips] = line.split(" ").map(Number) as [number, number];
		return { skip: false, price, chips };
	});
	for (const [idx, curr] of chipshops.entries()) {
		curr.skip = chipshops
			.filter((_, i) => i !== idx)
			.some((x) => curr.price >= x.price && curr.chips >= x.chips);
	}
	return chipshops
		.filter((x) => !x.skip)
		.reduce<number>((acc, curr) => acc + curr.price, 0);
};
