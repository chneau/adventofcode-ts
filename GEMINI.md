# AI instructions

## To get the problem for a day:

Run `bun run index.ts aoc_YYYY_DD --read`.

## To create and read the content of a file for a day:

Run `bun run index.ts aoc_YYYY_DD --create`.

## To run and benchmark a day:

Run `bun run index.ts aoc_YYYY_DD`.

## To add a benchmark to the table:

Get the problem, benchmark it and then add it to the table in the @README.md
file.

## Code style

Typescript noUncheckedIndexedAccess is true, do not use "!" operator to assert
undefined values, you can instead use a type assertion;

## Solving a day's problem

### for p1:

1. Read this file if the p1 is already written, skip it and go to `### for p2:`
2. Read the problem description for part 1.
3. Implement the parse function, which can look like this:

   ```ts
   import z from "zod";
   import { fetchInput } from "./session";

   const parse = (input: string) =>
   	z
   		.array(z.union([z.tuple([z.number(), z.number()]), z.number()]))
   		.parseAsync(
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
   const _example = await parse(`example_input_from_the_page_here`);
   ```

   Just adapt the parsing logic to your input format, the part functions should
   not do anymore data manipulation than necessary, you must use zod to
   validate. The example must be extracted from the page.

4. Solve it and write the code in the p1 function
5. Do not test, do not commit, just stop now as I manually have to check the
   solution and submit it Best you can do here is run `bun run lint` to check
   for type errors and fix them and `bun run check` to format the code (ignore
   its output), generally just with type assertions. Output the result of p1 so
   I can see it.

### for p2:

Basically the same as for p1, read the part 2 description from the website, but
if necessary, you can have a different parse function for p2 if the input needs
to be parsed differently or accept different data structures, as an example
where it reuses the output of p1's parse function but filters and sorts the data
differently:

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

You can as well just write a completely new parseP2 function if necessary using
zod.
