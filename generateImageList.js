const fs = require('fs');
const path = require('path');

// Directory paths
const directoryPath = path.join(__dirname, 'images');
const thumbnailsPath = path.join(__dirname, 'thumbnail');

// Helper function to extract metadata from filename
function extractMetadata(filename) {
    const parts = filename.split('_');
    const category = parts[0].toLowerCase(); // First part: Location (normalized to lowercase)
    const number = parts[1]; // Second part: Image number
    const dateString = parts[2].slice(0, 8); // Third part: Date in YYYYMMDD format
    return { category, number, date: dateString };
}

// Reading the directory containing the images
fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    // Filter out image files and create paths for both original and thumbnail images
    const imageList = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)).map(file => {
        const metadata = extractMetadata(file);
        return {
            original: `images/${file}`,
            thumbnail: `thumbnail/${file}`,
            category: metadata.category,
            date: metadata.date  // Include date for sorting
        };
    });

    // Writing the list to a JS file
    const content = `const imageList = ${JSON.stringify(imageList)};`;
    fs.writeFile("imageList.js", content, (err) => {
        if (err) {
            return console.log('Error writing file: ' + err);
        }
        console.log("Image list script generated successfully!");
    });
});
