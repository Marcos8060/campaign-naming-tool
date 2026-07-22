module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'Literal[value=/#(?:[0-9a-fA-F]{3}){1,2}\\b/]',
        message:
          'Hardcoded hex color. Use a design-token class (text-t1, bg-primary-color, border-bd, ...) ' +
          'or a var(--...) CSS variable from globals.css instead. If this is a genuinely dynamic value ' +
          '(chart series color, user-picked brand color), scope an override in .eslintrc.js rather than ' +
          'disabling inline.',
      },
      {
        selector: 'TemplateElement[value.raw=/#(?:[0-9a-fA-F]{3}){1,2}\\b/]',
        message: 'Hardcoded hex color in a template literal. Use a design-token class or CSS variable instead.',
      },
    ],
  },
  overrides: [
    {
      // Recharts needs literal color strings for series/fill/stroke props, and
      // these files key platform brand colors (Meta purple, TikTok pink, ...)
      // that aren't part of the design token set — raw hex is the correct
      // choice here, not drift.
      files: ['src/app/(dashboard)/dashboard/page.tsx', 'src/app/(dashboard)/analytics/**/*.tsx'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    {
      // A brand-color picker necessarily accepts/renders arbitrary hex.
      files: ['src/app/(dashboard)/settings/theme/**/*.tsx'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
