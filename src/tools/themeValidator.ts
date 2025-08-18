// src/tools/themeValidator.ts
import { ThemeSpec } from '../styles/themeEngine';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  recommendation?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  score: number; // 0-100 quality score
}

// Color contrast calculation utilities
class ContrastUtils {
  static hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  static getLuminance(r: number, g: number, b: number): number {
    const sRGB = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  static getContrastRatio(color1: string, color2: string): number {
    const [r1, g1, b1] = this.hexToRgb(color1);
    const [r2, g2, b2] = this.hexToRgb(color2);
    
    const lum1 = this.getLuminance(r1, g1, b1);
    const lum2 = this.getLuminance(r2, g2, b2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  static meetsWCAG(ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
}

export function validateThemeSpec(spec: ThemeSpec): ValidationResult {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // Validate basic structure
  if (!spec.id || !spec.name || !spec.description) {
    issues.push({
      type: 'error',
      field: 'basic',
      message: 'Missing required basic information (id, name, or description)',
    });
    score -= 20;
  }

  // Validate ID format
  if (spec.id && !/^[a-z0-9-]+$/.test(spec.id)) {
    issues.push({
      type: 'error',
      field: 'id',
      message: 'Theme ID must be kebab-case (lowercase, numbers, hyphens only)',
      recommendation: 'Use format like "grumpy-cat" or "80s-neon"',
    });
    score -= 10;
  }

  // Validate colors
  const colorValidation = validateColors(spec.colors);
  issues.push(...colorValidation.issues);
  score -= colorValidation.penalty;

  // Validate typography
  const typographyValidation = validateTypography(spec.typography);
  issues.push(...typographyValidation.issues);
  score -= typographyValidation.penalty;

  // Validate geometry
  const geometryValidation = validateGeometry(spec.geometry);
  issues.push(...geometryValidation.issues);
  score -= geometryValidation.penalty;

  // Calculate final score
  score = Math.max(0, score);
  
  return {
    valid: issues.filter(issue => issue.type === 'error').length === 0,
    issues,
    score,
  };
}

function validateColors(colors: ThemeSpec['colors']) {
  const issues: ValidationIssue[] = [];
  let penalty = 0;

  // Validate hex format
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  Object.entries(colors).forEach(([key, value]) => {
    if (!hexRegex.test(value)) {
      issues.push({
        type: 'error',
        field: `colors.${key}`,
        message: `Invalid hex color format: ${value}`,
        recommendation: 'Use 6-digit hex format like #FF0000',
      });
      penalty += 15;
    }
  });

  // Stop validation if hex format is invalid
  if (penalty > 0) return { issues, penalty };

  // Check contrast ratios
  const textOnSurface = ContrastUtils.getContrastRatio(colors.text, colors.surface);
  if (!ContrastUtils.meetsWCAG(textOnSurface)) {
    issues.push({
      type: 'error',
      field: 'colors.text',
      message: `Text/surface contrast ratio ${textOnSurface.toFixed(2)} fails WCAG AA (needs 4.5+)`,
      recommendation: 'Make text darker or surface lighter for better readability',
    });
    penalty += 20;
  } else if (textOnSurface < 7) {
    issues.push({
      type: 'warning',
      field: 'colors.text',
      message: `Text/surface contrast ratio ${textOnSurface.toFixed(2)} meets AA but not AAA standards`,
      recommendation: 'Consider improving contrast for enhanced accessibility',
    });
    penalty += 5;
  }

  const primaryOnSurface = ContrastUtils.getContrastRatio(colors.primary, colors.surface);
  if (primaryOnSurface < 3) {
    issues.push({
      type: 'warning',
      field: 'colors.primary',
      message: `Primary/surface contrast ratio ${primaryOnSurface.toFixed(2)} is low`,
      recommendation: 'Ensure primary color stands out from background',
    });
    penalty += 10;
  }

  const accentOnSurface = ContrastUtils.getContrastRatio(colors.accent, colors.surface);
  if (accentOnSurface < 3) {
    issues.push({
      type: 'warning',
      field: 'colors.accent',
      message: `Accent/surface contrast ratio ${accentOnSurface.toFixed(2)} is low`,
      recommendation: 'Ensure accent color is visible against background',
    });
    penalty += 5;
  }

  // Check for color harmony
  const colorHarmony = assessColorHarmony(colors);
  if (colorHarmony.issues.length > 0) {
    issues.push(...colorHarmony.issues);
    penalty += colorHarmony.penalty;
  }

  return { issues, penalty };
}

function validateTypography(typography: ThemeSpec['typography']) {
  const issues: ValidationIssue[] = [];
  let penalty = 0;

  // Validate font stacks
  if (!typography.primaryFont.includes(',')) {
    issues.push({
      type: 'warning',
      field: 'typography.primaryFont',
      message: 'Primary font lacks fallback fonts',
      recommendation: 'Include web-safe fallbacks like "Arial, sans-serif"',
    });
    penalty += 5;
  }

  if (!typography.headingFont.includes(',')) {
    issues.push({
      type: 'warning',
      field: 'typography.headingFont',
      message: 'Heading font lacks fallback fonts',
      recommendation: 'Include web-safe fallbacks for better compatibility',
    });
    penalty += 5;
  }

  // Validate font scale ratio
  if (typography.fontScaleRatio < 1.1 || typography.fontScaleRatio > 1.5) {
    issues.push({
      type: 'warning',
      field: 'typography.fontScaleRatio',
      message: `Font scale ratio ${typography.fontScaleRatio} is outside recommended range`,
      recommendation: 'Use ratios between 1.125 (minor third) and 1.414 (√2) for better hierarchy',
    });
    penalty += 10;
  }

  return { issues, penalty };
}

function validateGeometry(geometry: ThemeSpec['geometry']) {
  const issues: ValidationIssue[] = [];
  let penalty = 0;

  // Validate spacing unit
  if (geometry.baseSpacingUnit < 4 || geometry.baseSpacingUnit > 32) {
    issues.push({
      type: 'warning',
      field: 'geometry.baseSpacingUnit',
      message: `Base spacing unit ${geometry.baseSpacingUnit}px is outside typical range`,
      recommendation: 'Use 8px, 12px, or 16px for most designs',
    });
    penalty += 5;
  }

  // Validate border radius
  if (geometry.baseBorderRadius < 0 || geometry.baseBorderRadius > 24) {
    issues.push({
      type: 'warning',
      field: 'geometry.baseBorderRadius',
      message: `Base border radius ${geometry.baseBorderRadius}px seems extreme`,
      recommendation: 'Use 0px for sharp themes, 4-12px for moderate, 16px+ for very rounded',
    });
    penalty += 5;
  }

  return { issues, penalty };
}

function assessColorHarmony(colors: ThemeSpec['colors']) {
  const issues: ValidationIssue[] = [];
  let penalty = 0;

  // Convert colors to HSL for harmony analysis
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const primaryHsl = hexToHsl(colors.primary);
  const accentHsl = hexToHsl(colors.accent);
  
  // Check if colors are too similar
  const hueDifference = Math.abs(primaryHsl[0] - accentHsl[0]);
  const normalizedHueDiff = Math.min(hueDifference, 360 - hueDifference);
  
  if (normalizedHueDiff < 30) {
    issues.push({
      type: 'info',
      field: 'colors',
      message: 'Primary and accent colors are very similar in hue',
      recommendation: 'Consider more contrasting colors for better visual hierarchy',
    });
    penalty += 5;
  }

  return { issues, penalty };
}

// Asset validation (requires async file checking)
export async function validateThemeAssets(themeId: string): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];
  let score = 100;

  const requiredAssets = [
    'logo.png',
    'home-find-restaurants.png',
    'home-discover-dishes.png',
    'find-restaurant-hero.png',
    'about-hero.png',
    'discovery-hero.png',
    'ratings-hero.png',
    'restaurant-default.png',
  ];

  for (const asset of requiredAssets) {
    try {
      const response = await fetch(`/themes/${themeId}/${asset}`);
      if (!response.ok) {
        issues.push({
          type: 'error',
          field: 'assets',
          message: `Missing required asset: ${asset}`,
          recommendation: `Add ${asset} to /public/themes/${themeId}/`,
        });
        score -= 12.5; // 100 / 8 assets
      }
    } catch {
      issues.push({
        type: 'error',
        field: 'assets',
        message: `Cannot validate asset: ${asset}`,
        recommendation: 'Ensure all required assets are properly named and located',
      });
      score -= 12.5;
    }
  }

  return {
    valid: issues.filter(issue => issue.type === 'error').length === 0,
    issues,
    score,
  };
}

// Generate validation report
export function generateValidationReport(result: ValidationResult): string {
  let report = `## Theme Validation Report\n\n`;
  report += `**Overall Score**: ${result.score}/100\n`;
  report += `**Status**: ${result.valid ? '✅ Valid' : '❌ Invalid'}\n\n`;

  if (result.issues.length === 0) {
    report += `🎉 Perfect! No issues found.\n`;
    return report;
  }

  const errors = result.issues.filter(i => i.type === 'error');
  const warnings = result.issues.filter(i => i.type === 'warning');
  const info = result.issues.filter(i => i.type === 'info');

  if (errors.length > 0) {
    report += `### ❌ Errors (${errors.length})\n`;
    errors.forEach(issue => {
      report += `- **${issue.field}**: ${issue.message}\n`;
      if (issue.recommendation) {
        report += `  *Recommendation*: ${issue.recommendation}\n`;
      }
      report += '\n';
    });
  }

  if (warnings.length > 0) {
    report += `### ⚠️ Warnings (${warnings.length})\n`;
    warnings.forEach(issue => {
      report += `- **${issue.field}**: ${issue.message}\n`;
      if (issue.recommendation) {
        report += `  *Recommendation*: ${issue.recommendation}\n`;
      }
      report += '\n';
    });
  }

  if (info.length > 0) {
    report += `### ℹ️ Info (${info.length})\n`;
    info.forEach(issue => {
      report += `- **${issue.field}**: ${issue.message}\n`;
      if (issue.recommendation) {
        report += `  *Recommendation*: ${issue.recommendation}\n`;
      }
      report += '\n';
    });
  }

  return report;
}