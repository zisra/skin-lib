import { Application, Texture, Sprite, DEG_TO_RAD, utils } from 'pixi.js';
import { CanvasRecorder } from './canvasRecorder.js';

const colors = {
	0: 0x000000, // Black
	1: 0x4d4d4d, // Gray
	2: 0x3d5dff, // Blue
	3: 0xfd3535, // Red
	4: 0x008037, // Dark Green
	5: 0xff8a2a, // Orange
	6: 0x924bff, // Purple
	7: 0x55d5ff, // Sky Blue
	8: 0x18e21f, // Light Green
	9: 0xf659ff, // Pink
	10: 0xf7ff2a, // Yellow
	11: 0xff5eae, // Rose Pink
	12: 0x93fe00, // Lime Green
	13: 0x00ffbb, // Turquoise
};

const urlParams = new URLSearchParams(window.location.search);

const TINT = colors[urlParams.get('color')] ?? colors[2];
const BACKGROUND_COLOR = urlParams.get('containerColor') ?? 0xffffff;
const RESOLUTION = urlParams.get('containerSize') || 400;
const SPRITE_SIZE = urlParams.get('size') || 256;
const IDLE = urlParams.get('idle') === 'true';
const ANIMATED = urlParams.get('animated') === 'false';
const RECORDING_BPS = urlParams.get('bitsPerSecond') || 4500000;
const RECORDING_LENGTH = urlParams.get('recordingLength') || 5000;

window.showModal = async (type, options) => {
	const modalContent = document.querySelector('#modal-content');
	const modal = document.querySelector('#modal');

	if (type === 'images') {
		const data = await fetch(`skin/${options}`);
		const skin = await data.json();
		let skinImages = [];

		for (let image in skin.images) {
			skinImages.push(
				`<a href="${skin.images[image]}" download="${image}"><img title="${image}" alt="${image}" class="skin-image" src="${skin.images[image]}" /></a>`
			);
		}
		modalContent.innerHTML = skinImages.join('');
	} else if (type === 'preview') {
		const app = new Application({
			width: RESOLUTION,
			height: RESOLUTION,
			backgroundAlpha: BACKGROUND_COLOR === 0xffffff ? 0 : 1,
			background: BACKGROUND_COLOR,
			hello: false,
		});

		modalContent.appendChild(app.view);

		(async () => {
			const data = await fetch(`skin/${options}`);
			const skin = await data.json();

			const downloadButton = document.querySelector('#download');

			downloadButton.classList.remove('invisible');

			if (skin.images[skin.spec.base]) {
				const baseTexture = await Texture.from(skin.images[skin.spec.base]);
				const baseSprite = new Sprite(baseTexture);
				baseSprite.width = SPRITE_SIZE;
				baseSprite.height = SPRITE_SIZE;
				baseSprite.tint = TINT;
				baseSprite.zIndex = 1;
				baseSprite.anchor.set(0.5);
				baseSprite.position.set(RESOLUTION / 2, RESOLUTION / 2);
				app.stage.addChild(baseSprite);
			}

			if (skin.images[skin.spec.notint]) {
				const notintTexture = await Texture.from(skin.images[skin.spec.notint]);
				const notintSprite = new Sprite(notintTexture);
				notintSprite.width = SPRITE_SIZE;
				notintSprite.height = SPRITE_SIZE;
				notintSprite.zIndex = 1;
				notintSprite.anchor.set(0.5);
				notintSprite.position.set(RESOLUTION / 2, RESOLUTION / 2);
				app.stage.addChild(notintSprite);
			}

			skin.spec.rotors
				.filter((rotor) => {
					if (rotor.visibility === '0') return true;
					if (!IDLE) {
						if (rotor.visibility === '1') return true;
						if (rotor.visibility === '2') return false;
						return true;
					} else {
						if (rotor.visibility === '1') return false;
						if (rotor.visibility === '2') return true;
						return true;
					}
				})
				.forEach((rotor) => {
					const rotorTexture = Texture.from(skin.images[rotor.img]);
					const rotorSprite = new Sprite(rotorTexture);

					const x = (rotor.x / 2) * SPRITE_SIZE + RESOLUTION / 2;
					const y = (rotor.y / 2) * SPRITE_SIZE + RESOLUTION / 2;

					rotorSprite.anchor.set(0.5);

					const rotorSize = rotor.size * SPRITE_SIZE;
					rotorSprite.width = rotorSprite.height = rotorSize;

					rotorSprite.position.set(x, y);

					if (rotor.tinted) {
						rotorSprite.tint = TINT;
					}

					rotorSprite.zIndex = rotor.layer;

					app.stage.addChild(rotorSprite);

					if (!rotor.noRotation && !ANIMATED) {
						const rotationSpeedRad = DEG_TO_RAD * -rotor.speed;

						app.ticker.add(() => {
							rotorSprite.rotation += rotationSpeedRad;
						});
					}
				});
			app.stage.sortChildren();

			downloadButton.innerText = 'Record';
			downloadButton.onclick = () => {
				downloadButton.disabled = true;
				downloadButton.innerText = 'Recording...';
				const canvas = document.querySelector('canvas');
				const recorder = new CanvasRecorder(canvas, RECORDING_BPS);
				recorder.start();

				setTimeout(() => {
					recorder.stop();
					downloadButton.disabled = false;
					downloadButton.innerText = 'Download';
				}, RECORDING_LENGTH);

				downloadButton.onclick = () => {
					recorder.save(`skin_${options}.webm`);
				};
			};
		})();
	} else if (type === 'settings') {
		modalContent.innerHTML = `<img src="${options}" />`;
	}
	modal.showModal();
};

function handleModalClose() {
	document.querySelector('#modal').close();
	document.querySelectorAll('canvas').forEach((el) => {
		el.remove();
	});
	// utils.destroyTextureCache();
	document.querySelector('#modal-content').innerHTML = '';
}

window.closeModal = () => handleModalClose();

document.querySelector('#modal').addEventListener('close', handleModalClose);

const icons = {
	home: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
	settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
};

window.onload = async () => {
	const pages = {
		root: document.querySelector('#root'),
		inGameSkinSet: document.querySelector('#ingame-skin-set'),
		creator: document.querySelector('#custom-creator'),
		customSet: document.querySelector('#custom-set'),
	};

	const skinCreators = document.querySelector('#skin-creators');
	const singleSkins = document.querySelector('#single-skins');
	const inGameSkinSets = document.querySelector('#ingame-skin-sets');
	const hiddenSkinSets = document.querySelector('#hidden-skin-sets');
	const inGameSkinSetTitle = document.querySelector('#ingame-skin-set-title');
	const inGameSkins = document.querySelector('#ingame-skins');
	const customCreatorTitle = document.querySelector('#custom-creator-title');
	const customSets = document.querySelector('#custom-sets');
	const customSetTitle = document.querySelector('#custom-set-title');
	const customSetSkins = document.querySelector('#custom-set-skins');
	const downloadButton = document.querySelector('#download-button');
	const settingsButton = document.querySelector('.settings-button');

	const data = await fetch('/skins');
	const skins = await data.json();

	const builders = {
		skinElement: (skin) => {
			return `<div class="skin-card ${skin.isFinal ? 'highlight' : ''}"><h2>${
				skin.name
			}</h2>${
				!isNaN(skin.price)
					? `<p class="skin-prize">Price: ${skin.price} <img class="inline-img" src="img/coin.png" /></p>`
					: `<p class="skin-prize">Price: ${skin.price}</p>`
			}<a class="btn btn-block" href="skin/${skin.path}" download="skin${
				skin.name
			}.txt">Download</a><button onclick="showModal('images','${
				skin.path
			}')" class="btn btn-image btn-block">Images</button><button onclick="showModal('preview','${
				skin.path
			}')" class="btn btn-image btn-block">Preview</button></div>`;
		},
		customSkinElement: (skin) => {
			return `<div class="skin-card ${skin.isFinal ? 'highlight' : ''}"><h2>${
				skin.name
			}</h2><a class="btn btn-block" href="skin/${skin.path}" download="${
				skin.name
			}.txt">Download</a><button onclick="showModal('images','${
				skin.path
			}')" class="btn btn-image btn-block">Images</button><button onclick="showModal('preview','${
				skin.path
			}')" class="btn btn-image btn-block">Preview</button></div>`;
		},
		inGameSkinSetButton: (set) => {
			return `<a class="btn m-5" href="#inGameSkinSet/${set.name}" role="button" >${set.name}</a>`;
		},
		creatorButton: (creator) => {
			return `<a class="btn m-5" role="button" href="#creator/${creator.name}">${creator.name}</a>`;
		},
		customSetTitle: (state) => {
			return `<a class="home-button" href="#">${icons.home}</a> <a class="link" href="#creator/${state[1]}">${state[1]}</a> - ${state[2]}`;
		},
		customSet: (skin, state) => {
			return `<a class="btn m-5" role="button" href="#customSet/${state[1]}/${skin.name}">${skin.name}</a>`;
		},
	};

	const states = {
		root: () => {
			skinCreators.innerHTML = skins.custom
				.map((creator) => builders.creatorButton(creator))
				.join('');
			inGameSkinSets.innerHTML = skins.inGame
				.filter((set) => set.inGame)
				.map((set) => builders.inGameSkinSetButton(set))
				.join('');
			hiddenSkinSets.innerHTML = skins.inGame
				.filter((set) => !set.inGame)
				.map((set) => builders.inGameSkinSetButton(set))
				.join('');
			downloadButton.innerHTML = `Download all ${skins.totalSkins} skins (ZIP)`;
		},
		creator: (state) => {
			customCreatorTitle.innerHTML = `<a class="home-button" href="#">${icons.home}</a> ${state[1]}`;
			if (
				skins.custom.find((creator) => creator.name == state[1]).skinSets.length
			) {
				customSets.innerHTML =
					'<div class="card buttons">' +
					skins.custom
						.find((creator) => creator.name == state[1])
						.skinSets.map((skin) => builders.customSet(skin, state))
						.join('') +
					'</div>';
			} else {
				customSets.innerHTML = '';
			}
			if (
				skins.custom.find((creator) => creator.name == state[1]).singleSkins
					.length
			) {
				singleSkins.innerHTML = skins.custom
					.find((creator) => creator.name == state[1])
					.singleSkins.map((skin) =>
						builders.customSkinElement({
							...skin,
							path: `custom/${state[1]}/${skin.name}`,
						})
					);
			} else {
				singleSkins.innerHTML = '';
			}
		},
		inGameSkinSet: (state) => {
			inGameSkinSetTitle.innerHTML = `<a class="home-button" href="#">${icons.home}</a> ${state[1]}`;
			inGameSkins.innerHTML = skins.inGame
				.find((set) => set.name == state[1])
				.skins.map((skin) =>
					builders.skinElement({
						...skin,
						path: `inGame/${state[1]}/${skin.name}`,
					})
				)
				.join('');
		},
		customSet: (state) => {
			customSetTitle.innerHTML = builders.customSetTitle(state);
			customSetSkins.innerHTML = skins.custom
				.find((creator) => creator.name == state[1])
				.skinSets.find((set) => set.name == state[2])
				.skins.map((skin) =>
					builders.customSkinElement({
						...skin,
						path: `custom/${state[1]}/${state[2]}/${skin.name}`,
					})
				)
				.join('');
		},
	};

	function checkState() {
		window.closeModal();
		const currentState = decodeURIComponent(
			new URL(document.URL).hash.replace('#', '')
		).split('/');

		settingsButton.innerHTML = icons.settings;
		settingsButton.classList.remove('invisible');

		document.querySelectorAll('.container').forEach((el) => {
			el.classList.add('invisible');
		});
		if (currentState[0] === '') {
			states.root(currentState);
			pages.root.classList.remove('invisible');
		} else if (states[currentState[0]]) {
			try {
				states[currentState[0]](currentState);
				pages[currentState[0]].classList.remove('invisible');
			} catch (err) {
				console.error(err);
				states.root(currentState);
				pages.root.classList.remove('invisible');
			}
		} else {
			states.root(currentState);
			pages.root.classList.remove('invisible');
		}
	}

	checkState();

	window.onhashchange = () => {
		checkState();
	};
};
