import fs from 'fs';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:5173/api/compress';

async function createValidImage() {
    const buffer = await sharp({
        create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
        }
    })
    .png()
    .toBuffer();
    
    fs.writeFileSync('valid_test.png', buffer);
    return buffer;
}

async function testCompression() {
    console.log('Creating valid test image...');
    const buffer = await createValidImage();

    console.log('Uploading image...');
    const formData = new FormData();
    formData.append('image', new Blob([buffer], { type: 'image/png' }), 'valid_test.png');

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('✅ Compression successful!');
            const data = await response.json();
            console.log('Formats:', data.formats.map(f => f.format));
        } else {
            console.log('❌ Compression failed:', response.status, await response.text());
        }
    } catch (error) {
        console.log('Error:', error.message);
    } finally {
        fs.unlinkSync('valid_test.png');
    }
}

testCompression();
