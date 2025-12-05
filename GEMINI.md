# AI instructions

## To add a benchmark to the table:

Curl the page and get the title from the first h2 element. To benchmark it, run
`bun run index.ts aoc_YYYY_DD` and copy the times from the output into the table
in README.md.

## To run a year_day from scratch:

1. Run `bun run index aoc_YYYY_XX` (replace XX with the day number and YYYY with
   the year, it is 2025 if not specified, and XX is the day of today if not
   specified, zero-padded). this will create the file Only do this if the file
   does not already exist

### for p1:

2. Read this file if the p1 is already written, skip it and go to `### for p2:`
3. Read the problem description for part 1 with this command
   `curl -s "https://adventofcode.com/YYYY/day/XX" -H "Cookie: session=$(cat .cache/session)"`

   Do not try to read the session file since you do not have access to it, just
   assume you have the session cookie and the command works.

4. Implement the parse function, which can look like this:

   ```ts
   import z from "zod";
   import { fetchInput } from "./session";

   const parse = (input: string) =>
   	z.array(z.union([z.tuple([z.number(), z.number()]), z.number()])).parse(
   		input
   			.split("\n")
   			.map((line) => {
   				if (line.trim() === "") return null;
   				const rangeMatch = line.match(/^(\d+)-(\d+)$/);
   				if (rangeMatch) {
   					return [
   						parseInt(rangeMatch[1] as string, 10),
   						parseInt(rangeMatch[2] as string, 10),
   					];
   				}
   				return parseInt(line, 10);
   			})
   			.filter((x) => x != null),
   	);
   const _input = await fetchInput().then(parse);
   ```

   Just adapt the parsing logic to your input format, the part functions should
   not do anymore data manipulation than necessary

5. Solve it and write the code in the p1 function
6. Do not test, do not commit, just stop now as I manually have to check the
   solution and submit it Best you can do here is run `bun run lint` to check
   for type errors and fix them and `bun run check` to format the code (ignore
   its output), generally just with type assertions. Output the result of p1 so
   I can see it.

### for p2:

7. Basically the same as for p1, read the part 2 description from the website,
   but if necessary, you can have a different parse function for p2 if the input
   needs to be parsed differently or accept different data structures, as an
   example where it reuses the output of p1's parse function but filters and
   sorts the data differently:

   ```ts
   const _example2 = _example
     .filter((x) => typeof x === "object")
     .sort((x, y) => x[0] - y[0]);
   const input2 = _input
     .filter((x) => typeof x === "object")
     .sort((x, y) => x[0] - y[0]);
   export const p2ex = () => p2(_example2);
   export const p2 = (input = input2) => {
   ```

   You can as well just write a completely new parseP2 function if necessary
   using zod.
