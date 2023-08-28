import { ofetch } from 'ofetch';
import fs from 'fs';

const response = await ofetch('https://defly.io/img/add-skins.js', {
    responseType: "text",
});

fs.writeFileSync('./cache/allSkins.json', response)