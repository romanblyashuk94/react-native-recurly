const baseConfig = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...baseConfig.expo,
  extra: {
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
    eas: {
      projectId: "60db17ef-c0bc-4629-87a4-121a3fd2515d",
    },
  },
};
