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
				isFinal: inGameSkinFiles.final === skin,
				price: inGameSkinFiles.prices[inGameSkinFiles.order.indexOf(skin)],
			});
		});

		inGame.push({
			name: category,
			skins: inGameSkins,
			inGame: inGameSkinFiles.inGame,
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

app.get('/skin/custom/:creator/:set/:name', (req, res) => {
	res.sendFile(
		`./data/${req.params.creator}/${req.params.set}/${req.params.name}.txt`,
		{
			root: process.cwd(),
		}
	);
});

app.get('/skin/inGame/:set/:name', (req, res) => {
	res.sendFile(
		`./data/[In-game]/${req.params.set}/skin${req.params.name}.txt`,
		{
			root: process.cwd(),
		}
	);
});

app.get('/skin/custom/:creator/:name', (req, res) => {
	res.sendFile(
		`./data/${creatorsFiles[req.params.creator]}/[Single]/${
			singleSkinFiles[req.params.name]
		}.txt`,
		{
			root: process.cwd(),
		}
	);
});

app.use(express.static('./dist'));
app.use(express.static('./src/static'));

app.listen(process.env.PORT || 3000, () => {
	console.log('Server listening');
});
