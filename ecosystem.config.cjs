module.exports = {
  apps: [
    {
      name: "koov-iot-frontend-gha",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      interpreter: "node",
      watch: false,
      ignore_watch: [
        "node_modules",
        ".next",
        "logs",
        ".git",
        "*.log",
      ],
    },
  ],
};
