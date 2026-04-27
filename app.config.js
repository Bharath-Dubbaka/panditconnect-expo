// app.config.js
module.exports = {
  expo: {
    name: "PanditConnect",
    slug: "panditconnect",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    icon: "./assets/icon.png",
    scheme: "panditconnect",
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#FFFBF5",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFBF5",
      },
      package: "com.panditconnect.app",
      userInterfaceStyle: "light",
    },
    plugins: [["expo-router", { root: "./app" }], "expo-font"],
    extra: {
      router: { root: "./app" },
      eas: { projectId: "1ed110b9-9a36-4598-99ad-bcade0b1057e" },
    },
    owner: "brat369",
  },
};
