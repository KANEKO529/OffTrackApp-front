const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/logs",
    createProxyMiddleware({
      target: "http://localhost:3001", // Reactサーバーのログ出力先（ここではNode.jsサーバー）
      changeOrigin: true,
    })
  );
};
