const spritesmith = require("spritesmith");
const glob = require("glob");
const path = require("path");
const extname = path.extname;
const _ = require("lodash");
const gaze = require("gaze");
const writeFile = require("write");
const fs = require("fs");
const templater = require("spritesheet-templates");
const mergeOptions = require("./mergeOptions");
const spriteSheetFormat = require("./spriteSheetFormat");
const generateRetinaPath = require("./retinaPath");

const mimeTypes = {
  ".css": "css",
  ".scss": "scss",
  ".sass": "sass",
  ".less": "less",
  ".styl": "stylus",
  ".json": "json"
};


module.exports = (customOptions, callback) => {
  
  const options = mergeOptions(customOptions);
  
  const { src, target, output, customTemplate } = options;
  
  const runSpritesmith = (files) => 
    new Promise((resolve, reject) => {
      const options = _.merge({}, { src: files }, customOptions.spritesmithOptions);
      spritesmith.run(options, (err, result) => {
        if(err) reject(err);
        resolve(result);
      })
    });

  const getFiles = () => 
    new Promise((resolve, reject) => {
      glob(src.cwd + "/" + src.glob, (err, files) => {

        if (err) reject(err);

        const response = _.groupBy(files, (path) => 
          path.includes(src.retina)? "retina" : "regular");  
        

        resolve(response);
      });
    });


  const init = async () => {

    //get images
    const files = await getFiles();

    //process images
    let spritesmiths = [];

    spritesmiths.push(runSpritesmith(files.regular));

    if(files.retina) 
      spritesmiths.push(runSpritesmith(files.retina));

    const [reguarResult, retinaResult] = await Promise.all(spritesmiths);

    //Custom template
    const mimeTemplate = 
      mimeTypes[extname(target.css)] + (src.retina ? "_retina":"");

    const cssFormat = customTemplate
      ? "spritesmith-custom"
      : mimeTemplate;
  
    if (typeof customTemplate === "string") {
      templater.addHandlebarsTemplate(
        cssFormat,
        fs.readFileSync(customTemplate, "utf-8")
      );
    } else if (typeof customTemplate === "function") {
      templater.addTemplate(cssFormat, customTemplate);
    }
    
    //generate spritesheet content
    const spriteSheetContent = templater(
      spriteSheetFormat(reguarResult, retinaResult, options),
      {
        format: cssFormat
      }
    );
  
    // write the sprite image file and stylesheet
    Promise.all([
      writeFile(target.image, reguarResult.image),
      writeFile(target.css, spriteSheetContent),
      retinaResult
        ? writeFile(generateRetinaPath(target.image, src.retina), retinaResult.image)
        : Promise.resolve(),
      output.image
        ? writeFile(output.image, reguarResult.image)
        : Promise.resolve(),
      output.image && retinaResult
        ? writeFile(generateRetinaPath(output.image, src.retina), retinaResult.image)
        : Promise.resolve(),
      output.css
        ? writeFile(output.css, spriteSheetContent)
        : Promise.resolve()
    ]).then(callback);

  };

  init();

  if (options.watch) {
    gaze(src.glob, { cwd: src.cwd }, (err, watcher) => {
      watcher.on("all", init);
    });
  }
};
