document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.querySelector('#gallery');
    let rowImages = [];
    let totalAspectRatio = 0;
    const maxRowWidth = gallery.clientWidth; // Maximum row width

    imageList.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = function() {
            const aspectRatio = this.width / this.height;
            totalAspectRatio += aspectRatio;
            rowImages.push({img, aspectRatio});

            if (totalAspectRatio * 120 > maxRowWidth) { // 120 is an example row height to start with
                adjustRowHeight(rowImages, totalAspectRatio, maxRowWidth);
                rowImages = [];
                totalAspectRatio = 0;
            }

            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo';
            photoDiv.appendChild(img);
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'details';
            detailsDiv.innerHTML = `Aperture: f/${img.aperture || 'N/A'} | Shutter Speed: ${img.shutterSpeed || 'N/A'} sec | ISO: ${img.iso || 'N/A'}`;
            photoDiv.appendChild(detailsDiv);
            gallery.appendChild(photoDiv);
        };

        // Ensure onload fires for cached images
        if (img.complete) {
            img.onload();
        }
    });

    function adjustRowHeight(images, totalAspectRatio, maxWidth) {
        const optimalHeight = maxWidth / totalAspectRatio;
        images.forEach(({img, aspectRatio}) => {
            img.style.width = `${optimalHeight * aspectRatio}px`;
            img.style.height = `${optimalHeight}px`;
        });
    }
});
