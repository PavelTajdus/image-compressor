import sharp from 'sharp';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const imageFile = formData.get('image');

		if (!imageFile || !(imageFile instanceof File)) {
			return new Response('Chybí obrázek', { status: 400 });
		}

		// Převeď File na Buffer
		const arrayBuffer = await imageFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Načti metadata obrázku
		const image = sharp(buffer);
		const metadata = await image.metadata();

		// Vygeneruj všechny formáty
		const formats = [];

		// WebP - vždy vygeneruj
		const webpBuffer = await sharp(buffer)
			.webp({
				quality: 90,
				effort: 6
			})
			.toBuffer();

		formats.push({
			format: 'webp',
			buffer: webpBuffer.toString('base64'),
			size: webpBuffer.length,
			contentType: 'image/webp'
		});

		// AVIF - vždy vygeneruj
		const avifBuffer = await sharp(buffer)
			.avif({
				quality: 85,
				effort: 4
			})
			.toBuffer();

		formats.push({
			format: 'avif',
			buffer: avifBuffer.toString('base64'),
			size: avifBuffer.length,
			contentType: 'image/avif'
		});

		// PNG - jen pokud má alfa kanál
		if (metadata.hasAlpha) {
			const pngBuffer = await sharp(buffer)
				.png({
					quality: 90,
					compressionLevel: 9,
					palette: true
				})
				.toBuffer();

			formats.push({
				format: 'png',
				buffer: pngBuffer.toString('base64'),
				size: pngBuffer.length,
				contentType: 'image/png'
			});
		}

		return new Response(JSON.stringify({ formats }), {
			headers: {
				'Content-Type': 'application/json'
			}
		});

	} catch (error) {
		console.error('Chyba při kompresi:', error);
		return new Response('Chyba při kompresi obrázku: ' + error.message, {
			status: 500
		});
	}
}

