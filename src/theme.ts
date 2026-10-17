import { createTheme, type MantineColorsTuple } from '@mantine/core';

/**
 * Palette taken from the logo mark. Teal is the primary because it carries the
 * brand without reading as clinical; the rest are available for accents and
 * for colour-coding modalities.
 */
const teal: MantineColorsTuple = [
  '#f0faf9', '#dbf3f1', '#ade3df', '#80d2ce', '#52c2bc',
  '#29b4ac', '#00a69c', '#009289', '#007b73', '#00605a',
];

const plum: MantineColorsTuple = [
  '#f9f2f6', '#f1e0e9', '#e0b7cd', '#ce8fb1', '#bd6795',
  '#ae437c', '#9e1f63', '#8b1b57', '#751749', '#5c1239',
];

const sky: MantineColorsTuple = [
  '#f2fafd', '#e1f3fb', '#bae3f5', '#92d4f0', '#6bc5ea',
  '#49b7e5', '#26a9e0', '#2195c5', '#1c7da6', '#166282',
];

const indigo: MantineColorsTuple = [
  '#f2f3f8', '#e1e3ef', '#bbbfdb', '#959cc7', '#6f78b3',
  '#4d58a1', '#2b388f', '#26317e', '#20296a', '#192053',
];

const coral: MantineColorsTuple = [
  '#fef8f2', '#fef0e0', '#fcdcb7', '#fac88e', '#f9b566',
  '#f7a342', '#f6921e', '#d8801a', '#b66c16', '#8f5511',
];

const pink: MantineColorsTuple = [
  '#fef2f7', '#fce1ed', '#f9bbd5', '#f694bd', '#f26da5',
  '#ef4b90', '#ec297b', '#d0246c', '#af1e5b', '#891847',
];

const charcoal: MantineColorsTuple = [
  '#f4f4f4', '#e4e4e4', '#c2c2c2', '#a0a0a0', '#7d7d7e',
  '#5f5f5f', '#404041', '#383839', '#2f2f30', '#252526',
];

export const theme = createTheme({
  primaryColor: 'teal',
  colors: { teal, plum, sky, indigo, coral, pink, charcoal },
  defaultRadius: 'md',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  headings: { fontWeight: '650' },
  components: {
    Button: { defaultProps: { fw: 550 } },
  },
});

/** Badge colour per practitioner tier. */
export const TIER_COLOR = {
  partner: 'teal',
  verified: 'indigo',
  standard: 'gray',
} as const;

export const TIER_LABEL = {
  partner: 'Partner',
  verified: 'Verified',
  standard: '',
} as const;
