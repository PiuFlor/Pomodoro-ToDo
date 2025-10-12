// scripts/prepare-electron.js
import fs from 'fs';
import path from 'path';

// Copiar package.json para producción
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Mantener solo dependencias necesarias
const electronPackage = {
  ...packageJson,
  scripts: {
    start: 'next start'
  },
  devDependencies: {}
};

fs.writeFileSync(
  'dist/package.json', 
  JSON.stringify(electronPackage, null, 2)
);

console.log('✅ Preparación para Electron completada');