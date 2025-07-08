// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const {themes} = require('prism-react-renderer');
const lightTheme = themes.oneLight;
const darkTheme = themes.vsDark;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "NeoForged docs",
  tagline: "The better mod loader",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.neoforged.net",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "neoforged", // Usually your GitHub org/user name.
  projectName: "documentation", // Usually your repo name.

  onBrokenLinks: "throw", // Yay multi versioned-docs sites
  onBrokenMarkdownLinks: "throw",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //  'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          lastVersion: "current",
          includeCurrentVersion: true,
          versions: {
            current: {
              label: "1.21.6 - 1.21.7",
            },
            "1.21.5": {
              label: "1.21.5"
            },
            "1.21.4": {
              label: "1.21.4"
            },
            "1.21.3": {
              label: "1.21.2 - 1.21.3",
            },
            "1.21.1": {
              label: "1.21 - 1.21.1"
            },
            "1.20.6": {
              label: "1.20.5 - 1.20.6"
            },
            "1.20.4": {
              label: "1.20.3 - 1.20.4"
            }
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "neogradle",
        path: "neogradle",
        routeBasePath: "neogradle",
        sidebarPath: require.resolve("./sidebarsNG.js"),
        lastVersion: "current",
        includeCurrentVersion: true,
        versions: {
          current: {
            label: "NG7",
          },
          "6.x": {
            label: "FG6",
            path: "6.x",
          },
          "5.x": {
            label: "FG5",
            path: "5.x",
          },
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true
      },

      // Replace with your project's social card
      //image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: "Homepage",
        logo: {
          alt: "NeoForged Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "mainSidebar",
            position: "left",
            label: "NeoForge Documentation",
          },
          {
            type: "docSidebar",
            sidebarId: "ngSidebar",
            position: "left",
            docsPluginId: "neogradle",
            label: "NeoGradle Documentation",
          },
          {
            type: "docsVersionDropdown",
            position: "right",
          },
          {
            type: "docsVersionDropdown",
            position: "right",
            docsPluginId: "neogradle",
          },
          {
            to: "/contributing",
            label: "Contributing",
            position: "right",
          },
          {
            href: "https://github.com/neoforged/documentation",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                to: "/docs/gettingstarted/",
                label: "NeoForge Documentation",
              },
              {
                to: "/neogradle/docs/",
                label: "NeoGradle Documentation",
              },
              {
                to: "/contributing",
                label: "Contributing to the Documentation"
              }
            ],
          },
          {
            title: "Links",
            items: [
              {
                label: "Discord",
                href: "https://discord.neoforged.net/",
              },
              {
                label: "Main Website",
                href: "https://neoforged.net/",
              },
              {
                label: "GitHub",
                href: "https://github.com/neoforged/documentation",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()}, under the MIT license. Built with Docusaurus.`,
      },
      prism: {
        theme: lightTheme,
        darkTheme: darkTheme,
        additionalLanguages: ["java", "gradle", "toml", "groovy", "kotlin", "javascript", "json", "json5", "properties"],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: '05RJFT798Z',
  
        // Public API key: it is safe to commit it
        apiKey: 'b198aa85c7f2ee9364d105ef0be4d81a',
  
        indexName: 'neoforged'
      },
    }),

    markdown: {
      mermaid: true
    },

    themes: ['@docusaurus/theme-mermaid']
};

module.exports = config;
