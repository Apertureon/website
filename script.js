document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.querySelector('.gallery');
    const modal = document.getElementById('Modal');
    const close = document.getElementsByClassName("close")[0];
    const infoToggle = document.querySelector('.info-toggle');
    const photoInfo = document.querySelector('.photo-info');
    var translations = {};

    // 选择语言
    document.getElementById('language-icon').addEventListener('click', function() {
        var currentLang = this.getAttribute('data-lang') || 'en'; // 默认语言为英文
        var newLang = currentLang === 'en' ? 'zh' : 'en'; // 切换逻辑        
        loadLanguage(newLang); // 调用加载语言的函数
        this.setAttribute('data-lang', newLang); // 更新当前语言状态
    });

    function loadLanguage(lang) {
        fetch(`${lang}.json`)  
        .then(response => response.json())
        .then(data => {
            document.title = data.title;
            document.getElementById('follow-link').textContent = data.follow;
            document.getElementById('about-link').textContent = data.about;
            document.querySelectorAll('.nav-button')[0].textContent = data.featured;
            document.querySelectorAll('.nav-button')[1].textContent = data.explore;
            document.querySelectorAll('.nav-button')[2].textContent = data.lifestyle;
            document.querySelectorAll('.nav-button')[3].textContent = data.creative;
            document.getElementById('show-info-button').textContent = data.showInfo;
            // 更新模态窗口相关的文本
            document.querySelector('#parameter .label').textContent = data.parameter;
            document.querySelector('#location .label').textContent = data.location;
            document.querySelector('#camera .label').textContent = data.camera;
            document.querySelector('#lens .label').textContent = data.lens;
            translations.close = data.close;
            translations.showInfo = data.showInfo;
            // 继续更新其他需要翻译的部分
        })
        .catch(error => {
            console.error('Error loading the language file:', error);
        });
    }

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
                    // 清除所有按钮的激活状态
                    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    iso.arrange({ filter: this.getAttribute('data-filter') });
                });
            });

            // 默认激活 Featured 按钮
            const defaultActiveButton = document.querySelector('.nav-button[data-filter=".featured"]');
            defaultActiveButton.classList.add('active');

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
                    setTimeout(() => modal.style.opacity = 1, 10);
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
                modal.style.opacity = 0;
                setTimeout(() => {
                    modal.style.display = 'none'; 
                    // infoToggle.click(); // 模拟点击infoToggle按钮
                }, 500);
            };

            // 控制信息面板和按钮的行为
            let isPanelOpen = false;             
            infoToggle.addEventListener('click', function() {
                if (!isPanelOpen) {
                    photoInfo.style.display = 'flex'; // 显示信息面板
                    photoInfo.style.flexDirection = 'column'; // 确保列布局
                    photoInfo.style.height = '32%';
                    setTimeout(() => {
                        photoInfo.style.opacity = 1;
                    }, 10);                                        
                    this.style.transform = 'translateX(-50%) translateY(-32vh)'; // 向上移动按钮
                    this.textContent = translations.close; // 更改按钮文本
                    isPanelOpen = true;
                } else {                   
                    this.style.transform = 'translateX(-50%) translateY(0)'; // 将按钮移回原位
                    this.textContent = translations.showInfo; // 恢复按钮文本
                    photoInfo.style.opacity = 0;                    
                    setTimeout(() => {
                        photoInfo.style.display = 'none'; // 完全隐藏信息面板
                    }, 500); // 等待渐隐完成                    
                    isPanelOpen = false;
                }
            });
        });
    
    
});
