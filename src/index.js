import express from 'express';
import fs from 'node:fs';

const app = express();

function filterDotFiles(array) {
	return array.filter((str) => !str.startsWith('.'));
}

function getSkins() {
	let totalSkins = 0;
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

		if (fs.existsSync(`./data/${creatorsFiles[creator]}/[Single]`)) {
			const singleSkinFiles = filterDotFiles(
				fs.readdirSync(`./data/${creatorsFiles[creator]}/[Single]`)
			);
			for (let singleSkin in singleSkinFiles) {
				singleSkins.push({
					name: singleSkinFiles[singleSkin].replace('.txt', ''),
				});
				totalSkins++;
			}
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
				totalSkins++;
			});

			sets.push({ name: setFiles[set], skins });
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
			totalSkins++;
		});

		inGame.push({
			name: category,
			skins: inGameSkins,
			inGame: inGameSkinFiles.inGame,
		});
	});

	return {
		totalSkins,
		custom: creators,
		inGame,
	};
}

app.get('/skins', (req, res) => {
	res.json(getSkins());
});

app.get('/skin/custom/:creator/:set/:name', (req, res) => {
	res.download(
		`./data/${req.params.creator}/${req.params.set}/${req.params.name}.txt`,
		`skin${req.params.name}`,
		{
			root: process.cwd(),
		}
	);
});

app.get('/skin/inGame/:set/:name', (req, res) => {
	res.download(
		`./data/[In-game]/${req.params.set}/skin${req.params.name}.txt`,
		req.params.name,
		{
			root: process.cwd(),
		}
	);
});

app.get('/skin/custom/:creator/:name', (req, res) => {
	res.download(
		`./data/${req.params.creator}/[Single]/${req.params.name}.txt`,
		req.params.name,
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
