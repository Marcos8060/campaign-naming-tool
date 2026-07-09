import type { Preview } from '@storybook/nextjs';
import '../src/app/globals.css';

/**
 * Importing the real globals.css means Storybook renders shared components
 * with the project's actual design tokens (--color-primary, --t1/--t2/--t3,
 * --bd, card-shadow, etc.) instead of bare Tailwind defaults.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
