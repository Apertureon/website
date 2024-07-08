document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.gallery');
    const modal = document.getElementById('Modal');
    const modalImg = document.getElementById("modalImage");
    const closeModal = document.getElementsByClassName("close")[0];
    
    // Initialize Isotope
    const iso = new Isotope(grid, {
        itemSelector: '.photo',
        masonry: {
            columnWidth: '.grid-sizer',
            gutter: '.gutter-sizer'
        },
        percentPosition: true,
        getSortData: {
            date: '[data-date]'
        }
    });

    imagesLoaded(grid, function() {
        iso.layout();
        console.log('Initial layout completed after all images loaded.');
    });

    let totalImages = imageList.length; 
    let exifLoadedCount = 0; 
    console.log('Total images:', totalImages); 

    imageList.forEach(image => {
        const img = new Image();
        img.src = image.thumbnail; // Use the thumbnail for the img src
        img.alt = "Thumbnail image"; // Provide alternative text

        const photoDiv = document.createElement('div');
        photoDiv.className = 'photo ' + image.category; // Assign category for filtering
        photoDiv.setAttribute('data-date', image.date); // Assign date for sorting

        photoDiv.onclick = function() {  // 添加点击事件
            modal.style.display = "block";
            modalImg.src = image.original;
        };
        photoDiv.appendChild(img);
        grid.appendChild(photoDiv);

        const detailsDiv = document.createElement('div'); 
        detailsDiv.className = 'details'; 
        photoDiv.appendChild(detailsDiv);

        img.onload = function() {
            EXIF.getData(img, function() {
                var aperture = EXIF.getTag(this, 'FNumber');
                var shutterSpeed = EXIF.getTag(this, 'ExposureTime');
                var isoSpeed = EXIF.getTag(this, 'ISOSpeedRatings');

                if (aperture || shutterSpeed || isoSpeed) {
                    detailsDiv.innerHTML = `<span class='exif'>f/${aperture ? aperture.numerator / aperture.denominator : 'N/A'}</span> ` +
                                        `<span class='exif'>${shutterSpeed ? shutterSpeed.numerator + '/' + shutterSpeed.denominator + 's' : 'N/A'}</span> ` +
                                        `<span class='exif'>ISO ${isoSpeed || 'N/A'}</span>`;
                } else {
                    detailsDiv.innerHTML = "No EXIF Data found.";
                }

                exifLoadedCount++;
                console.log(`EXIF loaded count: ${exifLoadedCount} of ${totalImages}`);
                if (exifLoadedCount === totalImages) {
                    console.log('All EXIF data loaded, updating layout...');
                    iso.layout(); // Update layout after all EXIF data is loaded
                }
            });
            iso.appended(photoDiv);
            console.log(`Image appended and layout called for: ${img.src}`);
        };
    });

    closeModal.onclick = function() {  // 关闭模态窗口
        modal.style.display = "none";
    };

    // Close the modal when clicking outside of the image
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    
    // Set up filters
    document.querySelectorAll('.filters .button').forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            iso.arrange({ filter: filterValue });
            console.log('Filtering:', filterValue);
        });
    });

    // Set up sorting
    document.querySelectorAll('.sorting .button').forEach(button => {
        button.addEventListener('click', function() {
            const sortValue = this.getAttribute('data-sort-by');
            iso.arrange({ sortBy: sortValue });
            console.log('Sorting by:', sortValue);
        });
    });
});
