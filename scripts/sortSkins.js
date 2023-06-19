import fs from 'node:fs';
import inGameSkinSets from '../data/[In-game]/skins.json' assert { type: 'json' };

inGameSkinSets.order.forEach(async (skinSet) => {
	const skinSetDetails = await import(
		`../data/[In-game]/${skinSet}/skins.json`,
		{
			assert: { type: 'json' },
		}
	).then((module) => module.default);

	skinSetDetails.order.forEach(async (skinSetDetail) => {
		const skin = fs.readFileSync(
			`./raw_skins/skin${skinSetDetail}.txt`,
			'utf8'
		);

		fs.writeFileSync(
			`./data/[In-game]/${skinSet}/skin${skinSetDetail}.txt`,
			skin
		);
	});
});
