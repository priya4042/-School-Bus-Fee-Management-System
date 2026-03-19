import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptFile), '..');

const paths = {
	branding: path.join(rootDir, 'resources', 'branding'),
	publicDir: path.join(rootDir, 'public'),
	resourcesDir: path.join(rootDir, 'resources'),
	storeAssetsDir: path.join(rootDir, 'store-assets')
};

const readSvg = async (fileName) => {
	const filePath = path.join(paths.branding, fileName);
	return fs.readFile(filePath);
};

const ensureDirs = async () => {
	await fs.mkdir(paths.publicDir, { recursive: true });
	await fs.mkdir(paths.resourcesDir, { recursive: true });
	await fs.mkdir(paths.storeAssetsDir, { recursive: true });
};

const pngFromSvg = async ({ svgBuffer, width, height, outputPath }) => {
	await sharp(svgBuffer)
		.resize(width, height, { fit: 'contain' })
		.png({ compressionLevel: 9, quality: 100 })
		.toFile(outputPath);
};

const createFeatureGraphic = async ({ iconPath, outputPath }) => {
	const width = 1024;
	const height = 500;

	const backgroundSvg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
			<defs>
				<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="#0A3B66"/>
					<stop offset="100%" stop-color="#1066B3"/>
				</linearGradient>
			</defs>
			<rect width="${width}" height="${height}" fill="url(#bg)"/>
			<circle cx="980" cy="-80" r="220" fill="#FFFFFF" fill-opacity="0.08"/>
			<circle cx="40" cy="460" r="170" fill="#FFFFFF" fill-opacity="0.06"/>
			<text x="350" y="212" font-family="Poppins, Segoe UI, Arial, sans-serif" font-size="88" font-weight="700" fill="#FFFFFF">BusWay Pro</text>
			<text x="350" y="290" font-family="Poppins, Segoe UI, Arial, sans-serif" font-size="36" font-weight="500" fill="#D9EEFF">Smart School Transport and Fee Management</text>
		</svg>`;

	const bgBuffer = await sharp(Buffer.from(backgroundSvg)).png().toBuffer();
	const iconBuffer = await sharp(iconPath).resize(280, 280).png().toBuffer();

	await sharp(bgBuffer)
		.composite([
			{
				input: iconBuffer,
				left: 80,
				top: 90
			}
		])
		.png({ compressionLevel: 9, quality: 100 })
		.toFile(outputPath);
};

const main = async () => {
	await ensureDirs();

	const iconSvg = await readSvg('app-icon.svg');
	const markSvg = await readSvg('app-mark.svg');
	const logoSvg = await readSvg('app-logo.svg');

	await fs.copyFile(path.join(paths.branding, 'app-icon.svg'), path.join(paths.publicDir, 'favicon.svg'));
	await fs.copyFile(path.join(paths.branding, 'app-logo.svg'), path.join(paths.publicDir, 'brand-logo.svg'));

	const outputs = [
		{ svgBuffer: iconSvg, width: 1024, height: 1024, outputPath: path.join(paths.resourcesDir, 'icon.png') },
		{ svgBuffer: markSvg, width: 1024, height: 1024, outputPath: path.join(paths.resourcesDir, 'icon-foreground.png') },
		{ svgBuffer: iconSvg, width: 2732, height: 2732, outputPath: path.join(paths.resourcesDir, 'splash.png') },
		{ svgBuffer: iconSvg, width: 512, height: 512, outputPath: path.join(paths.publicDir, 'logo512.png') },
		{ svgBuffer: iconSvg, width: 192, height: 192, outputPath: path.join(paths.publicDir, 'logo192.png') },
		{ svgBuffer: iconSvg, width: 180, height: 180, outputPath: path.join(paths.publicDir, 'apple-touch-icon.png') },
		{ svgBuffer: iconSvg, width: 32, height: 32, outputPath: path.join(paths.publicDir, 'favicon-32x32.png') },
		{ svgBuffer: iconSvg, width: 16, height: 16, outputPath: path.join(paths.publicDir, 'favicon-16x16.png') },
		{ svgBuffer: iconSvg, width: 512, height: 512, outputPath: path.join(paths.storeAssetsDir, 'playstore-icon-512.png') },
		{ svgBuffer: iconSvg, width: 1024, height: 1024, outputPath: path.join(paths.storeAssetsDir, 'appstore-icon-1024.png') },
		{ svgBuffer: logoSvg, width: 1800, height: 560, outputPath: path.join(paths.storeAssetsDir, 'brand-logo-1800x560.png') }
	];

	for (const output of outputs) {
		await pngFromSvg(output);
	}

	const featureIconPath = path.join(paths.resourcesDir, 'icon.png');
	const featureGraphicPath = path.join(paths.storeAssetsDir, 'playstore-feature-graphic-1024x500.png');
	await createFeatureGraphic({ iconPath: featureIconPath, outputPath: featureGraphicPath });

	console.log('Brand assets generated successfully.');
	console.log('- PWA assets: public/');
	console.log('- Capacitor assets source: resources/');
	console.log('- Store listing assets: store-assets/');
};

main().catch((error) => {
	console.error('Failed to generate brand assets:', error);
	process.exitCode = 1;
});
