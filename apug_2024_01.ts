const p1Example = `Whisperbread Evertoes
Warmstripe Chestnutplum
Marshmallowwhisker Juniperheart`;

const p1input = `Candyflake Icelight
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
export const p1 = (_input = p1input) => {
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
