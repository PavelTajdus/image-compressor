import sharp from 'sharp';
import { addLog } from '$lib/db';

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const formData = await request.formData();
		const imageFile = formData.get('image');

		if (!imageFile || !(imageFile instanceof File)) {
			return new Response('Chybí obrázek', { status: 400 });
		}

		// Security: Validate file size (max 10MB)
		const MAX_SIZE = 10 * 1024 * 1024; // 10MB
		if (imageFile.size > MAX_SIZE) {
			return new Response('Soubor je příliš velký (max 10MB)', { status: 400 });
		}

		// Security: Validate file type
		const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic'];
		if (!ALLOWED_TYPES.includes(imageFile.type)) {
			return new Response('Nepodporovaný formát souboru', { status: 400 });
		}

		// Převeď File na Buffer
		const arrayBuffer = await imageFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Načti metadata obrázku
		const image = sharp(buffer);
		const metadata = await image.metadata();

		// Vygeneruj všechny formáty paralelně
		const formatPromises = [];
		
		// WebP - vždy vygeneruj
		formatPromises.push(
			sharp(buffer)
				.webp({ quality: 90, effort: 6 })
				.toBuffer()
				.then(webpBuffer => ({
					format: 'webp',
					buffer: webpBuffer.toString('base64'),
					size: webpBuffer.length,
					contentType: 'image/webp'
				}))
		);
		
		// AVIF - vždy vygeneruj
		formatPromises.push(
			sharp(buffer)
				.avif({ quality: 90, effort: 6 })
				.toBuffer()
				.then(avifBuffer => ({
					format: 'avif',
					buffer: avifBuffer.toString('base64'),
					size: avifBuffer.length,
					contentType: 'image/avif'
				}))
		);
		
		// PNG - jen pokud má alfa kanál
		if (metadata.hasAlpha) {
			formatPromises.push(
				sharp(buffer)
					.png({ quality: 90, compressionLevel: 9, palette: true })
					.toBuffer()
					.then(pngBuffer => ({
						format: 'png',
						buffer: pngBuffer.toString('base64'),
						size: pngBuffer.length,
						contentType: 'image/png'
					}))
			);
		}
		
		// Počkej na všechny formáty (paralelně)
		const formats = await Promise.all(formatPromises);
		
		// Vypočti statistiky a zaloguj
		const bestFormat = formats.reduce((prev, current) => (prev.size < current.size) ? prev : current);
		const totalCompressedSize = bestFormat.size;
		const savingsPercent = Math.round((1 - totalCompressedSize / imageFile.size) * 100);

		// Log to database
		try {
			addLog({
				filename: imageFile.name,
				original_size: imageFile.size,
				mime_type: imageFile.type,
				compressed_size: totalCompressedSize,
				savings_percent: savingsPercent,
				output_format: bestFormat.format
			});
		} catch (err) {
			console.error('Failed to log stats:', err);
		}
		
		return new Response(JSON.stringify({ formats }), {
			headers: {
				'Content-Type': 'application/json'
			}
		});

	} catch (error) {
		console.error('Chyba při kompresi:', error);
		// Security: Don't leak stack trace to client
		return new Response('Interní chyba serveru při zpracování obrázku', {
			status: 500
		});
	}
}

