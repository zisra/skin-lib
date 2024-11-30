import fs from 'node:fs';

const MAX_SKINS = 138;

const originalSkinData = JSON.parse(
	fs.readFileSync('./cache/originalSkins.json', 'utf8')
);

const skinData = JSON.parse(fs.readFileSync('./cache/allSkins.json', 'utf8'));

function getSkin(skin) {
	if (skin === 80) {
		fs.writeFileSync(
			`./cache/raw_skins/skin80.txt`,
			fs.readFileSync(`./cache/skin80.txt`)
		);
		return;
	}

	const finalSkin = {};
	finalSkin.spec = skinData.specs[skin];
	finalSkin.images = {};

	if (skinData.specs[skin].base) {
		const imageName = skinData.specs[skin].base;
		finalSkin.images[imageName] = skinData.images[imageName];
	}
	if (skinData.specs[skin].notint) {
		const imageName = skinData.specs[skin].notint;
		finalSkin.images[imageName] = skinData.images[imageName];
	}

	const rotors = skinData.specs[skin].rotors.map((i) => i.img);
	rotors.forEach((rotor) => {
		finalSkin.images[rotor] = skinData.images[rotor];
	});

	fs.writeFileSync(
		`./cache/raw_skins/skin${skin}.txt`,
		JSON.stringify(finalSkin)
	);
}

function getOriginalSkin(skin) {
	const file = originalSkinData[skin];
	const final = {
		spec: {
			base: '',
			notint: '',
			rotors: [],
			size: 1,
		},
		images: {},
	};

	final.spec.base = file.base;
	final.images[file.base] =
		'data:image/png;base64,' +
		fs.readFileSync(`./cache/raw_images/${file.base}.png`, 'base64');

	final.spec.notint = file.notint;
	final.images[file.notint] =
		'data:image/png;base64,' +
		fs.readFileSync(`./cache/raw_images/${file.notint}.png`, 'base64');

	file.rotors.forEach((i) => {
		final.images[i.img] =
			'data:image/png;base64,' +
			fs.readFileSync(`./cache/raw_images/${i.img}.png`, 'base64');
		final.spec.rotors.push({
			...i,
			visibility: '0',
			fixedRotation: false,
			noRotation: false,
			tinted: false,
			layer: i.layer !== undefined ? i.layer : 1,
		});
	});
	fs.writeFileSync(`./cache/raw_skins/skin${skin}.txt`, JSON.stringify(final));
}

Array.from({ length: MAX_SKINS }, (_, i) => i + 1).forEach((skin) => {
	if (skin <= 25) {
		getOriginalSkin(skin);
	} else {
		getSkin(skin);
	}
});

console.log('Done!');
