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
                const aperture = EXIF.getTag(this, 'ApertureValue');
                const shutterSpeed = EXIF.getTag(this, 'ShutterSpeedValue');
                const iso = EXIF.getTag(this, 'ISOSpeedRatings');
                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'details';
                detailsDiv.textContent = `Aperture: f/${aperture || 'N/A'} | Shutter Speed: ${shutterSpeed || 'N/A'} sec | ISO: ${iso || 'N/A'}`;
                photoDiv.appendChild(detailsDiv);
            });

            msnry.appended(photoDiv);
            msnry.layout();
        };
    });
});
