import type { Config } from '@docusaurus/types';
import type { ThemeConfig } from '@docusaurus/preset-classic';

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
  trailingSlash: false,
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
          editUrl: 'https://github.com/viligante8/poe-js-sdk/edit/main/website/',
          routeBasePath: '/',
          includeCurrentVersion: true,
        },
        blog: false,
        theme: {},
      },
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        out: 'docs/api',
        readme: 'none',
        sidebar: { pretty: true },
        excludePrivate: true,
        excludeProtected: false,
        excludeInternal: true,
        categorizeByGroup: true,
        searchInComments: true,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'PoE JS SDK',
      logo: {
        alt: 'PoE JS SDK',
        src: 'img/logo.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs' },
        { to: '/api/index', label: 'API', position: 'left' },
        {
          href: 'https://github.com/viligante8/poe-js-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
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
            { label: 'Issues', href: 'https://github.com/viligante8/poe-js-sdk/issues' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/viligante8/poe-js-sdk' },
            { label: 'Changelog', href: 'https://github.com/viligante8/poe-js-sdk/blob/main/CHANGELOG.md' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Vito Pistelli. Built with Docusaurus.`,
    },
    prism: {
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies ThemeConfig,
};

export default config;
