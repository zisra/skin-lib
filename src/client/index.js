window.showImages = async (path) => {
	const modal = document.querySelector('#modal');
	const modalContent = document.querySelector('#modal-content');

	const data = await fetch(`skin/${path}`);
	const skin = await data.json();
	let skinImages = [];

	for (let image in skin.images) {
		skinImages.push(
			`<a href="${skin.images[image]}" download="${image}"><img title="${image}" alt="${image}" class="skin-image" src="${skin.images[image]}" /></a>`
		);
	}
	modalContent.innerHTML = skinImages.join('');
	modal.showModal();
};

window.closeImages = (path) => {
	document.querySelector('#modal').close();
};

window.onload = async () => {
	const pages = {
		root: document.querySelector('#root'),
		inGameSkinSet: document.querySelector('#ingame-skin-set'),
		creator: document.querySelector('#custom-creator'),
		customSet: document.querySelector('#custom-set'),
	};

	const skinCreators = document.querySelector('#skin-creators');
	const inGameSkinSets = document.querySelector('#ingame-skin-sets');
	const hiddenSkinSets = document.querySelector('#hidden-skin-sets');
	const inGameSkinSetTitle = document.querySelector('#ingame-skin-set-title');
	const inGameSkins = document.querySelector('#ingame-skins');
	const customCreatorTitle = document.querySelector('#custom-creator-title');
	const customSets = document.querySelector('#custom-sets');
	const customSetTitle = document.querySelector('#custom-set-title');
	const customSetSkins = document.querySelector('#custom-set-skins');

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
			}.txt">Download</a><button onclick="showImages('${
				skin.path
			}')" class="btn btn-image btn-block">Images</button></div>`;
		},
		customSkinElement: (skin) => {
			return `<div class="skin-card ${skin.isFinal ? 'highlight' : ''}"><h2>${
				skin.name
			}</h2><a class="btn btn-block" href="skin/${skin.path}" download="${
				skin.name
			}.txt">Download</a><button onclick="showImages('${
				skin.path
			}')" class="btn btn-image btn-block">Images</button></div>`;
		},
		inGameSkinSetButton: (set) => {
			return `<a class="btn m-5" href="#inGameSkinSet/${set.name}" role="button" >${set.name}</a>`;
		},
		creatorButton: (creator) => {
			return `<a class="btn m-5" role="button" href="#creator/${creator.name}">${creator.name}</a>`;
		},
		customSetTitle: (state) => {
			return `<a class="link" href="#creator/${state[1]}">${state[1]}</a> - ${state[2]}`;
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
		},
		creator: (state) => {
			customCreatorTitle.textContent = state[1];
			customSets.innerHTML = skins.custom
				.find((creator) => creator.name == state[1])
				.skinSets.map((skin) => builders.customSet(skin, state))
				.join('');
		},
		inGameSkinSet: (state) => {
			inGameSkinSetTitle.textContent = state[1];
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
