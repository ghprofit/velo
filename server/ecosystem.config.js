module.exports = {
  apps: [
    {
      name: "velo-server",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
        ALLOWED_ORIGINS: "http://localhost:3000,https://new.d2q9a2qe08dxgc.amplifyapp.com,https://velolink.club,https://www.velolink.club",
        API_URL: "https://vd2v0ljumh.execute-api.eu-north-1.amazonaws.com/prod",
      },
    },
  ],
};
