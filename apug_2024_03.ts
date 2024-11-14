const example = `20
1
10
25
60
70
50
5
30
100`;

const input = `79.51
1.12
304.82
320.01
686.13
788.89
636.06
416.83
46.66
37.26
21.72
88.72
663.05
642.74
51.06
328.51
151.42
9.53
74.09
53.16
11.85
63.52
66.92
0.19
127.26
19.25
3.58
28.93
437.25
7.19
206.43
438.98
36.93
1.33
11.54
814.78
620.65
753.57
578.01
1.03
425.26
59.78`;

export const p1ex = () => p1(example, 4);

export const p1 = (_input = input, _taken = 8) => {
	const states = _input
		.split("\n")
		.map(Number)
		.map((x) => ({ x, disabled: false }));

	let taken = _taken;

	let total = 0;

	while (taken > 0) {
		const max = Math.max(...states.filter((x) => !x.disabled).map((x) => x.x));

		const maxIndex = states.findIndex((x) => x.x === max);
		const previous = states[maxIndex - 1];
		const current = states[maxIndex];
		const next = states[maxIndex + 1];
		if (previous) {
			previous.disabled = true;
		}
		if (next) {
			next.disabled = true;
		}
		if (current) {
			current.disabled = true;
			total += current.x;
		}
		taken--;
	}

	return total;
};

export const p2ex = () => p2(example, 4);

function* permutations(ones: number, zeros: number): Generator<number[]> {
	const total = ones + zeros;
	const max = 2 ** total;
	for (let i = 0; i < max; i++) {
		const perm = i.toString(2).padStart(total, "0");
		if (perm.split("1").length - 1 !== ones) {
			continue;
		}
		yield perm.split("").map(Number);
	}
}

export const p2 = (_input = input, _taken = 8) => {
	const states = _input.split("\n").map(Number);
	const maxPermSize = _taken * 1.62;
	const maxes = states.toSorted((a, b) => b - a).slice(0, maxPermSize);
	const indexes = maxes.map((x) => states.indexOf(x));
	let best = 0;
	let bestIndexes: number[] = [];

	for (const perm of permutations(_taken, maxPermSize - _taken)) {
		const indexesToTake = perm
			.map<number>((x, idx) => (x === 1 ? (indexes[idx] ?? 0) : -1))
			.filter((x) => x !== -1);
		const sorted = indexesToTake.toSorted((a, b) => a - b);
		let isGood = true;
		for (let i = 1; i < sorted.length; i++) {
			if ((sorted[i] ?? -1) - (sorted[i - 1] ?? -1) === 1) {
				isGood = false;
				break;
			}
		}
		if (!isGood) {
			continue;
		}
		const sum = sorted.reduce<number>(
			(acc, curr) => acc + (states[curr] ?? -1),
			0,
		);
		if (sum > best) {
			best = sum;
			bestIndexes = indexesToTake;
		}
	}
	console.log("best", best);
	console.log("bestIndexes", bestIndexes);
	console.log("maxes", maxes);
	console.log("indexes", indexes);
	return best;
};

export const p2old = (_input = input, _taken = 8) => {
	const states = _input.split("\n").map(Number);

	let permutation = 2 ** (states.length - 1);
	let maxFound = 0;
	while (true) {
		const perm = permutation.toString(2);
		if (perm.length < states.length) {
			permutation++;
			continue;
		}
		if (perm.length > states.length) {
			break;
		}
		if (perm.split("").filter((x) => x === "1").length > _taken) {
			permutation++;
			continue;
		}
		if (perm.includes("11")) {
			permutation++;
			continue;
		}
		const sum = states.reduce<number>((acc, curr, idx) => {
			if (perm[idx] === "1") {
				return acc + curr;
			}
			return acc;
		}, 0);
		if (sum > maxFound) {
			maxFound = sum;
		}
		permutation++;
	}
	return maxFound;
};
