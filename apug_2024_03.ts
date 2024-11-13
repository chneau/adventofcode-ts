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
	const numbers = _input.split("\n").map(Number);
	const states = numbers.map((x) => ({ x, disabled: false }));

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

export const p2ex = () => p2(example);

export const p2 = (_input = input) => {};
