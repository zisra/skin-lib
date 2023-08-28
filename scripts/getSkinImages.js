import { ofetch } from 'ofetch';
import sharp from 'sharp';
import fs from 'fs';

const baseURL = 'https://defly.io/img/';

const files = [
	'spritesheet.png',
	'spritesheet.json',
	'spritesheet9.png',
	'spritesheet9.json',
	'spritesheet92.png',
	'spritesheet92.json',
];

const requests = files.map((file) => {
	const fileExtension = file.split('.')[1];
	return ofetch(file, {
		responseType: fileExtension === 'png' ? 'arrayBuffer' : 'json',
		baseURL,
	});
});

const createImage = (image, JSON) => {
	Object.keys(JSON.frames).forEach((i, index) => {
		i = JSON.frames[i];
		sharp(image)
			.extract({
				width: i.frame.w,
				height: i.frame.w,
				left: i.frame.x,
				top: i.frame.y,
			})
			.toBuffer({ resolveWithObject: true })
			.then(({ data }) => {
				fs.writeFileSync(
					`./cache/raw_images/${Object.keys(JSON.frames)[index]}.png`,
					data
				);
			})
			.catch((err) => {
				console.error(err);
			});
	});
};

console.log('Making requests...');

Promise.all(requests).then((results) => {
	const [image0, JSON0, image9, JSON9, image92, JSON92] = results;
	createImage(image0, JSON0);
	createImage(image9, JSON9);
	createImage(image92, JSON92);
});
