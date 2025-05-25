const fs = require('fs');
const path = require('path');
const exifReader = require('exifreader');

// 脚本所在目录，比如 …/website
const scriptDir = __dirname;

// 磁盘上的源目录
const imagesDirAbs     = path.join(scriptDir, 'images');
const thumbsDirAbs     = path.join(scriptDir, 'thumbnails');

// JSON 里想要的相对前缀
const imagesDirRel = 'images';
const thumbsDirRel = 'thumbnails';

function formatKeywords(keywords) {
  if (Array.isArray(keywords)) {
    return keywords.map(kw => kw.description).join(';');
  } else if (keywords && keywords.description) {
    return keywords.description;
  }
  return 'Unknown';
}

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

async function processImages(dirAbs, dirRel, thumbsAbs, thumbsRel) {
  if (!fs.existsSync(dirAbs)) {
    console.error(`Error: images directory not found at ${dirAbs}`);
    return;
  }
  const imageFiles = fs.readdirSync(dirAbs);
  const imagesInfo = [];

  for (let file of imageFiles) {
    // 1. 本地绝对路径用于读取元数据
    const absPath      = path.join(dirAbs, file);
    const absThumbPath = path.join(thumbsAbs, file);

    // 2. JSON 里保存的相对路径
    const relPath      = normalizePath(path.join(dirRel, file));
    const relThumbPath = normalizePath(path.join(thumbsRel, file));

    // 3. 读取并解析 EXIF
    const buffer = fs.readFileSync(absPath);
    const tags   = exifReader.load(buffer);

    imagesInfo.push({
      filename:      file,
      filePath:      relPath,
      thumbnailPath: relThumbPath,
      width:         tags['Image Width']     ? tags['Image Width'].value     : 'Unknown',
      height:        tags['Image Height']    ? tags['Image Height'].value    : 'Unknown',
      cameraModel:   tags['Model']           ? tags['Model'].description     : 'Unknown',
      lensModel:     tags['LensModel']       ? tags['LensModel'].description : 'Unknown',
      aperture:      tags['FNumber']         ? tags['FNumber'].description   : 'Unknown',
      shutterSpeed:  tags['ExposureTime']    ? tags['ExposureTime'].description : 'Unknown',
      iso:           tags['ISOSpeedRatings'] ? tags['ISOSpeedRatings'].value   : 'Unknown',
      keywords:      formatKeywords(tags['Keywords']),
      country:       tags['Country']         ? tags['Country'].description   : 'Unknown',
      city:          tags['City']            ? tags['City'].description      : 'Unknown'
    });
  }

  // 写文件到 website 下的 imagesInfo.json
  const outPath = path.join(scriptDir, 'imagesInfo.json');
  fs.writeFileSync(outPath, JSON.stringify(imagesInfo, null, 2), 'utf8');
  console.log(`Generated ${outPath} with ${imagesInfo.length} entries.`);
}

processImages(imagesDirAbs, imagesDirRel, thumbsDirAbs, thumbsDirRel);

