document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.gallery');
    const msnry = new Masonry(grid, {
        itemSelector: '.photo',
        columnWidth: 200,
        gutter: 10
    });

    imageList.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = function() {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo';
            grid.appendChild(photoDiv);
            photoDiv.appendChild(img);

            EXIF.getData(img, function() {
                var aperture = EXIF.getTag(this, 'FNumber');
                var shutterSpeed = EXIF.getTag(this, 'ExposureTime');
                var iso = EXIF.getTag(this, 'ISOSpeedRatings');

                var details = img.nextElementSibling; // The details div
                if (aperture || shutterSpeed || iso) {
                    details.innerHTML = `Aperture: f/${aperture ? aperture.numerator / aperture.denominator : 'N/A'} | ` +
                                        `Shutter Speed: ${shutterSpeed ? shutterSpeed.numerator + '/' + shutterSpeed.denominator + ' sec' : 'N/A'} | ` +
                                        `ISO: ${iso || 'N/A'}`;
                } else {
                    details.innerHTML = "No EXIF Data found.";
                }
            });

            msnry.appended(photoDiv);
            msnry.layout();
        };
    });
});
