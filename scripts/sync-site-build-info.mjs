import { readFile, writeFile } from 'node:fs/promises';
import { APP_VERSION, BUILD_DATE } from '../shared/build-info.mjs';

const templatePath = new URL('../site/public/404.html.template', import.meta.url);
const outputPath = new URL('../site/public/404.html', import.meta.url);
const template = await readFile(templatePath, 'utf8');
const output = template
  .replaceAll('__APP_VERSION__', APP_VERSION)
  .replaceAll('__BUILD_DATE__', BUILD_DATE);

if (output.includes('__APP_VERSION__') || output.includes('__BUILD_DATE__')) {
  throw new Error('The 404 template still contains an unresolved build placeholder.');
}

await writeFile(outputPath, output);
