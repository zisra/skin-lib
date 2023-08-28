import fs from 'node:fs';
import inGameSkinSets from '../data/[In-game]/skinSets.json' assert { type: 'json' };

inGameSkinSets.order.forEach(async (skinSet) => {
	const skinSetDetails = JSON.parse(
		fs.readFileSync(`./data/[In-game]/${skinSet}/skins.json`)
	);

	skinSetDetails.order.forEach(async (skinSetDetail) => {
		const skin = fs.readFileSync(
			`./cache/raw_skins/skin${skinSetDetail}.txt`,
			'utf8'
		);

		fs.writeFileSync(
			`./data/[In-game]/${skinSet}/skin${skinSetDetail}.txt`,
			skin
		);
	});
});
