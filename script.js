document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.gallery');
    const msnry = new Masonry(grid, {
        itemSelector: '.photo',
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
        percentPosition: true,        
    });

    imageList.forEach(image => {
        const img = new Image();
        img.src = image.thumbnail; // Use the thumbnail for the img src
        img.onload = function() {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo';

            const link = document.createElement('a');
            link.href = image.original; // Link to the original image
            link.target = '_blank'; // Ensures the link opens in a new tab
            link.appendChild(img); // Append the img to the link

            const detailsDiv = document.createElement('div'); 
            detailsDiv.className = 'details'; 

            photoDiv.appendChild(link); // Append link (which contains the img) to the photoDiv
            photoDiv.appendChild(detailsDiv); 
            grid.appendChild(photoDiv);

            EXIF.getData(img, function() {
                var aperture = EXIF.getTag(this, 'FNumber');
                var shutterSpeed = EXIF.getTag(this, 'ExposureTime');
                var iso = EXIF.getTag(this, 'ISOSpeedRatings');

                if (aperture || shutterSpeed || iso) {
                    detailsDiv.innerHTML = `f/${aperture ? aperture.numerator / aperture.denominator : 'N/A'} | ` +
                                           `${shutterSpeed ? shutterSpeed.numerator + '/' + shutterSpeed.denominator + ' s' : 'N/A'} | ` +
                                           `ISO ${iso || 'N/A'}`;
                } else {
                    detailsDiv.innerHTML = "No EXIF Data found.";
                }
            });

            msnry.appended(photoDiv);
            msnry.layout();
        };
    });
});
