# Advent of Code TypeScript

This repository contains TypeScript solutions for
[Advent of Code](https://adventofcode.com/) puzzles, powered by
[Bun](https://bun.sh).

## Prerequisites

- [Bun](https://bun.sh) runtime.

## Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Configure your session cookie:** To automatically fetch puzzle inputs, you
   need your AoC session cookie.

   - Get your `session` cookie from adventofcode.com (inspect your browser's
     cookies).
   - **Option A:** Set the `AOC_SESSION` environment variable.
   - **Option B:** Create a file named `.cache/session` (create the `.cache`
     folder if it doesn't exist) and paste your session string into it.

   > **Note:** The `.cache` directory is included in `.gitignore` to keep your
   > session data private.

## Usage

### Run a Solution

To run a specific day's solution. If the file does not exist, it will be
automatically created from a template.

```bash
bun start aoc_YYYY_DD
```

**Example:**

```bash
bun start aoc_2025_01
```

**What this does:**

1. Checks if `aoc_2025_01.ts` exists.
2. If it doesn't exist:
   - Creates the file using a standard template.
   - Fetches the puzzle input from adventofcode.com (using your session cookie)
     and saves it to `.cache/`.
3. Runs the exported functions: `p1ex` (Part 1 Example), `p1` (Part 1), `p2ex`
   (Part 2 Example), and `p2` (Part 2).
4. Runs benchmarks for `p1` and `p2`.

### Scripts

The `package.json` includes several helper scripts:

- `bun start <filename_without_extension>`: Runs the specified solution file in
  watch mode.
- `bun run check`: Runs formatting and linting checks using `deno fmt`,
  `oxlint`, and `biome`.
- `bun run lint`: Runs the TypeScript compiler check (`tsc --noEmit`).
- `bun run upgrade`: Updates dependencies to the latest versions.
- `bun run all`: Runs upgrade, check, and lint in sequence.

## Project Structure

- `index.ts`: The main entry point that handles loading solution files, running
  functions, and benchmarking.
- `session.ts`: Manages fetching and caching of puzzle inputs.
- `aoc_YYYY_DD.ts`: Solution files for Advent of Code.
- `apug_YYYY_DD.ts`: Solutions for [APUG](https://leechristie.com/xmas24/)
  puzzles.
- `.cache/`: Directory for storing session cookies and cached puzzle inputs.

## Features

- **Automatic Template Generation**: Start working immediately by running the
  command for a new day.
- **Input Caching**: Respects AoC servers by caching inputs locally.
- **Built-in Benchmarking**: Uses `mitata` to benchmark your solutions
  automatically.
- **Hybrid Performance Comparison**: Some solutions (e.g., `aoc_2025_02`)
  include optimized C implementations via `bun:ffi`. These are automatically
  benchmarked alongside the TypeScript versions (`p1_c` vs `p1`).
- **Type Safety**: Uses `zod` for input parsing validation.

## License

This project is open source.

## Benchmarks

Benchmarks are run on a AMD Ryzen 9 270 w/ Radeon 780M Graphics.
Runtime: bun 1.3.3 (x64-linux)

| File        | p1 (ms) | p2 (ms) |
|-------------|---------|---------|
| aoc_2025_01 | 0.025   | 0.020   |
| aoc_2025_02 | 0.002   | 0.042   |
| aoc_2025_03 | 1.29    | 0.414   |
| aoc_2025_04 | 0.469   | 25.73   |