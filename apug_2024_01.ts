const p1Example = `Whisperbread Evertoes
Warmstripe Chestnutplum
Marshmallowwhisker Juniperheart`;

const input = `Candyflake Icelight
Chestnutwhisker Marshmallowtoes
Dashchime Evertoe
Embercane Iceplum
Icicleheart Icehine
Icicleleaf Garlandgreen
Jinglebell Giftwrap
Nutmegtoe Janglebread
Peppermintbow Evergreenspring
Peppermintdust Snowballsnow
Peppermintsnow Nutmegdustle
Puddingsnow Frostycrystal
Silverdust Janglebell
Snowbow Dashflake
Snowflakecrystal Evergreenberry
Stardrop Icegreen
Tinkerflake Garlandbell
Tinkertoes Hollybread
Tinselbite Zestycheer
Tinselspice Sugarcane
Tinseltopbite Jollydustle
Tinseltopfrost Starspring
Tinseltopplum Starsparkle
Toyberry Marshmallowwrapper
Toybow Candychime
Toybow Jollygreen
Velvetsparkle Tinkerwhisker
Warmcookie Marshmallowheart
Warmsparkle Twinklesleigh
Warmtoes Snowjangle
Whisperbells Iciclecane
Whisperdust Frostdrop
Whisperflake Peppercane
Willowberry Bubblesplum
Willowcookie Cinnamonsnow
Willowflake Toyhine
Willowwhisker Juniperplum
Winterbells Everlight
Wintercheer Emberbite
Winterdustle Hollywhisker
Zestychime Candylight
Zestyflake Mistlejangle`;

export const p1ex = () => p1(p1Example);

// A 65 Z 90 a 97 z 122
export const p1 = (_input = input) => {
	const lines = _input.split("\n");
	let max = 0;
	for (const line of lines) {
		let sum = 0;
		for (let i = 0; i < line.length; i++) {
			const charCode = line.charCodeAt(i);
			if (charCode >= 97 && charCode <= 122) {
				sum += charCode - 96;
			} else if (charCode >= 65 && charCode <= 90) {
				sum += charCode - 64;
			}
		}
		if (sum > max) {
			max = sum;
		}
	}
	return max;
};
// 708241812429884286344759437796630713073664000000000000000

export const p2ex = () => {
	const p2Example = "Whisperbread Evertoes";
	const lines = p2Example.split("\n");
	let max = BigInt(0);
	for (const line of lines) {
		let sum = BigInt(1);
		let index = 1;
		for (let i = 0; i < line.length; i++) {
			const charCode = line.charCodeAt(i);
			if (charCode >= 97 && charCode <= 122) {
				const value = charCode - 96;
				sum *= BigInt(value * index * index);
				index++;
			} else if (charCode >= 65 && charCode <= 90) {
				const value = charCode - 64;
				sum *= BigInt(value * index * index * index);
				index++;
			}
		}
		if (sum > max) {
			max = sum;
		}
	}
	return max.toLocaleString("fullwide", { useGrouping: false });
};

export const p2 = (_input = input) => {
	const lines = _input.split("\n");
	const dict: { [key: string]: { who: string; age: bigint }[] } = {};
	for (const line of lines) {
		let sum = BigInt(1);
		let index = 1;
		for (let i = 0; i < line.length; i++) {
			const charCode = line.charCodeAt(i);
			if (charCode >= 97 && charCode <= 122) {
				const value = charCode - 96;
				sum *= BigInt(value * index * index);
				index++;
			} else if (charCode >= 65 && charCode <= 90) {
				const value = charCode - 64;
				sum *= BigInt(value * index * index * index);
				index++;
			}
		}
		const char = sum.toString()[0];
		if (!char) {
			continue;
		}
		dict[char] = dict[char] || [];
		dict[char].push({ who: line, age: sum });
	}
	let unique = "not found";
	let age = BigInt(0);
	for (const key in dict) {
		if (dict[key]?.length === 1) {
			unique = dict[key][0]?.who ?? "not found";
			age = dict[key][0]?.age ?? BigInt(0);
			break;
		}
	}
	return `${unique} ${age}`;
};
// Tinselbite Zestycheer
