const appJson = require('./app.json');
require('dotenv').config();

module.exports = () => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  return {
    ...appJson,
    expo: {
      ...appJson.expo,
      extra: {
        ...appJson.expo.extra,
        apiBaseUrl,
      },
    },
  };
};
