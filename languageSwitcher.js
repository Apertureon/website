document.getElementById('language-select').addEventListener('change', function() {
    loadLanguage(this.value); 
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
        document.getElementByClassName('info-toggle').textContent = data.showInfo;
        // 更新模态窗口相关的文本
        document.querySelector('#parameter .label').textContent = data.parameter;
        document.querySelector('#location .label').textContent = data.location;
        document.querySelector('#camera .label').textContent = data.camera;
        document.querySelector('#lens .label').textContent = data.lens;
        // 继续更新其他需要翻译的部分
    })
    .catch(error => {
        console.error('Error loading the language file:', error);
    });
}

// 初始加载默认语言
window.onload = () => {
    loadLanguage('en');
};
