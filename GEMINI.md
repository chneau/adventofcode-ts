# AI instructions

## To add a benchmark to the table:

Day title: curl the page and get the title from the first h2 element. To
benchmark it, run `bun run index.ts aoc_YYYY_DD` and copy the times from the
output into the table in README.md.

## To run a year_day from scratch:

1. Run `bun run index aoc_YYYY_XX` (replace XX with the day number,
   zero-padded). this will create the file Only do this if the file does not
   already exist

### for p1:

2. Read this file if the p1 is already written, skip it and go to p2
3. Read the problem description for part 1 from
   https://adventofcode.com/YYYY/day/XX with a `curl` command
4. Read the aoc_2025_04.ts file to see how the parse function is written Modify
   it as it fits, the idea is for p1 or p2 to not have to do data manipulation
   anymore
5. solve it and write the code in the p1 function
6. Do not test, do not commit, just stop now as I manually have to check the
   solution and submit it Best you can do here is run `bun run lint` to check
   for type errors and fix them and `bun run check` to format the code (ignore
   its output), generally just with type assertions

### for p2:

7. Read the problem description for part 2 from
   https://adventofcode.com/YYYY/day/XX with a `curl` command This time, you
   will have to set a "Cookie" header with the session cookie to be able to
   access the part 2 description. Read the file in .cache/session to get the
   session cookie value.
8. solve it and write the code in the p2 function
9. Do not test, do not commit, just stop now as I manually have to check the
   solution and submit it Best you can do here is run `bun run lint` to check
   for type errors and fix them and `bun run check` to format the code (ignore
   its output), generally just with type assertions

### helpers

if the problem requires different input parsing, read aoc_2025_05.ts and see how
a parseP2 function is written and used in p2
