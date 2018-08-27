const path = require("path");
const _ = require("lodash");

const  generateRetinaPath = require("./retinaPath");

module.exports = (spritesmithResult, spritesmithRetinaResult, options) => {
  const generateSpriteName = fileName =>
    path.parse(path.relative(options.src.cwd, fileName)).name;

  const generateSprites = (result) =>
    _.map(result.coordinates, function (
      oneSourceInfo,
      fileName
    ) {
      return _.assign({ name: generateSpriteName(fileName) }, oneSourceInfo);
    });

  const generateSpritesheet = (result) => 
    _.assign(
      { image: options.cssImageRef },
      result.properties
    );

  const generateRetinaGroups = (sprites) => 
    _.map(sprites, (sprite, index) => 
     {
        return {
          name: sprite.name,
          index: index
        }
     });
    

  const sprites = generateSprites(spritesmithResult);
  const spritesheet = generateSpritesheet(spritesmithResult);
  let spritesheetResult = { 
    sprites: sprites, 
    spritesheet: spritesheet 
  };

  if(spritesmithRetinaResult){
    const retina_sprites = generateSprites(spritesmithRetinaResult);
    const retina_spritesheet = generateSpritesheet(spritesmithRetinaResult);
    const retina_groups = generateRetinaGroups(sprites);

    retina_spritesheet.image = 
      generateRetinaPath(retina_spritesheet.image, options.src.retina);
    

    spritesheetResult = _.assign({
      retina_sprites: retina_sprites, 
      retina_spritesheet: retina_spritesheet,
      retina_groups: retina_groups
    }, spritesheetResult);
  }

  return spritesheetResult;
};
