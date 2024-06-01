document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.gallery');
    
    const msnry = new Masonry(grid, {
        itemSelector: '.photo',
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
        percentPosition: true,        
    });

    imagesLoaded(grid, function() {
        msnry.layout();
        console.log('Initial layout completed after all images loaded.');
    });

    let imagesLoadedCount = 0; // 记录加载完成的图片数量
    let totalImages = imageList.length; // 总图片数量
    let exifLoadedCount = 0; // 记录加载完成的EXIF数据数量
    console.log('Total images:', totalImages); // 输出总图片数量

    imageList.forEach(image => {
        const img = new Image();
        img.src = image.thumbnail; // Use the thumbnail for the img src
        img.alt = "Thumbnail image"; // Provide alternative text
        img.onload = function() {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo';

            const link = document.createElement('a');
            link.href = image.original; // Link to the original image
            link.target = '_blank'; // Ensures the link opens in a new tab
            link.appendChild(img); // Append the img to the link
            photoDiv.appendChild(link); // Append link (which contains the img) to the photoDiv

            const detailsDiv = document.createElement('div'); 
            detailsDiv.className = 'details'; 
            
            photoDiv.appendChild(detailsDiv); 
            grid.appendChild(photoDiv);

            let exifDataLoaded = false;
            EXIF.getData(img, function() {
                var aperture = EXIF.getTag(this, 'FNumber');
                var shutterSpeed = EXIF.getTag(this, 'ExposureTime');
                var iso = EXIF.getTag(this, 'ISOSpeedRatings');

                if (aperture || shutterSpeed || iso) {
                    detailsDiv.innerHTML = `f/${aperture ? aperture.numerator / aperture.denominator : 'N/A'} | ` +
                                        `${shutterSpeed ? shutterSpeed.numerator + '/' + shutterSpeed.denominator + ' s' : 'N/A'} | ` +
                                        `ISO ${iso || 'N/A'}`;
                    console.log('EXIF loaded for:', img.src);
                    exifLoadedCount++;
                } else {
                    detailsDiv.innerHTML = "No EXIF Data found.";
                    console.log('No EXIF data found for:', img.src);
                }

                console.log(`EXIF loaded count: ${exifLoadedCount} of ${totalImages}`);
                if (exifLoadedCount === totalImages) {
                    console.log('All EXIF data loaded, updating layout...');
                    msnry.layout(); // 所有EXIF数据加载完毕后重新计算布局
                }
            });
            msnry.appended(photoDiv);
            console.log(`Image appended and layout called for: ${img.src}`);
        };            
    });
});
