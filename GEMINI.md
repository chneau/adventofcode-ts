# Instructions

## To get the problem for a day:

Run `bun index.ts aoc_YYYY_DD --read`.

## To create and read the content of a file for a day:

Run `bun index.ts aoc_YYYY_DD --create`.

## To run and benchmark a day:

Run `bun index.ts aoc_YYYY_DD`.

## To add a benchmark to the table:

Get the problem, benchmark it and then add it to the table in the @README.md
file.

## Code style

Typescript is set to strict mode including `noUncheckedIndexedAccess`. Do not
use "!" operator to assert undefined values, you can instead use a type
assertion but zod is preferred to validate and parse data.

## Parsing input

The parsing logic must use zod and use `parseAsync` to validate the input data,
see example below.

```ts
import z from "zod";
import { fetchInput } from "./session";

const parse = async (input: string) => {
	const pre = input.split("\n").map((x) => x.split(" ").filter((x) => x));
	return z
		.object({
			numbers: z.coerce.number().array().array(),
			operations: z.literal(["+", "*"]).array(),
			length: z.number(),
		})
		.parseAsync({
			numbers: pre.slice(0, -1),
			operations: pre.slice(-1)[0],
			length: pre[0]?.length,
		});
};
const _raw = await fetchInput();
const _input = await parse(_raw);
const _example = await parse(`example_input_from_the_page_here`);
```

The `p1` and `p2` must not do any parsing or data manipulation, just solve the
problem using the parsed input.

## Available commands

Do not test, do not commit, just stop now as I manually have to check the
solution and submit it Best you can do here is run `bun run lint` to check for
type errors and fix them and `bun run check` to format the code (ignore its
output), generally just with type assertions. Output the result of p1 so I can
see it.

## Part 2 parser

Sometimes, the parser for part 2 can be different than part 1, in that case,
reuse or create new \_example2 and \_input2 as shown below. Do not forget to use
`parseAsync` in that case as well. Zod is the preferred way to transform data.

```ts
const _example2 = _example
  .filter((x) => typeof x === "object")
  .sort((x, y) => x[0] - y[0]);
const input2 = _input
  .filter((x) => typeof x === "object")
  .sort((x, y) => x[0] - y[0]);
export const p2ex = () => p2(_example2);
export const p2 = (input = input2) => // etc...
```

## Solving a day's problem

### for p1:

1. Read this file if the p1 is already written, skip it and go to `### for p2:`
2. Read the problem description for part 1.
3. Implement the parse function to fit the input data using zod as shown above.
4. Solve it and write the code in the p1 function

### for p2:

1. Read the part 2.
2. If necessary, create `_example2` and `input2` with a different parser.
3. Solve it and write the code in the p2 function.
