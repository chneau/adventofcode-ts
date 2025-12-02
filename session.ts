import z from "zod";

await Bun.$`mkdir -p .cache; touch .cache/session`;
const session = z
	.string()
	.nonempty()
	.parse(Bun.env.AOC_SESSION ?? (await Bun.file(".cache/session").text()));
export const fetchInput = async () => {
	const name = z.string().parse(Bun.argv[2]);
	const parts = name.split("_");
	const year = z.coerce.number().parse(parts[1]);
	const day = z.coerce.number().parse(parts[2]);
	console.log(`https://adventofcode.com/${year}/day/${day}`);
	const file = Bun.file(`.cache/${year}_${day}`);
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
