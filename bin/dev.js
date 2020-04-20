const path = require("path");

const webpack = require("webpack"),
  webpackConfig = require("../webpack.config");

const compiler = webpack(
  typeof webpackConfig === "object" ? webpackConfig : webpackConfig()
);

// console.log(`${__dirname}/node_modules/electron`);
console.log(
  "__dirname :",
  path.resolve(__dirname, "../node_modules/.bin/electron")
);

require("electron-reload")(path.resolve(__dirname, "../dist"));
// require("electron-reload")(path.resolve(__dirname, "../dist"), {
//   electron: path.resolve(__dirname, "../node_modules/.bin/electron"),
// });

const watching = compiler.watch(
  {
    aggregateTimeout: 300,
    poll: 1000,
  },
  (err, stats) => {
    // Print watch/build result here...
  }
);

require("../main.js");
