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

export const p1ex = () => p1(_example);
export const p1 = (graph = _input) => {
	let pathCount = 0;

	function dfs(currentDevice: string) {
		if (currentDevice === "out") {
			pathCount++;
			return;
		}

		const outputs = graph[currentDevice];
		if (outputs) {
			for (const nextDevice of outputs) {
				dfs(nextDevice);
			}
		}
	}

	dfs("you");
	return pathCount;
};

export const p2ex = () => p2(_example);
export const p2 = (_graph = _input) => {
	// Part 2 implementation will go here
	return 0;
};
