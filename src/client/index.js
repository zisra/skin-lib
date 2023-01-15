import './index.css';

window.onload = async () => {
	const pages = {
		root: document.querySelector('#root'),
		inGameSkinSet: document.querySelector('#ingame-skin-set'),
	};

	const skinCreators = document.querySelector('#skin-creators');
	const inGameSkinSets = document.querySelector('#ingame-skin-sets');
	const hiddenSkinSets = document.querySelector('#hidden-skin-sets');
	const inGameSkinSetTitle = document.querySelector('#ingame-skin-set-title');
	const inGameSkins = document.querySelector('#ingame-skins');

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
			}<a class="btn" href="skin/${skin.path}" download="skin-${
				skin.name
			}.txt">Download</a></div>`;
		},
	};

	const states = {
		root: () => {
			skinCreators.innerHTML = skins.custom
				.map(
					(creator) =>
						`<a class="btn m-5" role="button" href="#creator/${creator.name}">${creator.name}</a>`
				)
				.join('');
			inGameSkinSets.innerHTML = skins.inGame
				.filter((set) => set.inGame)
				.map(
					(set) =>
						`<a class="btn m-5" href="#inGameSkinSet/${set.name}" role="button" >${set.name}</a>`
				)
				.join('');
			hiddenSkinSets.innerHTML = skins.inGame
				.filter((set) => !set.inGame)
				.map(
					(set) =>
						`<a class="btn m-5" href="#inGameSkinSet/${set.name}" role="button" >${set.name}</a>`
				)
				.join('');
			pages.root.classList.remove('invisible');
		},
		creator: () => {},
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

			pages.inGameSkinSet.classList.remove('invisible');
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
		} else if (states[currentState[0]]) {
			states[currentState[0]](currentState);
		}
	}

	checkState();

	window.onhashchange = () => {
		checkState();
	};
};
