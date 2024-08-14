document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.querySelector('.gallery');
    const modal = document.getElementById('Modal');
    const close = document.getElementsByClassName("close")[0];

    function toTitleCase(str) {
        // 先处理 'Z' 后跟数字的情况，将它们合并
        str = str.replace(/Z (\d+)/g, 'Z$1');
    
        return str.split(' ').map(function(word) {
            // 特殊处理 NIKON 和 NIKKOR
            if (word.toUpperCase() === "NIKON" || word.toUpperCase() === "NIKKOR") {
                return word[0].toUpperCase() + word.substr(1).toLowerCase();
            }
            return word;
        }).join(' ');
    }    

    fetch('imagesInfo.json')
        .then(response => response.json())
        .then(data => {
            // 创建所有图片的容器
            const containers = data.map(photo => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'photo-wrapper';

                // 根据关键词添加类
                photo.keywords.split(';').forEach(keyword => {
                    imgDiv.classList.add(keyword.trim().toLowerCase().replace(/\s+/g, '-'));
                });

                // 创建一个透明的占位元素以保持宽高比
                const spacer = document.createElement('div');
                spacer.style.paddingTop = `${(photo.height / photo.width) * 100}%`;
                imgDiv.appendChild(spacer);

                // 准备图片元素，但不设置源
                const img = document.createElement('img');
                img.alt = "Photo";
                img.style.opacity = 0; // 初始透明度设为0
                img.style.transition = 'opacity 1s ease-in'; // 添加渐显效果
                imgDiv.appendChild(img);

                return imgDiv;
            });

            // 将容器添加到画廊并初始化 Masonry 布局
            containers.forEach(container => gallery.appendChild(container));
            const iso = new Isotope(gallery, {
                itemSelector: '.photo-wrapper',
                percentPosition: true,
                filter: '.featured',
                masonry: {
                    columnWidth: '.grid-sizer',
                    gutter: '.gutter-sizer'
                }    
            });

            // 绑定筛选按钮事件
            document.querySelectorAll('.nav-button').forEach(button => {
                button.addEventListener('click', function() {
                    iso.arrange({ filter: this.getAttribute('data-filter') });
                });
            });

            // 布局初始化完成后设置图片并开始加载
            data.forEach((photo, index) => {
                const img = containers[index].querySelector('img');
                img.src = photo.thumbnailPath; 
                img.onload = () => img.style.opacity = 1; // 图片加载完成后逐渐显示

                // 添加点击事件
                img.onclick = () => {
                    const modalImg = document.getElementById("ModalImg");
                    const imgParameter = document.getElementById('parameter').querySelector('.value');
                    const imgLocation = document.getElementById('location').querySelector('.value');
                    const imgCamera = document.getElementById('camera').querySelector('.value');
                    const imgLens = document.getElementById('lens').querySelector('.value');

                    // 显示图片和参数
                    modal.style.display = "block";
                    modalImg.src = photo.filePath;
                    
                    imgParameter.innerHTML =
                        '<img src="icons/aperture-outline.svg" alt="Camera" class="icon">' + (photo.aperture || 'unknown') +
                        '<img src="icons/timer-outline.svg" alt="Shutter Speed" class="icon">' + (photo.shutterSpeed || 'unknown') +
                        '<img src="icons/iso-outline.svg" alt="ISO" class="icon">' + (photo.iso || 'unknown');
                    imgLocation.innerHTML = `${photo.country || 'unknown'} · ${photo.city || 'unknown'}`;
                    imgCamera.innerHTML = `${toTitleCase(photo.cameraModel || 'unknown')}`;
                    imgLens.innerHTML = `${toTitleCase(photo.lensModel || 'unknown')}`;
                };
            });

            close.onclick = function() {
                modal.style.display = "none";
            };
        });
});
