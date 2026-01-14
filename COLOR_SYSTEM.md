# Velolink Color System

## Overview
The Velolink project uses a comprehensive color system built on **Tailwind CSS** with custom color variables defined in CSS. The primary color scheme is based on **Indigo/Purple** tones, with semantic colors for status indicators and feedback.

---

## Brand Colors

### Primary Colors
| Color Name | Hex Code | CSS Variable | Usage |
|------------|----------|--------------|-------|
| Primary Accent | `#6366F1` | `--primary-accent` | Primary brand color, CTAs, links |
| Secondary Accent | `#06B6D4` | `--secondary-accent` | Secondary highlights, accents |

### Primary Color Palette (Tailwind Extended)
The project extends Tailwind with a custom primary color scale:

| Shade | Hex Code | Tailwind Class | Usage |
|-------|----------|----------------|-------|
| primary-50 | `#f5f3ff` | `bg-primary-50` | Very light backgrounds |
| primary-100 | `#ede9fe` | `bg-primary-100` | Light backgrounds |
| primary-200 | `#ddd6fe` | `bg-primary-200` | Hover states |
| primary-300 | `#c4b5fd` | `bg-primary-300` | Disabled states |
| primary-400 | `#a78bfa` | `bg-primary-400` | Secondary elements |
| primary-500 | `#8b5cf6` | `bg-primary-500` | Primary elements |
| primary-600 | `#7c3aed` | `bg-primary-600` | Primary hover |
| primary-700 | `#6d28d9` | `bg-primary-700` | Primary active |
| primary-800 | `#5b21b6` | `bg-primary-800` | Dark primary |
| primary-900 | `#4c1d95` | `bg-primary-900` | Darkest primary |

---

## Semantic Colors

### Status & Feedback Colors
| Status | Hex Code | CSS Variable | Usage |
|--------|----------|--------------|-------|
| Success | `#3C9D55` | `--success` | Success messages, confirmations |
| Warning | `#F9A825` | `--warning` | Warnings, cautions |
| Danger/Error | `#ef4444` | N/A | Errors, destructive actions |

### Status Badge Colors
Used throughout the application for content and payment status:

| Status | Background | Text | Usage |
|--------|------------|------|-------|
| APPROVED | `bg-green-100` (#dcfce7) | `text-green-700` (#15803d) | Approved content |
| COMPLETED | `bg-green-100` (#dcfce7) | `text-green-700` (#15803d) | Completed payments |
| PENDING_REVIEW | `bg-yellow-100` (#fef3c7) | `text-yellow-700` (#b45309) | Under review |
| PENDING | `bg-yellow-100` (#fef3c7) | `text-yellow-700` (#b45309) | Pending payments |
| REJECTED | `bg-red-100` (#fee2e2) | `text-red-700` (#b91c1c) | Rejected content |
| FAILED | `bg-red-100` (#fee2e2) | `text-red-700` (#b91c1c) | Failed payments |
| FLAGGED | `bg-orange-100` (#ffedd5) | `text-orange-700` (#b45309) | Flagged content |
| REMOVED | `bg-gray-100` (#f3f4f6) | `text-gray-700` (#374151) | Removed content |

---

## Neutral Colors

### Text & Background
| Color Name | Hex Code | CSS Variable | Usage |
|------------|----------|--------------|-------|
| Dark Text | `#1D3557` | `--dark-bg-text` | Primary text on light backgrounds |
| Dark Background | `#111827` | `--dark-bg` | Dark mode background |
| Card Surface | `#F8FAFC` | `--card-surface` | Card backgrounds, surfaces |
| White | `#ffffff` | N/A | Pure white backgrounds |

### Gray Scale (Tailwind)
The project extensively uses Tailwind's gray scale:

- **Gray-50** (`#f9fafb`) - Lightest gray backgrounds
- **Gray-100** (`#f3f4f6`) - Light backgrounds
- **Gray-200** (`#e5e7eb`) - Borders, dividers
- **Gray-300** (`#d1d5db`) - Disabled elements
- **Gray-400** (`#9ca3af`) - Placeholder text
- **Gray-500** (`#6b7280`) - Secondary text
- **Gray-600** (`#4b5563`) - Body text
- **Gray-700** (`#374151`) - Headings
- **Gray-800** (`#1f2937`) - Dark text
- **Gray-900** (`#111827`) - Darkest text

---

## Stripe Payment Theme

Colors used in the Stripe payment UI:

| Property | Hex Code | Usage |
|----------|----------|-------|
| Color Primary | `#4f46e5` | Primary indigo for Stripe elements |
| Color Background | `#ffffff` | White background |
| Color Text | `#1f2937` | Dark gray text |
| Color Danger | `#ef4444` | Error states |

*Location:* [PaymentClient.tsx](client/src/app/checkout/[id]/payment/PaymentClient.tsx)

---

## Data Visualization Colors

### Chart & SVG Colors
Used in analytics dashboards and visualizations:

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Data | `#6366f1` | Main data series |
| Secondary Data | `#8b5cf6` | Secondary data series |
| Tertiary Data | `#a78bfa` | Additional data series |
| Grid Lines | `#e5e7eb` | Chart gridlines |
| Backgrounds | `#cbd5e1` | Chart backgrounds |
| Labels | `#6b7280` | Axis labels, legends |

---

## Tailwind Color Families in Use

The project uses the following Tailwind color families:

- **Blue** - Links, information states
- **Cyan** - Secondary accents, highlights
- **Gray** - Neutrals, text, borders (primary neutral palette)
- **Green** - Success states, positive indicators
- **Indigo** - Primary brand color
- **Orange** - Warnings, moderate alerts
- **Pink** - Accent elements
- **Purple** - Brand accents, secondary primary
- **Red** - Errors, destructive actions
- **Yellow** - Warnings, caution states

---

## Configuration Files

### Tailwind Config
[tailwind.config.ts](client/tailwind.config.ts)
- Contains custom primary color palette extension
- Defines custom color scales

### Global CSS
[globals.css](client/src/app/globals.css)
- Contains CSS custom properties (variables)
- Defines brand colors and semantic colors

---

## Usage Guidelines

### Do's ✓
- Use `--primary-accent` (#6366F1) for primary CTAs and brand elements
- Use semantic colors (`--success`, `--warning`) for status feedback
- Use Tailwind color classes for consistency
- Use status badge color combinations for content states
- Maintain contrast ratios for accessibility (WCAG AA minimum)

### Don'ts ✗
- Don't use hard-coded hex values when CSS variables exist
- Don't create new colors without updating this documentation
- Don't use primary colors for destructive actions (use red/danger)
- Don't mix color systems (stick to Tailwind + CSS variables)

---

## Color Accessibility

### Contrast Ratios
All color combinations should meet WCAG 2.1 Level AA standards:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Testing
Test color combinations using tools like:
- WebAIM Contrast Checker
- Chrome DevTools Accessibility Panel
- WAVE Browser Extension

---

## Last Updated
January 1, 2026
