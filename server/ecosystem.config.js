module.exports = {
  apps: [
    {
      name: "velo-server",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
