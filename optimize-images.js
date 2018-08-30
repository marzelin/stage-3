const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");

const resolutions = [300, 450, 800];

function optimizeImages(resolution) {
  imagemin([`img/${resolution}/*.{jpg,png}`], `images-optim/${resolution}`, {
    use: [imageminWebp({ quality: 50 })]
  }).then(() => {
    console.log("Images optimized");
  });
}

resolutions.forEach(optimizeImages);
