import z from "zod";
import { fetchInput } from "./session";

// Define the schema for a device, which is a string (device name)
const DeviceNameSchema = z.string();

// Define the schema for the parsed input: a Map where keys are device names
// and values are arrays of DeviceNameSchema (their outputs).
const InputSchema = z.record(DeviceNameSchema, z.array(DeviceNameSchema));

const parse = async (input: string) => {
	const lines = input.split("\n").filter((line) => line.trim() !== "");
	const graph: Record<string, string[]> = {};

	for (const line of lines) {
		const [deviceName, outputsStr] = line.split(": ") as [string, string];
		const outputs = outputsStr ? outputsStr.split(" ") : [];
		graph[deviceName] = outputs;
	}

	// We can directly return the graph as it matches the InputSchema
	return InputSchema.parseAsync(graph);
};

const _raw = await fetchInput();
const _input = await parse(_raw);

const _exampleRaw = `you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out`;
const _example = await parse(_exampleRaw);

const _example2Raw = `svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out`;
const _example2 = await parse(_example2Raw);

export const p1ex = () => p1(_example);
export const p1 = (graph = _input) => {
	const memo = new Map<string, number>();

	function countPaths(currentDevice: string): number {
		if (currentDevice === "out") {
			return 1;
		}
		const cached = memo.get(currentDevice);
		if (cached !== undefined) {
			return cached;
		}

		let totalPaths = 0;
		const outputs = graph[currentDevice];
		if (outputs) {
			for (const nextDevice of outputs) {
				totalPaths += countPaths(nextDevice);
			}
		}

		memo.set(currentDevice, totalPaths);
		return totalPaths;
	}

	return countPaths("you");
};

export const p2ex = () => p2(_example2);
export const p2 = (graph = _input) => {
	const memo = new Map<string, number>();

	function countPaths(
		currentDevice: string,
		hasVisitedDac: boolean,
		hasVisitedFft: boolean,
	): number {
		const mask = (hasVisitedDac ? 1 : 0) | (hasVisitedFft ? 2 : 0);
		const key = `${currentDevice}:${mask}`;

		const cached = memo.get(key);
		if (cached !== undefined) {
			return cached;
		}

		if (currentDevice === "out") {
			return hasVisitedDac && hasVisitedFft ? 1 : 0;
		}

		let totalPaths = 0;
		const outputs = graph[currentDevice];
		if (outputs) {
			for (const nextDevice of outputs) {
				const nextHasVisitedDac = hasVisitedDac || nextDevice === "dac";
				const nextHasVisitedFft = hasVisitedFft || nextDevice === "fft";
				totalPaths += countPaths(
					nextDevice,
					nextHasVisitedDac,
					nextHasVisitedFft,
				);
			}
		}

		memo.set(key, totalPaths);
		return totalPaths;
	}

	return countPaths("svr", false, false);
};
