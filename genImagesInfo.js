const fs = require('fs');
const path = require('path');
const exifReader = require('exifreader');

// 图片目录
const imagesDirectory = './images';
const thumbnailsDirectory = './thumbnails';

// 定义一个函数来处理关键词的格式化
function formatKeywords(keywords) {
    if (Array.isArray(keywords)) {
        // 如果是数组，提取所有描述并用分号分隔
        return keywords.map(kw => kw.description).join(';');
    } else if (typeof keywords === 'object' && keywords.description) {
        // 如果是单个对象并且有描述属性，直接返回描述
        return keywords.description;
    }
    return 'Unknown';
}

// 将路径中的反斜杠替换为正斜杠的函数
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}

// 异步函数来处理图像
async function processImages(directory, thumbnailDirectory) {
    const imageFiles = fs.readdirSync(directory);
    const imagesInfo = [];

    for (let file of imageFiles) {
        const filePath = normalizePath(path.join(directory, file));
        const thumbnailPath = normalizePath(path.join(thumbnailDirectory, file));

        const data = fs.readFileSync(filePath);
        const tags = exifReader.load(data);
        
        // console.log(`Keywords for ${file}:`, tags['Keywords'].description);
        // 创建图像信息对象
        const imageInfo = {
            filename: file,
            filePath: filePath,
            thumbnailPath: thumbnailPath,
            width: tags['Image Width'] ? tags['Image Width'].value : 'Unknown',
            height: tags['Image Height'] ? tags['Image Height'].value : 'Unknown',
            cameraModel: tags['Model'] ? tags['Model'].description : 'Unknown',
            lensModel: tags['LensModel'] ? tags['LensModel'].description : 'Unknown',
            aperture: tags['FNumber'] ? tags['FNumber'].description : 'Unknown',
            shutterSpeed: tags['ExposureTime'] ? tags['ExposureTime'].description : 'Unknown',
            iso: tags['ISOSpeedRatings'] ? tags['ISOSpeedRatings'].value : 'Unknown',
            keywords: formatKeywords(tags['Keywords']),
            country: tags['Country'] ? tags['Country'].description : 'Unknown',
            city: tags['City'] ? tags['City'].description : 'Unknown'
            
        };

        imagesInfo.push(imageInfo);
    }

    // 写入JSON文件
    fs.writeFileSync('./imagesInfo.json', JSON.stringify(imagesInfo, null, 2));        
    console.log("ImageInfo script generated successfully!");
}

// 执行函数
processImages(imagesDirectory, thumbnailsDirectory);
