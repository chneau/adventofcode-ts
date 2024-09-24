const session =
	Bun.env.AOC_SESSION ??
	(await Bun.file(`${Bun.env.HOME}/.cache/aoc/session`).text());
export const fetchInput = async (year: number, day: number) => {
	const file = Bun.file(`${Bun.env.HOME}/.cache/aoc/${year}_${day}`);
	const fileExist = await file.exists();
	if (fileExist) {
		return await file.text().then((x) => x.trim());
	}
	const input = await fetch(
		`https://adventofcode.com/${year}/day/${day}/input`,
		{ headers: { cookie: `session=${session}` } },
	).then((x) => x.text());
	await Bun.write(file, input);
	return input.trim();
};
