document.addEventListener('DOMContentLoaded', function() {   
    const contentEl = document.getElementById('content');
    const navButtons = document.querySelectorAll('.navigation button');
    const modal = document.getElementById("Modal");
    const close = modal.querySelector('.close');

    let photosData = [];   // 全局保存 JSON 数据
    let isoInstances = []; // 保存所有当前页面的 Isotope 实例


    // 1. 把 data-category 值映射到「区块标题」列表
    const layoutMap = {
        journey: [
            { key: 'britain', title: 'United Kingdom' },
            { key: 'france', title: 'France' },
            { key: 'spain', title: 'Spain' },
            // … 可继续添加
        ],
        nature: [
            { key: 'plants', title: 'Plants' },
            { key: 'animals', title: 'Animals' },
            // … 可继续添加
        ],
        interest: [
            { key: 'vehicle', title: 'Vehicle' },
            { key: 'aircraft', title: 'Aircraft' },
            { key: 'astronomy', title: 'Astrophotography' },
            // … 可继续添加
        ]
    };
    
    // 2. 通用 fetchData
    async function fetchData(fileName) {
        const response  = await fetch(fileName);
        const data = await response.json();
        return data;
    }

    // 3. 根据当前 category 动态渲染所有区块并初始化 Isotope
    function buildContent(category) {
        // 清空旧实例 & DOM
        isoInstances.forEach(iso => iso.destroy());
        isoInstances = [];
        contentEl.innerHTML = '';

        const blocks = layoutMap[category] || [];
        blocks.forEach(block => {
            // —— 3.1 创建区块 & 标题 ——  
            const section = document.createElement('section');
            section.className = 'category-block';
            section.innerHTML = `<h2>${block.title}</h2>
            <div class="gallery">
                <div class="grid-sizer"></div>
                <div class="gutter-sizer"></div>
            </div>`;
            contentEl.appendChild(section);

            const gallery = section.querySelector('.gallery');

            // —— 3.2 把所有图片都 append 进来，只要给 photo-wrapper 加上关键词 class ——  
            photosData.forEach(photo => {
                const classes = photo.keywords
                    .split(';')
                    .map(k=>k.trim().toLowerCase().replace(/\s+/g,'-'));
                // 无论是不是当前 block.key 都先 append
                const wrap = document.createElement('div');
                wrap.classList.add('photo-wrapper', ...classes);
                // spacer 保持宽高比
                const spacer = document.createElement('div');
                spacer.style.paddingTop = `${photo.height/photo.width*100}%`;
                wrap.appendChild(spacer);
                // img
                const img = document.createElement('img');
                img.alt = photo.title || 'Photo';
                img.style.opacity = 0;
                img.style.transition = 'opacity 1s';
                wrap.appendChild(img);
                gallery.appendChild(wrap);

                // 点击打开 Modal
                wrap.addEventListener('click', () => showModal(photo));
            });

            // —— 3.3 用 filter 参数初始化 Isotope ——  
            const iso = new Isotope(gallery, {
            itemSelector: '.photo-wrapper',
            percentPosition: true,
            filter: `.${block.key}`,      // 只显示含有 block.key 这个 class 的 item
            sortBy: 'random',
            masonry: {
                columnWidth: '.grid-sizer',
                gutter: '.gutter-sizer'
            }
            });
            isoInstances.push(iso);

            // —— 3.4 图片懒加载 & 渐显 ——  
            gallery.querySelectorAll('img').forEach((imgEl, idx) => {
                // 按顺序对应 photosData
                const photo = photosData[idx];
                imgEl.src = photo.thumbnailPath;
                imgEl.onload = () => imgEl.style.opacity = 1;
            });
        });
    }

    // 4. 初始化：先加载数据，再渲染默认 category（journey）
    fetchData('imagesInfo.json')
        .then(data => {
        photosData = data;
        buildContent('journey');
        })
        .catch(err => console.error(err));

    // 5. 监听导航按钮切换
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
        // 更新导航激活状态
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');
        buildContent(category);
        });
    });

    close.addEventListener('click', () => {
        modal.style.opacity = 0;
        // 过渡完成后再隐藏
        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
    });
});


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
    

// 显示模态窗口的函数
function showModal(photo) {
    // 获取模态窗口及内部元素
    const modal = document.getElementById("Modal");
    const modalImg = document.getElementById("ModalImg");
    const imgParameter = document.getElementById('parameter').querySelector('.value');
    const imgLocation = document.getElementById('location').querySelector('.value');
    const imgCamera = document.getElementById('camera').querySelector('.value');
    const imgLens = document.getElementById('lens').querySelector('.value');
  
    // 更新模态窗口中的图片及信息
    modalImg.src = photo.filePath;  // 显示全图或大图，根据实际需求选择 filePath 或 thumbnailPath
  
    // 使用模板字符串来构建参数显示内容
    imgParameter.innerHTML = `
      <img src="icons/aperture-outline.svg" alt="Aperture" class="icon">
      ${photo.aperture || 'unknown'}
      <img src="icons/timer-outline.svg" alt="Shutter Speed" class="icon">
      ${photo.shutterSpeed || 'unknown'}
      <img src="icons/iso-outline.svg" alt="ISO" class="icon">
      ${photo.iso || 'unknown'}
    `;
    imgLocation.innerHTML = `${photo.country || 'unknown'} · ${photo.city || 'unknown'}`;
    imgCamera.innerHTML = `${toTitleCase(photo.cameraModel || 'unknown')}`;
    imgLens.innerHTML = `${toTitleCase(photo.lensModel || 'unknown')}`;
  
    // 显示模态窗口（可以添加过渡效果）
    modal.style.display = "block";
    // 稍微延时让 CSS 过渡生效
    setTimeout(() => modal.style.opacity = 1, 10);
}

