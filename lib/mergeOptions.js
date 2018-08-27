const _ = require("lodash");
module.exports = customOptions => {
  return _.merge(
    {
      src: {
        cwd: "./src/images/sprite",
        glob: "*.png",
        retina: false
      },
      target: {
        image: "./src/images/sprite.png",
        css: "./src/css/sprite.css"
      },
      output: {},
      cssImageRef: "../images/sprite.png"
    },
    customOptions
  );
};
