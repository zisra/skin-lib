import express from 'express';
import fs from 'node:fs';

const app = express();

function filterDotFiles(array) {
	return array.filter((str) => !str.startsWith('.'));
}

function getSkins() {
	let creators = [];
	let creatorsFiles = filterDotFiles(
		fs.readdirSync('./data').filter((dir) => dir !== '[In-game]')
	);

	for (let creator in creatorsFiles) {
		let sets = [];
		const setFiles = filterDotFiles(
			fs
				.readdirSync(`./data/${creatorsFiles[creator]}`)
				.filter((dir) => dir !== '[Single]')
		);

		let singleSkins = [];
		const singleSkinFiles = filterDotFiles(
			fs.readdirSync(`./data/${creatorsFiles[creator]}/[Single]`)
		);

		if (singleSkinFiles.length) {
			for (let singleSkin in singleSkinFiles) {
				singleSkins.push({
					name: singleSkinFiles[singleSkin],
					data: fs.readFileSync(
						`./data/${creatorsFiles[creator]}/[Single]/${singleSkinFiles[singleSkin]}`,
						'utf8'
					),
				});
			}

			for (let set in setFiles) {
				let skins = [];
				const skinFiles = JSON.parse(
					fs.readFileSync(
						`./data/${creatorsFiles[creator]}/${setFiles[set]}/skins.json`,
						'utf8'
					)
				);

				skinFiles.order.forEach((skin) => {
					skins.push({
						name: skin,
						data: fs.readFileSync(
							`./data/${creatorsFiles[creator]}/${setFiles[set]}/${skin}.txt`,
							'utf8'
						),
					});
				});

				sets.push({ name: setFiles[set], skins });
			}
		}

		creators.push({
			name: creatorsFiles[creator],
			skinSets: sets,
			singleSkins,
		});
	}

	let inGame = [];
	let inGameFiles = JSON.parse(fs.readFileSync('./data/[In-game]/skins.json'));

	inGameFiles.order.forEach((category) => {
		let inGameSkins = [];
		const inGameSkinFiles = JSON.parse(
			fs.readFileSync(`./data/[In-game]/${category}/skins.json`, 'utf8')
		);

		inGameSkinFiles.order.forEach((skin) => {
			inGameSkins.push({
				name: skin,
				price: inGameSkinFiles.prices[inGameSkinFiles.order.indexOf(skin)],
				data: fs.readFileSync(
					`./data/[In-game]/${category}/skin${skin}.txt`,
					'utf8'
				),
			});
		});

		inGame.push({
			name: category,
			skins: inGameSkins,
		});
	});

	return {
		custom: creators,
		inGame,
	};
}

app.get('/skins', (req, res) => {
	res.json(getSkins());
});

app.listen(process.env.PORT || 3000, () => {
	console.log('Server listening');
});
