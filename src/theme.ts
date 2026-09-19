import { createTheme, type MantineColorsTuple } from '@mantine/core';

const brand: MantineColorsTuple = [
  '#eef2ff',
  '#dbe2fb',
  '#b4c1f2',
  '#8b9eea',
  '#6a80e3',
  '#556ddf',
  '#4a63de',
  '#3b53c5',
  '#3349b1',
  '#283e9c',
];

export const theme = createTheme({
  primaryColor: 'brand',
  colors: { brand },
  defaultRadius: 'md',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  headings: { fontWeight: '650' },
  components: {
    Button: { defaultProps: { fw: 550 } },
  },
});
