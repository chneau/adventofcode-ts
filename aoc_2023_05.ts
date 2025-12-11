import z from "zod";
import { fetchInput } from "./session";

const Range = z.object({
	destinationRangeStart: z.number(),
	sourceRangeStart: z.number(),
	rangeLength: z.number(),
});

type Range = z.infer<typeof Range>;

const MapEntry = z.object({
	name: z.string(),
	ranges: z.array(Range),
});

type MapEntry = z.infer<typeof MapEntry>;

const ParsedInput = z.object({
	seeds: z.array(z.number()),
	maps: z.array(MapEntry),
});

type ParsedInput = z.infer<typeof ParsedInput>;

const parse = async (input: string) => {
	const sections = input.split("\n\n");

	const seeds = ((sections[0] as string).split(":")[1] as string).trim().split(" ").map(Number);

	const maps: MapEntry[] = [];
	for (let i = 1; i < sections.length; i++) {
		const lines = (sections[i] as string).split("\n").filter((line) => line.trim() !== "");
		const name = (lines[0] as string).trim();
		const ranges: Range[] = [];
		for (let j = 1; j < lines.length; j++) {
			const [destinationRangeStart, sourceRangeStart, rangeLength] = (lines[j] as string)
				.split(" ")
				.map(Number) as [number, number, number];
			ranges.push({ destinationRangeStart, sourceRangeStart, rangeLength });
		}
		maps.push({ name, ranges });
	}

	return ParsedInput.parseAsync({ seeds, maps });
};
const _rawInput = await fetchInput();
const _rawExample = `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`;
const _example = await parse(_rawExample);
const _input = await parse(_rawInput);
export const p1ex = () => p1(_example);
export const p1 = (input: ParsedInput = _input) => {
	let minLocation = Infinity;

	for (const seed of input.seeds) {
		let currentNumber = seed;
		for (const map of input.maps) {
			for (const range of map.ranges) {
				if (
					currentNumber >= range.sourceRangeStart &&
					currentNumber < range.sourceRangeStart + range.rangeLength
				) {
					currentNumber =
						range.destinationRangeStart +
						(currentNumber - range.sourceRangeStart);
					break;
				}
			}
		}
		minLocation = Math.min(minLocation, currentNumber);
	}

	return minLocation;
};
export const p2ex = () => p2(_example);
export const p2 = (_parsedInput: ParsedInput = _input) => {
	const result = 0;
	// TODO: Implement p2 logic here
	return result;
};
