
import fs from 'fs';
// Node 20 has built-in fetch, FormData, File, Blob
// No need for external libraries

const BASE_URL = 'http://localhost:5173/api/compress';

async function testLargeFile() {
    console.log('Testing large file upload...');
    // Create a dummy large file (11MB)
    const largeFileName = 'large_test_file.jpg';
    const buffer = Buffer.alloc(11 * 1024 * 1024, 'a');
    fs.writeFileSync(largeFileName, buffer);

    try {
        const formData = new FormData();
        formData.append('image', new Blob([buffer]), 'large_test_file.jpg');

        const response = await fetch(BASE_URL, {
            method: 'POST',
            body: formData
        });

        if (response.status === 413 || response.status === 400) {
            console.log('✅ Large file rejected correctly:', response.status);
        } else {
            console.log('❌ Large file NOT rejected. Status:', response.status);
        }
    } catch (error) {
        console.log('Error testing large file:', error.message);
    } finally {
        fs.unlinkSync(largeFileName);
    }
}

async function testInvalidFileType() {
    console.log('\nTesting invalid file type...');
    const textFileName = 'test.txt';
    fs.writeFileSync(textFileName, 'This is not an image');

    try {
        const formData = new FormData();
        formData.append('image', new Blob(['This is not an image']), 'test.txt');

        const response = await fetch(BASE_URL, {
            method: 'POST',
            body: formData
        });

        if (response.status === 400 || response.status === 415) {
            console.log('✅ Invalid file type rejected correctly:', response.status);
        } else {
            console.log('❌ Invalid file type NOT rejected. Status:', response.status);
        }
    } catch (error) {
        console.log('Error testing invalid file type:', error.message);
    } finally {
        fs.unlinkSync(textFileName);
    }
}

async function runTests() {
    // Note: Server must be running for these tests to work
    await testLargeFile();
    await testInvalidFileType();
}

runTests();
