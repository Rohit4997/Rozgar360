import { colors, ColorTheme } from './colors';
import { typography, Typography } from './typography';
import { spacing, Spacing } from './spacing';

export interface Theme {
  colors: ColorTheme;
  typography: Typography;
  spacing: Spacing;
}

export const theme: Theme = {
  colors,
  typography,
  spacing,
};

export { colors, typography, spacing };
export type { ColorTheme, Typography, Spacing };

