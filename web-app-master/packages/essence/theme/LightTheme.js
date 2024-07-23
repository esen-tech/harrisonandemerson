import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    /* Typography */
    --es-theme-font-family: var(--es-font-family-noto-sans-tc);

    --es-theme-font-size-display-xs: var(--es-font-size-7);
    --es-theme-font-size-display-s: var(--es-font-size-8);
    --es-theme-font-size-display-m: var(--es-font-size-9);
    --es-theme-font-size-display-l: var(--es-font-size-10);
    --es-theme-font-weight-display-bold: var(--es-font-weight-700);
    --es-theme-font-weight-display-medium: var(--es-font-weight-500);
    --es-theme-line-height-display-xs: var(--es-line-height-8);
    --es-theme-line-height-display-s: var(--es-line-height-9);
    --es-theme-line-height-display-m: var(--es-line-height-10);
    --es-theme-line-height-display-l: var(--es-line-height-11);

    --es-theme-font-size-heading-xs: var(--es-font-size-2);
    --es-theme-font-size-heading-s: var(--es-font-size-3);
    --es-theme-font-size-heading-m: var(--es-font-size-5);
    --es-theme-font-size-heading-l: var(--es-font-size-6);
    --es-theme-font-weight-heading-bold: var(--es-font-weight-700);
    --es-theme-line-height-heading-xs: var(--es-line-height-3);
    --es-theme-line-height-heading-s: var(--es-line-height-4);
    --es-theme-line-height-heading-m: var(--es-line-height-6);
    --es-theme-line-height-heading-l: var(--es-line-height-7);

    --es-theme-font-size-label-xs: var(--es-font-size-1);
    --es-theme-font-size-label-s: var(--es-font-size-2);
    --es-theme-font-size-label-m: var(--es-font-size-3);
    --es-theme-font-size-label-l: var(--es-font-size-4);
    --es-theme-font-weight-label-bold: var(--es-font-weight-700);
    --es-theme-font-weight-label-medium: var(--es-font-weight-500);
    --es-theme-line-height-label-xs: var(--es-line-height-1);
    --es-theme-line-height-label-s: var(--es-line-height-2);
    --es-theme-line-height-label-m: var(--es-line-height-3);
    --es-theme-line-height-label-l: var(--es-line-height-4);

    --es-theme-font-size-body-xs: var(--es-font-size-1);
    --es-theme-font-size-body-s: var(--es-font-size-2);
    --es-theme-font-size-body-m: var(--es-font-size-3);
    --es-theme-font-size-body-l: var(--es-font-size-4);
    --es-theme-font-weight-body-regular: var(--es-font-weight-400);
    --es-theme-line-height-body-xs: var(--es-line-height-2);
    --es-theme-line-height-body-s: var(--es-line-height-3);
    --es-theme-line-height-body-m: var(--es-line-height-4);
    --es-theme-line-height-body-l: var(--es-line-height-5);

    /* Spacing */
    --es-theme-space-margin-xs: var(--es-space-4);
    --es-theme-space-margin-s: var(--es-space-8);
    --es-theme-space-margin-m: var(--es-space-12);
    --es-theme-space-margin-l: var(--es-space-16);
    --es-theme-space-margin-xl: var(--es-space-24);
    --es-theme-space-margin-xxl: var(--es-space-32);

    --es-theme-space-padding-s: var(--es-space-14);
    --es-theme-space-padding-m: var(--es-space-16);
    --es-theme-space-padding-l: var(--es-space-24);
    --es-theme-space-padding-xl: var(--es-space-32);
    --es-theme-space-padding-xxl: var(--es-space-40);

    --es-theme-space-padding-squished-xs: var(--es-space-4) var(--es-space-8);
    --es-theme-space-padding-squished-s: var(--es-space-8) var(--es-space-12);
    --es-theme-space-padding-squished-m: var(--es-space-8) var(--es-space-16);
    --es-theme-space-padding-squished-l: var(--es-space-12) var(--es-space-16);
    --es-theme-space-padding-squished-xl: var(--es-space-14) var(--es-space-16);

    /* Background */
    --es-theme-bg-primary-default: var(--es-white);
    --es-theme-bg-secondary-default: var(--es-neutral-50);
    --es-theme-bg-tertiary-default: var(--es-neutral-100);
    --es-theme-bg-negative-default: var(--es-negative-50);
    --es-theme-bg-positive-default: var(--es-positive-50);
    --es-theme-bg-warning-default: var(--es-warning-50);
    --es-theme-bg-info-default: var(--es-info-50);

    --es-theme-bg-inversed-primary-default: var(--es-dark);
    --es-theme-bg-inversed-secondary-default: var(--es-dark);
    --es-theme-bg-inversed-tertiary-default: var(--es-dark);
    --es-theme-bg-inversed-negative-default: var(--es-negative-500);
    --es-theme-bg-inversed-positive-default: var(--es-positive-500);
    --es-theme-bg-inversed-warning-default: var(--es-warning-500);
    --es-theme-bg-inversed-info-default: var(--es-info-500);

    --es-theme-bg-primary-hovered: var(--es-neutral-100);
    --es-theme-bg-secondary-hovered: var(--es-neutral-100);
    --es-theme-bg-tertiary-hovered: var(--es-neutral-100);
    --es-theme-bg-negative-hovered: var(--es-negative-100);
    --es-theme-bg-positive-hovered: var(--es-positive-100);
    --es-theme-bg-warning-hovered: var(--es-warning-100);
    --es-theme-bg-info-hovered: var(--es-info-100);

    --es-theme-bg-inversed-primary-hovered: var(--es-dark);
    --es-theme-bg-inversed-secondary-hovered: var(--es-dark);
    --es-theme-bg-inversed-tertiary-hovered: var(--es-dark);
    --es-theme-bg-inversed-negative-hovered: var(--es-negative-600);
    --es-theme-bg-inversed-positive-hovered: var(--es-positive-600);
    --es-theme-bg-inversed-warning-hovered: var(--es-warning-600);
    --es-theme-bg-inversed-info-hovered: var(--es-info-600);

    --es-theme-bg-primary-selected: var(--es-neutral-200);
    --es-theme-bg-secondary-selected: var(--es-neutral-200);
    --es-theme-bg-tertiary-selected: var(--es-neutral-200);
    --es-theme-bg-negative-selected: var(--es-negative-200);
    --es-theme-bg-positive-selected: var(--es-positive-200);
    --es-theme-bg-warning-selected: var(--es-warning-200);
    --es-theme-bg-info-selected: var(--es-info-200);

    --es-theme-bg-inversed-primary-selected: var(--es-dark);
    --es-theme-bg-inversed-secondary-selected: var(--es-dark);
    --es-theme-bg-inversed-tertiary-selected: var(--es-dark);
    --es-theme-bg-inversed-negative-selected: var(--es-negative-700);
    --es-theme-bg-inversed-positive-selected: var(--es-positive-700);
    --es-theme-bg-inversed-warning-selected: var(--es-warning-700);
    --es-theme-bg-inversed-info-selected: var(--es-info-700);

    --es-theme-bg-primary-disabled: var(--es-neutral-50);
    --es-theme-bg-secondary-disabled: var(--es-neutral-50);
    --es-theme-bg-tertiary-disabled: var(--es-neutral-50);
    --es-theme-bg-negative-disabled: var(--es-neutral-50);
    --es-theme-bg-positive-disabled: var(--es-neutral-50);
    --es-theme-bg-warning-disabled: var(--es-neutral-50);
    --es-theme-bg-info-disabled: var(--es-neutral-50);

    --es-theme-bg-inversed-primary-disabled: var(--es-neutral-50);
    --es-theme-bg-inversed-secondary-disabled: var(--es-neutral-50);
    --es-theme-bg-inversed-tertiary-disabled: var(--es-neutral-50);
    --es-theme-bg-inversed-negative-disabled: var(--es-neutral-50);
    --es-theme-bg-inversed-positive-disabled: var(--es-neutral-50);
    --es-theme-bg-inversed-warning-disabled: var(--es-neutral-50);
    --es-theme-bg-inversed-info-disabled: var(--es-neutral-50);

    /* Content */
    --es-theme-fg-primary-default: var(--es-neutral-900);
    --es-theme-fg-secondary-default: var(--es-neutral-600);
    --es-theme-fg-tertiary-default: var(--es-neutral-500);
    --es-theme-fg-negative-default: var(--es-negative-500);
    --es-theme-fg-positive-default: var(--es-positive-500);
    --es-theme-fg-warning-default: var(--es-warning-500);
    --es-theme-fg-info-default: var(--es-info-500);

    --es-theme-fg-inversed-primary-default: var(--es-white);
    --es-theme-fg-inversed-secondary-default: var(--es-white);
    --es-theme-fg-inversed-tertiary-default: var(--es-white);
    --es-theme-fg-inversed-negative-default: var(--es-white);
    --es-theme-fg-inversed-positive-default: var(--es-white);
    --es-theme-fg-inversed-warning-default: var(--es-white);
    --es-theme-fg-inversed-info-default: var(--es-white);

    --es-theme-fg-primary-hovered: var(--es-neutral-700);
    --es-theme-fg-secondary-hovered: var(--es-neutral-700);
    --es-theme-fg-tertiary-hovered: var(--es-neutral-700);
    --es-theme-fg-negative-hovered: var(--es-negative-600);
    --es-theme-fg-positive-hovered: var(--es-positive-600);
    --es-theme-fg-warning-hovered: var(--es-warning-600);
    --es-theme-fg-info-hovered: var(--es-info-600);

    --es-theme-fg-inversed-primary-hovered: var(--es-white);
    --es-theme-fg-inversed-secondary-hovered: var(--es-white);
    --es-theme-fg-inversed-tertiary-hovered: var(--es-white);
    --es-theme-fg-inversed-negative-hovered: var(--es-white);
    --es-theme-fg-inversed-positive-hovered: var(--es-white);
    --es-theme-fg-inversed-warning-hovered: var(--es-white);
    --es-theme-fg-inversed-info-hovered: var(--es-white);

    --es-theme-fg-primary-selected: var(--es-neutral-900);
    --es-theme-fg-secondary-selected: var(--es-neutral-900);
    --es-theme-fg-tertiary-selected: var(--es-neutral-900);
    --es-theme-fg-negative-selected: var(--es-negative-700);
    --es-theme-fg-positive-selected: var(--es-positive-700);
    --es-theme-fg-warning-selected: var(--es-warning-700);
    --es-theme-fg-info-selected: var(--es-info-700);

    --es-theme-fg-inversed-primary-selected: var(--es-white);
    --es-theme-fg-inversed-secondary-selected: var(--es-white);
    --es-theme-fg-inversed-tertiary-selected: var(--es-white);
    --es-theme-fg-inversed-negative-selected: var(--es-white);
    --es-theme-fg-inversed-positive-selected: var(--es-white);
    --es-theme-fg-inversed-warning-selected: var(--es-white);
    --es-theme-fg-inversed-info-selected: var(--es-white);

    --es-theme-fg-primary-disabled: var(--es-neutral-400);
    --es-theme-fg-secondary-disabled: var(--es-neutral-400);
    --es-theme-fg-tertiary-disabled: var(--es-neutral-400);
    --es-theme-fg-negative-disabled: var(--es-neutral-400);
    --es-theme-fg-positive-disabled: var(--es-neutral-400);
    --es-theme-fg-warning-disabled: var(--es-neutral-400);
    --es-theme-fg-info-disabled: var(--es-neutral-400);

    --es-theme-fg-inversed-primary-disabled: var(--es-neutral-400);
    --es-theme-fg-inversed-secondary-disabled: var(--es-neutral-400);
    --es-theme-fg-inversed-tertiary-disabled: var(--es-neutral-400);
    --es-theme-fg-inversed-negative-disabled: var(--es-neutral-400);
    --es-theme-fg-inversed-positive-disabled: var(--es-neutral-400);
    --es-theme-fg-inversed-warning-disabled: var(--es-neutral-400);
    --es-theme-fg-inversed-info-disabled: var(--es-neutral-400);

    /* Border */
    --es-theme-border-primary-default: var(--es-neutral-300);
    --es-theme-border-secondary-default: var(--es-neutral-500);
    --es-theme-border-tertiary-default: var(--es-neutral-500);
    --es-theme-border-negative-default: var(--es-negative-300);
    --es-theme-border-positive-default: var(--es-positive-300);
    --es-theme-border-warning-default: var(--es-warning-300);
    --es-theme-border-info-default: var(--es-info-300);

    --es-theme-border-inversed-primary-default: var(--es-neutral-300);
    --es-theme-border-inversed-secondary-default: var(--es-neutral-500);
    --es-theme-border-inversed-tertiary-default: var(--es-neutral-500);
    --es-theme-border-inversed-negative-default: var(--es-negative-300);
    --es-theme-border-inversed-positive-default: var(--es-positive-300);
    --es-theme-border-inversed-warning-default: var(--es-warning-300);
    --es-theme-border-inversed-info-default: var(--es-info-300);

    --es-theme-border-primary-hovered: var(--es-neutral-700);
    --es-theme-border-secondary-hovered: var(--es-neutral-700);
    --es-theme-border-tertiary-hovered: var(--es-neutral-700);
    --es-theme-border-negative-hovered: var(--es-negative-500);
    --es-theme-border-positive-hovered: var(--es-positive-500);
    --es-theme-border-warning-hovered: var(--es-warning-500);
    --es-theme-border-info-hovered: var(--es-info-500);

    --es-theme-border-inversed-primary-hovered: var(--es-neutral-700);
    --es-theme-border-inversed-secondary-hovered: var(--es-neutral-700);
    --es-theme-border-inversed-tertiary-hovered: var(--es-neutral-700);
    --es-theme-border-inversed-negative-hovered: var(--es-negative-500);
    --es-theme-border-inversed-positive-hovered: var(--es-positive-500);
    --es-theme-border-inversed-warning-hovered: var(--es-warning-500);
    --es-theme-border-inversed-info-hovered: var(--es-info-500);

    --es-theme-border-primary-selected: var(--es-neutral-900);
    --es-theme-border-secondary-selected: var(--es-neutral-900);
    --es-theme-border-tertiary-selected: var(--es-neutral-900);
    --es-theme-border-negative-selected: var(--es-negative-600);
    --es-theme-border-positive-selected: var(--es-positive-600);
    --es-theme-border-warning-selected: var(--es-warning-600);
    --es-theme-border-info-selected: var(--es-info-600);

    --es-theme-border-inversed-primary-selected: var(--es-neutral-900);
    --es-theme-border-inversed-secondary-selected: var(--es-neutral-900);
    --es-theme-border-inversed-tertiary-selected: var(--es-neutral-900);
    --es-theme-border-inversed-negative-selected: var(--es-negative-600);
    --es-theme-border-inversed-positive-selected: var(--es-positive-600);
    --es-theme-border-inversed-warning-selected: var(--es-warning-600);
    --es-theme-border-inversed-info-selected: var(--es-info-600);

    --es-theme-border-primary-disabled: var(--es-neutral-200);
    --es-theme-border-secondary-disabled: var(--es-neutral-200);
    --es-theme-border-tertiary-disabled: var(--es-neutral-200);
    --es-theme-border-negative-disabled: var(--es-neutral-200);
    --es-theme-border-positive-disabled: var(--es-neutral-200);
    --es-theme-border-warning-disabled: var(--es-neutral-200);
    --es-theme-border-info-disabled: var(--es-neutral-200);

    --es-theme-border-inversed-primary-disabled: var(--es-neutral-200);
    --es-theme-border-inversed-secondary-disabled: var(--es-neutral-200);
    --es-theme-border-inversed-tertiary-disabled: var(--es-neutral-200);
    --es-theme-border-inversed-negative-disabled: var(--es-neutral-200);
    --es-theme-border-inversed-positive-disabled: var(--es-neutral-200);
    --es-theme-border-inversed-warning-disabled: var(--es-neutral-200);
    --es-theme-border-inversed-info-disabled: var(--es-neutral-200);
  }

  /* reset */
  html {
    font-size: 16px;
  }

  *,
  *:before,
  *:after {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    font-size: 1rem;
    line-height: 1rem;
    font-family: var(--es-theme-font-family);
  }
`

export default GlobalStyle
