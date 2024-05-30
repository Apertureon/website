document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.gallery');
    const msnry = new Masonry(grid, {
        itemSelector: '.photo',
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
        percentPosition: true, // Enable percentage-based positions       
    });

    imageList.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = function() {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo';

            const detailsDiv = document.createElement('div'); // Create the details div here
            detailsDiv.className = 'details'; // Assign class name

            photoDiv.appendChild(img);
            photoDiv.appendChild(detailsDiv); // Append details div to photoDiv
            grid.appendChild(photoDiv);

            EXIF.getData(img, function() {
                var aperture = EXIF.getTag(this, 'FNumber');
                var shutterSpeed = EXIF.getTag(this, 'ExposureTime');
                var iso = EXIF.getTag(this, 'ISOSpeedRatings');

                if (aperture || shutterSpeed || iso) {
                    detailsDiv.innerHTML = `f/${aperture ? aperture.numerator / aperture.denominator : 'N/A'} | ` +
                                           `${shutterSpeed ? shutterSpeed.numerator + '/' + shutterSpeed.denominator + ' sec' : 'N/A'} | ` +
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
