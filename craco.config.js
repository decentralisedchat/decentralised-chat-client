module.exports = {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          webpackConfig.entry = "./src/index.ts";
          return webpackConfig;
        },
      },
    },
  ],
};
