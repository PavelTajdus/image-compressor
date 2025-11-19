<script>
	let dragActive = false;
	let processing = false;
	let images = [];

	function handleDragOver(e) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave() {
		dragActive = false;
	}

	async function handleDrop(e) {
		e.preventDefault();
		dragActive = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			await processFiles(Array.from(files));
		}
	}

	async function handleFileInput(e) {
		const files = e.target.files;
		if (files && files.length > 0) {
			await processFiles(Array.from(files));
		}
	}

	async function processFiles(files) {
		processing = true;

		try {
			const processedImages = await Promise.all(
				files.map(async (file) => {
					const originalSize = file.size;
					const originalPreview = URL.createObjectURL(file);

					const formData = new FormData();
					formData.append('image', file);

					const response = await fetch('/api/compress', {
						method: 'POST',
						body: formData
					});

					if (!response.ok) {
						throw new Error(`Komprese selhala pro ${file.name}`);
					}

					const data = await response.json();

					// Vytvoř název souboru bez přípony
					const originalName = file.name;
					const lastDotIndex = originalName.lastIndexOf('.');
					const nameWithoutExt = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;

					// Zpracuj všechny formáty
					const compressedFormats = data.formats.map(format => {
						const blob = base64ToBlob(format.buffer, format.contentType);
						const newFileName = `${nameWithoutExt}_c.${format.format}`;
						const compressedFile = new File([blob], newFileName, {
							type: format.contentType
						});
						const preview = URL.createObjectURL(blob);

						return {
							format: format.format,
							file: compressedFile,
							size: format.size,
							preview: preview,
							contentType: format.contentType
						};
					});

					return {
						originalFile: file,
						originalSize,
						originalPreview,
						formats: compressedFormats
					};
				})
			);

			images = processedImages;
		} catch (error) {
			alert('Chyba při kompresi: ' + error.message);
		} finally {
			processing = false;
		}
	}

	function base64ToBlob(base64, contentType) {
		const byteCharacters = atob(base64);
		const byteArrays = [];

		for (let i = 0; i < byteCharacters.length; i++) {
			byteArrays.push(byteCharacters.charCodeAt(i));
		}

		const byteArray = new Uint8Array(byteArrays);
		return new Blob([byteArray], { type: contentType });
	}

	function downloadFormat(format) {
		const url = URL.createObjectURL(format.file);
		const a = document.createElement('a');
		a.href = url;
		a.download = format.file.name;
		a.click();
		URL.revokeObjectURL(url);
	}

	function downloadAll() {
		images.forEach(image => {
			image.formats.forEach(format => {
				downloadFormat(format);
			});
		});
	}

	function reset() {
		images.forEach(image => {
			if (image.originalPreview) URL.revokeObjectURL(image.originalPreview);
			image.formats?.forEach(format => {
				if (format.preview) URL.revokeObjectURL(format.preview);
			});
		});
		images = [];
	}

	function formatSize(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}

	function getSavings(originalSize, compressedSize) {
		if (!originalSize || !compressedSize) return 0;
		return Math.round((1 - compressedSize / originalSize) * 100);
	}

	function getBestFormat(image) {
		if (!image.formats || image.formats.length === 0) return null;
		return image.formats.reduce((best, current) =>
			current.size < best.size ? current : best
		);
	}

	function getTotalSavings() {
		const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
		const totalCompressed = images.reduce((sum, img) => {
			const best = getBestFormat(img);
			return sum + (best ? best.size : 0);
		}, 0);
		if (!totalOriginal || !totalCompressed) return 0;
		return Math.round((1 - totalCompressed / totalOriginal) * 100);
	}
</script>

<svelte:head>
	<title>Image Compressor</title>
</svelte:head>

<div class="container">
	<header>
		<div class="logo">
			<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
				<rect width="48" height="48" rx="12" fill="#3b82f6"/>
				<path d="M14 19L24 14L34 19V29L24 34L14 29V19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M24 24V34" stroke="white" stroke-width="2" stroke-linecap="round"/>
				<path d="M14 19L24 24L34 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
		<h1>Image Compressor</h1>
		<p>Zkomprimuj své obrázky bez ztráty kvality</p>
	</header>

	{#if images.length === 0}
		<div 
			class="upload-zone" 
			class:drag-active={dragActive}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:drop={handleDrop}
			role="button"
			tabindex="0"
		>
			{#if processing}
				<div class="processing">
					<div class="spinner"></div>
					<p>Komprimuji obrázky...</p>
				</div>
			{:else}
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
					<polyline points="17 8 12 3 7 8"/>
					<line x1="12" y1="3" x2="12" y2="15"/>
				</svg>
				<h2>Přetáhni obrázky sem</h2>
				<p>nebo</p>
				<label for="file-input" class="file-label">
					Vyber soubory
					<input
						id="file-input"
						type="file"
						accept="image/*,.heic,.avif"
						on:change={handleFileInput}
						multiple
						hidden
					/>
				</label>
				<p class="formats">Podporované formáty: JPG, PNG, WebP, AVIF</p>
			{/if}
		</div>
	{:else}
		<div class="results">
			<div class="results-header">
				<div class="stats">
					<p class="stats-text">
						Celkem {images.length} {images.length === 1 ? 'obrázek' : 'obrázků'} ·
						Ušetřeno: <strong>{getTotalSavings()}%</strong>
					</p>
				</div>
				<div class="header-actions">
					<button class="btn-primary" on:click={downloadAll}>
						Stáhnout vše
					</button>
					<button class="btn-secondary" on:click={reset}>
						Zkomprimovat další
					</button>
				</div>
			</div>

			<div class="images-grid">
				{#each images as image, index}
					<div class="image-card">
						<div class="card-header">
							<h3>{image.originalFile.name}</h3>
						</div>

						<div class="image-preview">
							<div class="image-box">
								<span class="label">Původní</span>
								<img src={image.originalPreview} alt="Původní obrázek" />
								<p class="size">{formatSize(image.originalSize)}</p>
							</div>
						</div>

						<div class="formats-section">
							<h4>Komprimované formáty:</h4>
							<div class="formats-grid">
								{#each image.formats as format}
									<div class="format-card">
										<div class="format-header">
											<span class="format-label">{format.format.toUpperCase()}</span>
											<span class="format-size">{formatSize(format.size)}</span>
										</div>
										<img src={format.preview} alt="{format.format} preview" class="format-preview" />
										<div class="format-footer">
											<span class="format-savings">-{getSavings(image.originalSize, format.size)}%</span>
											<button class="download-btn-small" on:click={() => downloadFormat(format)} aria-label="Stáhnout {format.format}">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
													<polyline points="7 10 12 15 17 10"/>
													<line x1="12" y1="15" x2="12" y2="3"/>
												</svg>
											</button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #f8f9fa;
		color: #1a1a1a;
		min-height: 100vh;
		padding: 40px 20px;
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			background: #0d0d0d;
			color: #e5e5e5;
		}
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		margin-bottom: 60px;
		animation: fadeInUp 0.6s ease-out;
	}

	.logo {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
		animation: float 3s ease-in-out infinite;
	}

	.logo svg {
		filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	h1 {
		font-family: 'Instrument Serif', serif;
		font-size: 3.5rem;
		margin: 0;
		font-weight: 400;
		letter-spacing: -0.02em;
		color: #1a1a1a;
	}

	@media (prefers-color-scheme: dark) {
		h1 {
			color: #e5e5e5;
		}
	}

	header p {
		font-size: 1.1rem;
		color: #6b6b6b;
		margin-top: 12px;
		font-weight: 400;
	}

	@media (prefers-color-scheme: dark) {
		header p {
			color: #9a9a9a;
		}
	}

	.upload-zone {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border: 2px dashed #d1d5db;
		border-radius: 16px;
		padding: 80px 40px;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
		animation: fadeInUp 0.6s ease-out 0.2s both;
	}

	@media (prefers-color-scheme: dark) {
		.upload-zone {
			background: rgba(26, 26, 26, 0.8);
			border-color: #374151;
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
		}
	}

	.upload-zone:hover {
		border-color: #3b82f6;
		box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1);
		transform: translateY(-2px);
	}

	.upload-zone.drag-active {
		border-color: #3b82f6;
		background: rgba(59, 130, 246, 0.1);
		border-style: solid;
		transform: scale(1.02);
		box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2);
	}

	@media (prefers-color-scheme: dark) {
		.upload-zone.drag-active {
			background: rgba(59, 130, 246, 0.15);
		}
	}

	.upload-zone svg {
		color: #6b6b6b;
		margin-bottom: 24px;
	}

	@media (prefers-color-scheme: dark) {
		.upload-zone svg {
			color: #9a9a9a;
		}
	}

	.upload-zone h2 {
		font-family: 'Instrument Serif', serif;
		color: #1a1a1a;
		margin: 10px 0;
		font-size: 1.75rem;
		font-weight: 400;
	}

	@media (prefers-color-scheme: dark) {
		.upload-zone h2 {
			color: #e5e5e5;
		}
	}

	.upload-zone p {
		color: #6b6b6b;
		margin: 10px 0;
	}

	@media (prefers-color-scheme: dark) {
		.upload-zone p {
			color: #9a9a9a;
		}
	}

	.file-label {
		display: inline-block;
		padding: 14px 32px;
		background: #3b82f6;
		color: white;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		margin: 20px 0;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	}

	.file-label:hover {
		background: #2563eb;
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
	}

	.file-label:active {
		transform: translateY(0);
	}

	.formats {
		font-size: 0.875rem;
		color: #9a9a9a;
		margin-top: 20px;
	}

	.processing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 3px solid #e5e5e5;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@media (prefers-color-scheme: dark) {
		.spinner {
			border-color: #333;
			border-top-color: #3b82f6;
		}
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.results {
		max-width: 100%;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
		padding: 28px;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(229, 229, 229, 0.5);
		border-radius: 16px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
		animation: fadeInUp 0.6s ease-out;
	}

	@media (prefers-color-scheme: dark) {
		.results-header {
			background: rgba(26, 26, 26, 0.8);
			border-color: rgba(51, 51, 51, 0.5);
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
		}
	}

	.stats-text {
		margin: 0;
		font-size: 1.1rem;
		color: #1a1a1a;
	}

	@media (prefers-color-scheme: dark) {
		.stats-text {
			color: #e5e5e5;
		}
	}

	.stats-text strong {
		color: #15803d;
		font-weight: 600;
	}

	@media (prefers-color-scheme: dark) {
		.stats-text strong {
			color: #4ade80;
		}
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	.images-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
		gap: 24px;
	}

	.image-card {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(229, 229, 229, 0.5);
		border-radius: 16px;
		padding: 28px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
		animation: fadeInUp 0.6s ease-out both;
	}

	.image-card:nth-child(1) { animation-delay: 0.1s; }
	.image-card:nth-child(2) { animation-delay: 0.2s; }
	.image-card:nth-child(3) { animation-delay: 0.3s; }

	.image-card:hover {
		border-color: rgba(59, 130, 246, 0.5);
		box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1);
		transform: translateY(-4px);
	}

	@media (prefers-color-scheme: dark) {
		.image-card {
			background: rgba(26, 26, 26, 0.8);
			border-color: rgba(51, 51, 51, 0.5);
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
		}
		.image-card:hover {
			border-color: rgba(59, 130, 246, 0.5);
			box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2);
		}
	}

	.card-header {
		margin-bottom: 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid #e5e5e5;
	}

	@media (prefers-color-scheme: dark) {
		.card-header {
			border-bottom-color: #333;
		}
	}

	.card-header h3 {
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (prefers-color-scheme: dark) {
		.card-header h3 {
			color: #e5e5e5;
		}
	}

	.image-preview {
		margin-bottom: 24px;
		display: flex;
		justify-content: center;
	}

	.formats-section {
		margin-top: 24px;
	}

	.formats-section h4 {
		font-size: 0.85rem;
		font-weight: 600;
		color: #6b6b6b;
		margin: 0 0 16px 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@media (prefers-color-scheme: dark) {
		.formats-section h4 {
			color: #9a9a9a;
		}
	}

	.formats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 16px;
	}

	.format-card {
		background: #f8f9fa;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 12px;
		transition: all 0.2s ease;
	}

	.format-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
	}

	@media (prefers-color-scheme: dark) {
		.format-card {
			background: #0d0d0d;
			border-color: #333;
		}
		.format-card:hover {
			border-color: #3b82f6;
			box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
		}
	}

	.format-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.format-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #3b82f6;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.format-size {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b6b6b;
	}

	@media (prefers-color-scheme: dark) {
		.format-size {
			color: #9a9a9a;
		}
	}

	.format-preview {
		width: 100%;
		height: 120px;
		object-fit: cover;
		border-radius: 6px;
		border: 1px solid #e5e5e5;
		margin-bottom: 8px;
	}

	@media (prefers-color-scheme: dark) {
		.format-preview {
			border-color: #333;
		}
	}

	.format-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.format-savings {
		display: inline-block;
		background: #f0fdf4;
		color: #15803d;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
		border: 1px solid #86efac;
	}

	@media (prefers-color-scheme: dark) {
		.format-savings {
			background: #0c2817;
			color: #4ade80;
			border-color: #166534;
		}
	}

	.download-btn-small {
		background: transparent;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		padding: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6b6b6b;
		transition: all 0.2s ease;
	}

	.download-btn-small:hover {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	@media (prefers-color-scheme: dark) {
		.download-btn-small {
			border-color: #333;
			color: #9a9a9a;
		}
		.download-btn-small:hover {
			background: #3b82f6;
			color: white;
			border-color: #3b82f6;
		}
	}

	.image-box {
		text-align: center;
	}

	.image-box .label {
		display: block;
		font-size: 0.75rem;
		color: #9a9a9a;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.image-box img {
		max-width: 100%;
		max-height: 200px;
		border-radius: 8px;
		border: 1px solid #e5e5e5;
	}

	@media (prefers-color-scheme: dark) {
		.image-box img {
			border-color: #333;
		}
	}

	.image-box .size {
		color: #6b6b6b;
		margin-top: 8px;
		font-weight: 500;
		font-size: 0.85rem;
	}

	@media (prefers-color-scheme: dark) {
		.image-box .size {
			color: #9a9a9a;
		}
	}

	button {
		padding: 12px 24px;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover {
		background: #2563eb;
	}

	.btn-secondary {
		background: #f1f1f1;
		color: #1a1a1a;
		border: 1px solid #e5e5e5;
	}

	@media (prefers-color-scheme: dark) {
		.btn-secondary {
			background: #262626;
			color: #e5e5e5;
			border-color: #333;
		}
	}

	.btn-secondary:hover {
		background: #e5e5e5;
	}

	@media (prefers-color-scheme: dark) {
		.btn-secondary:hover {
			background: #333;
		}
	}

	@media (max-width: 768px) {
		:global(body) {
			padding: 20px;
		}

		header {
			margin-bottom: 40px;
		}

		h1 {
			font-size: 2.5rem;
		}

		.upload-zone {
			padding: 60px 30px;
		}

		.results-header {
			flex-direction: column;
			gap: 16px;
			align-items: stretch;
		}

		.header-actions {
			flex-direction: column;
		}

		.header-actions button {
			width: 100%;
		}

		.images-grid {
			grid-template-columns: 1fr;
		}

		.formats-grid {
			grid-template-columns: 1fr;
		}

		.card-header h3 {
			max-width: 250px;
		}
	}
</style>
