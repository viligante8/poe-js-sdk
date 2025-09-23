import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Overview',
      collapsible: false,
      items: [
        'index',
        'getting-started',
      ],
    },
    {
      type: 'category',
      label: 'Core',
      items: [
        'oauth',
        'oauth-scopes',
        'rate-limiting',
        'realms',
        'security',
        'error-handling',
        'helpers',
      ],
    },
    {
      type: 'category',
      label: 'Trading (Unofficial)',
      items: [
        'trade',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'examples',
        'nextjs',
        'faq',
        'official-api',
        'contributing',
      ],
    },
    {
      type: 'link',
      label: 'Changelog',
      href: 'https://github.com/viligante8/poe-js-sdk/blob/main/CHANGELOG.md',
    },
  ],
};

export default sidebars;

