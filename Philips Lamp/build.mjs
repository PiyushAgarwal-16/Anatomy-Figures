import { readFileSync, writeFileSync } from 'node:fs';
import { roundedPlan, iso, cameraOf } from '/Users/piyushagarwal/.agents/skills/anatomy/kit/iso-kit.mjs';
const helper = `const RADIANS=Math.PI/180, UNIT=Math.sqrt(1.6), AZIMUTH=45,ELEVATION=30;\n${cameraOf}\n${iso}\n${roundedPlan}\n`;
writeFileSync('philips-61013.html',readFileSync('page.html','utf8').replace('/* MODEL_SCRIPT */',helper+readFileSync('lamp.js','utf8')));
console.log('Built philips-61013.html');
