import { Application, Texture, Sprite, DEG_TO_RAD } from 'pixi.js';
import { CanvasRecorder } from './canvasRecorder.js';

const html = (strings, ...values) =>
	strings.reduce(
		(acc, str, i) => acc + str + (values[i] === undefined ? '' : values[i]),
		''
	);

window.showModal = async (type, options) => {
	const modalContent = document.querySelector('#modal-content');
	const modal = document.querySelector('#modal');
	const colorSelect = document.querySelector('#color-select');
	const idleSelect = document.querySelector('#idle-select');

	if (type === 'images') {
		const data = await fetch(`skin/${options}`);
		const skin = await data.json();
		let skinImages = [];

		for (let image in skin.images) {
			skinImages.push(
				html`<a href="${skin.images[image]}" download="${image}"
					><img
						title="${image}"
						alt="${image}"
						class="skin-image"
						src="${skin.images[image]}"
				/></a>`
			);
		}
		modalContent.innerHTML = skinImages.join('');
	} else if (type === 'preview') {
		showSkinPreview(options, {
			color: colorSelect.value,
			idle: idleSelect.value === 'idle',
		});
	}
	modal.showModal();
};

async function showSkinPreview(id, previewOptions) {
	const modalContent = document.querySelector('#modal-content');
	const colorSelect = document.querySelector('#color-select');
	const idleSelect = document.querySelector('#idle-select');
	const skinDownloadButton = document.querySelector('#skin-download');
	const skinImageDownloadButton = document.querySelector('#download-image');
	const previewButtons = document.querySelector('#preview-buttons');

	const TINT = previewOptions?.color ?? '3d5dff';
	const BACKGROUND_COLOR = previewOptions?.containerColor ?? 0xffffff;
	const RESOLUTION = previewOptions?.containerSize || 400;
	const SPRITE_SIZE = previewOptions?.size || 256;
	const IDLE = previewOptions?.idle === true;
	const ANIMATED = previewOptions?.animated === false;

	const RECORDING_BPS = previewOptions?.bitsPerSecond || 4500000;
	const RECORDING_LENGTH = previewOptions?.recordingLength || 5000;

	previewButtons.classList.remove('invisible');

	const app = new Application({
		width: RESOLUTION,
		height: RESOLUTION,
		backgroundAlpha: BACKGROUND_COLOR === 0xffffff ? 0 : 1,
		background: BACKGROUND_COLOR,
		hello: false,
		resolution: 1,
	});

	modalContent.appendChild(app.view);
	const data = await fetch(`skin/${id}`);
	const skin = await data.json();

	if (skin.images[skin.spec.base]) {
		const baseTexture = Texture.from(skin.images[skin.spec.base]);
		const baseSprite = new Sprite(baseTexture);
		baseSprite.width = SPRITE_SIZE;
		baseSprite.height = SPRITE_SIZE;
		baseSprite.tint = TINT;
		baseSprite.anchor.set(0.5);
		baseSprite.position.set(RESOLUTION / 2, RESOLUTION / 2);
		app.stage.addChild(baseSprite);
	}

	if (skin.images[skin.spec.notint]) {
		const notintTexture = Texture.from(skin.images[skin.spec.notint]);
		const notintSprite = new Sprite(notintTexture);
		notintSprite.width = SPRITE_SIZE;
		notintSprite.height = SPRITE_SIZE;
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

			if (rotor.layer <= app.stage.children.length) {
				app.stage.addChildAt(rotorSprite, rotor.layer);
			} else {
				app.stage.addChild(rotorSprite);
			}

			if (!rotor.noRotation && !ANIMATED) {
				const rotationSpeedRad = DEG_TO_RAD * -rotor.speed;

				app.ticker.add(() => {
					rotorSprite.rotation += rotationSpeedRad;
				});
			}
		});

	app.stage.sortChildren();

	skinDownloadButton.innerText = 'Record';
	skinDownloadButton.onclick = () => {
		skinDownloadButton.disabled = true;
		skinDownloadButton.innerText = 'Recording...';
		const canvas = document.querySelector('canvas');
		const recorder = new CanvasRecorder(canvas, RECORDING_BPS);
		recorder.start();

		setTimeout(() => {
			recorder.stop();
			skinDownloadButton.disabled = false;
			skinDownloadButton.innerText = 'Download';
		}, RECORDING_LENGTH);

		skinDownloadButton.onclick = () => {
			recorder.save(`skin_${id}.webm`);
		};
	};

	colorSelect.onchange = () => {
		document.querySelectorAll('canvas').forEach((el) => {
			el.remove();
		});

		showSkinPreview(id, {
			color: colorSelect.value,
			idle: idleSelect.value === 'idle',
		});
	};
	idleSelect.onchange = () => {
		document.querySelectorAll('canvas').forEach((el) => {
			el.remove();
		});

		showSkinPreview(id, {
			color: colorSelect.value,
			idle: idleSelect.value === 'idle',
		});
	};

	skinImageDownloadButton.onclick = () => {
		const canvas = document.querySelector('canvas');
		const image = canvas.toDataURL();
		const imageLink = document.createElement('a');
		imageLink.download = `skin_${id}.png`;
		imageLink.href = image;
		imageLink.click();
	};
}

function handleModalClose() {
	const previewButtons = document.querySelector('#preview-buttons');

	document.querySelector('#modal').close();
	previewButtons.classList.add('invisible');
	document.querySelectorAll('canvas').forEach((el) => {
		el.remove();
	});
	document.querySelector('#modal-content').innerHTML = '';
}

window.closeModal = () => handleModalClose();

document.querySelector('#modal').addEventListener('close', handleModalClose);

const icons = {
	home: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
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

	const data = await fetch('/skins');
	const skins = await data.json();

	const builders = {
		skinElement: (skin) => {
			return html`<div class="skin-card ${skin.isFinal ? 'highlight' : ''}">
				<h2>${skin.name}</h2>
				${!isNaN(skin.price)
					? html`<p class="skin-prize">
							Price: ${skin.price} <img class="inline-img" src="img/coin.png" />
					  </p>`
					: html`<p class="skin-prize">Price: ${skin.price}</p>`}<a
					class="btn btn-block"
					href="skin/${skin.path}"
					>Download</a
				><button
					onclick="showModal('images','${skin.path}')"
					class="btn btn-image btn-block"
				>
					Images</button
				><button
					onclick="showModal('preview','${skin.path}')"
					class="btn btn-image btn-block"
				>
					Preview
				</button>
			</div>`;
		},
		customSkinElement: (skin) => {
			return html`<div class="skin-card ${skin.isFinal ? 'highlight' : ''}">
				<h2>${skin.name}</h2>
				<a class="btn btn-block" href="skin/${skin.path}">Download</a
				><button
					onclick="showModal('images','${skin.path}')"
					class="btn btn-image btn-block"
				>
					Images</button
				><button
					onclick="showModal('preview','${skin.path}')"
					class="btn btn-image btn-block"
				>
					Preview
				</button>
			</div>`;
		},
		inGameSkinSetButton: (set) => {
			return html`<a
				class="btn m-5"
				href="#inGameSkinSet/${set.name}"
				role="button"
				>${set.name}</a
			>`;
		},
		creatorButton: (creator) => {
			return html`<a
				class="btn m-5"
				role="button"
				href="#creator/${creator.name}"
				>${creator.name}</a
			>`;
		},
		customSetTitle: (state) => {
			return html`<a class="home-button" href="#">${icons.home}</a>
				<a class="link" href="#creator/${state[1]}">${state[1]}</a> -
				${state[2]}`;
		},
		customSet: (skin, state) => {
			return html`<a
				class="btn m-5"
				role="button"
				href="#customSet/${state[1]}/${skin.name}"
				style="${skin.color
					? `background-color: #${skin.color};`
					: ''} ${skin.textColor ? `color: #${skin.textColor};` : ''} "
				>${skin.name}</a
			>`;
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
			downloadButton.innerHTML = `Download all skins (ZIP)`;
		},
		creator: (state) => {
			customCreatorTitle.innerHTML = html`<a class="home-button" href="#"
					>${icons.home}</a
				>
				${state[1]}`;
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
					)
					.join('');
			} else {
				singleSkins.innerHTML = '';
			}
		},
		inGameSkinSet: (state) => {
			inGameSkinSetTitle.innerHTML = html`<a class="home-button" href="#"
					>${icons.home}</a
				>
				${state[1]}`;
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
