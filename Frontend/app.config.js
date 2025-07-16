import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    assetBundlePatterns: ["**/*"],

    extra: {
      BASE_URL: process.env.BASE_URL,
    },
  };
};
