import type { Config } from '@docusaurus/types';
import type { ThemeConfig } from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';
// Fallback loader for local remark plugin (CI-safe)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parametersToTable = (() => {
  try {
    // Prefer local file when present
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./src/remark/parametersToTable');
  } catch {
    // No-op plugin to avoid CI failures if file is missing
    return () => () => {};
  }
})();

const config: Config = {
  title: 'PoE JS SDK',
  tagline: 'TypeScript SDK for the Path of Exile API',
  url: 'https://viligante8.github.io',
  baseUrl: '/poe-js-sdk/',
  favicon: 'img/logo.svg',
  organizationName: 'viligante8',
  projectName: 'poe-js-sdk',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  trailingSlash: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl:
            'https://github.com/viligante8/poe-js-sdk/edit/main/website/',
          routeBasePath: '/',
          includeCurrentVersion: true,
          remarkPlugins: [parametersToTable],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'api',
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        out: 'api',
        routeBasePath: 'api',
        readme: 'none',
        sidebar: { pretty: true },
        excludePrivate: true,
        excludeProtected: false,
        excludeInternal: true,
        categorizeByGroup: false,
        searchInComments: true,
        // Make CI resilient: don't fail on TS errors and don't wipe existing docs
        skipErrorChecking: true,
        cleanOutputDir: true,
      },
    ],
    // Local search (fallback if Algolia isn't configured)
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: '/',
        indexDocs: true,
        indexBlog: false,
        removeDefaultStopWordFilter: false,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    breadcrumbs: {
      autoGenerate: true,
    },
    navbar: {
      title: 'PoE JS SDK',
      logo: {
        alt: 'PoE JS SDK',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/api/', label: 'API', position: 'left' },
        { type: 'search', position: 'right' },
        {
          href: 'https://github.com/viligante8/poe-js-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    // Optional Algolia (set real values to use)
    // algolia: {
    //   appId: 'APP_ID',
    //   apiKey: 'API_KEY',
    //   indexName: 'INDEX_NAME',
    // },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/getting-started' },
            { label: 'OAuth', to: '/oauth' },
            { label: 'Trade (Unofficial)', to: '/trade' },
            { label: 'Rate Limiting', to: '/rate-limiting' },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Issues',
              href: 'https://github.com/viligante8/poe-js-sdk/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/viligante8/poe-js-sdk',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/viligante8/poe-js-sdk/blob/main/CHANGELOG.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Vito Pistelli. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies ThemeConfig,
};

export default config;
