const {FusesPlugin} = require("@electron-forge/plugin-fuses");
const {FuseV1Options, FuseVersion} = require("@electron/fuses");

module.exports = {
  packagerConfig: {
    icon: "src/Icons/yusha.ico",
    asar: {
      unpack: '**/*.node'
    },
    extraResource: [
      "./assets",
      "./camera",
      "./exe",
      "./characters",
      "./segResults",
      "./bin",
      "./models",
      "./python",
      // "./native_modules",
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "yusha-app",
        setupIcon: "src/Icons/yusha.ico",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        mainConfig: "./webpack.main.config.js",
        devContentSecurityPolicy:
          "connect-src 'self' https://cdnjs.cloudflare.com https://rmhfunncqzrridcwwquo.supabase.co/ 'unsafe-inline'",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
              preload: {
                js: "./src/preload.js",
              },
            },
          ],
        },
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
