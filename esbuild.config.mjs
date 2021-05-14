import esbuild from 'esbuild';
import glob from 'glob';
import { copy, scan } from 'fs-nextra';
import { extname } from 'path';

const files = glob('src/**/*.ts', { sync: true });
const watchMode = process.argv[2] && process.argv[2].includes('watch');

await esbuild.build({
	entryPoints: files,
	format: 'cjs',
	resolveExtensions: ['.ts', '.js', '.json'],
	write: true,
	outdir: 'dist',
	platform: 'node',
	tsconfig: 'src/tsconfig.json',
	watch: watchMode,
	incremental: watchMode,
	sourcemap: true
});

// esbuild doesn't let you just copy over all JSON files
for (const [fileName, file] of await scan(`${process.cwd()}/src/languages`, { filter: (handle, path) => handle.isFile() && extname(path) === '.json' })) {
	await copy(fileName, fileName.replace(/src/g, 'dist'));
}
