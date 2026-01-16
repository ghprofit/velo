# System Fonts Reference

A comprehensive guide to system fonts available across different operating systems for web development.

## Sans-Serif Fonts

### Cross-Platform Sans-Serif

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Font Name | Windows | macOS | Linux | iOS | Android |
|-----------|---------|-------|-------|-----|---------|
| Arial | ✓ | ✓ | ✓ | ✓ | ✓ |
| Helvetica | - | ✓ | ✓ | ✓ | - |
| Helvetica Neue | - | ✓ | - | ✓ | - |
| Segoe UI | ✓ | - | - | - | - |
| Roboto | - | - | ✓ | - | ✓ |
| San Francisco (system-ui) | - | ✓ | - | ✓ | - |
| Verdana | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tahoma | ✓ | ✓ | ✓ | - | - |
| Trebuchet MS | ✓ | ✓ | ✓ | ✓ | - |

### Platform-Specific Sans-Serif

**Windows:**
- Segoe UI
- Calibri
- Candara
- Corbel
- Franklin Gothic Medium
- Arial Black

**macOS/iOS:**
- San Francisco (SF Pro Display, SF Pro Text)
- Helvetica Neue
- Lucida Grande

**Android:**
- Roboto
- Noto Sans

**Linux:**
- Ubuntu
- Cantarell
- DejaVu Sans
- Liberation Sans

## Serif Fonts

### Cross-Platform Serif

```css
font-family: Georgia, "Times New Roman", Times, serif;
```

| Font Name | Windows | macOS | Linux | iOS | Android |
|-----------|---------|-------|-------|-----|---------|
| Times New Roman | ✓ | ✓ | ✓ | ✓ | ✓ |
| Georgia | ✓ | ✓ | ✓ | ✓ | ✓ |
| Palatino | - | ✓ | - | ✓ | - |
| Garamond | ✓ | ✓ | ✓ | - | - |
| Bookman | ✓ | ✓ | ✓ | - | - |

### Platform-Specific Serif

**Windows:**
- Cambria
- Constantia
- Book Antiqua

**macOS:**
- New York
- Baskerville
- Palatino

**Linux:**
- Liberation Serif
- DejaVu Serif

## Monospace Fonts

### Cross-Platform Monospace

```css
font-family: "Courier New", Courier, Monaco, Menlo, Consolas, monospace;
```

| Font Name | Windows | macOS | Linux | iOS | Android |
|-----------|---------|-------|-------|-----|---------|
| Courier New | ✓ | ✓ | ✓ | ✓ | ✓ |
| Courier | ✓ | ✓ | ✓ | ✓ | ✓ |
| Monaco | - | ✓ | - | ✓ | - |
| Menlo | - | ✓ | - | ✓ | - |
| Consolas | ✓ | - | - | - | - |

### Platform-Specific Monospace

**Windows:**
- Consolas
- Lucida Console

**macOS:**
- SF Mono
- Monaco
- Menlo

**Linux:**
- Ubuntu Mono
- Liberation Mono
- DejaVu Sans Mono

## System Font Stack Recommendations

### Modern System Font Stack (Recommended)

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial,
             "Noto Sans", sans-serif, "Apple Color Emoji",
             "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

This stack provides:
- Native look on each platform
- Optimal rendering
- Consistent experience

### Alternative Sans-Serif Stacks

**Neutral & Clean:**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
             Helvetica, Arial, sans-serif;
```

**Geometric:**
```css
font-family: "Avenir Next", "Avenir", "Century Gothic",
             "Trebuchet MS", sans-serif;
```

**Humanist:**
```css
font-family: "Segoe UI", "Frutiger", "Helvetica Neue",
             Helvetica, Arial, sans-serif;
```

### Serif Stacks

**Traditional:**
```css
font-family: Georgia, "Times New Roman", Times, serif;
```

**Modern Serif:**
```css
font-family: "Iowan Old Style", "Palatino Linotype",
             Palatino, Georgia, serif;
```

**Transitional:**
```css
font-family: "Cambria", Georgia, Times, serif;
```

### Monospace Stacks

**Code Editor Style:**
```css
font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
             Consolas, "Courier New", monospace;
```

**Classic Terminal:**
```css
font-family: Consolas, Monaco, "Courier New", Courier, monospace;
```

## CSS System Font Keywords

Modern CSS provides generic keywords that automatically use the system's default font:

```css
/* Use system UI font */
font-family: system-ui;

/* Use system UI font with emoji support */
font-family: ui-sans-serif;

/* System serif font */
font-family: ui-serif;

/* System monospace font */
font-family: ui-monospace;

/* System rounded font */
font-family: ui-rounded;
```

## Font Features by Platform

### Windows (Segoe UI)
- Clean, modern appearance
- Excellent screen readability
- Optimized for ClearType

### macOS/iOS (San Francisco)
- Dynamic spacing (text vs display)
- Optical sizing
- Superior legibility at all sizes

### Android (Roboto)
- Geometric with friendly curves
- Optimized for mobile screens
- Wide character support

### Linux
- Varies by distribution
- Ubuntu: Ubuntu font family
- Fedora: Cantarell
- Fallback: Liberation fonts, DejaVu

## Best Practices

1. **Always include fallbacks**: List fonts from most specific to most generic
2. **Test across platforms**: Fonts render differently on various systems
3. **Consider performance**: System fonts load instantly (no web font download)
4. **Respect user preferences**: System fonts honor OS-level accessibility settings
5. **Quote font names with spaces**: `"Times New Roman"` not `Times New Roman`
6. **End with generic family**: Always end with `sans-serif`, `serif`, or `monospace`

## Common Font Stack Patterns

### Pattern 1: Platform-First
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

### Pattern 2: Named-First
```css
font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
```

### Pattern 3: System-UI First (Modern)
```css
font-family: system-ui, sans-serif;
```

## Variable Fonts

Some modern system fonts support variable font technology:

| Font | Platform | Variable Axes |
|------|----------|---------------|
| San Francisco | macOS/iOS | Weight, Width |
| Segoe UI Variable | Windows 11 | Weight, Optical Size |
| Roboto Flex | Android 12+ | Weight, Width, Optical Size |

## Emoji Support

Include emoji fonts at the end of your stack:

```css
font-family: system-ui, sans-serif,
             "Apple Color Emoji",      /* macOS/iOS */
             "Segoe UI Emoji",         /* Windows */
             "Noto Color Emoji";       /* Linux/Android */
```

## Resources

- [MDN Web Docs - font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family)
- [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/)
- [System Font Stack](https://systemfontstack.com/)
- [Modern Font Stacks](https://modernfontstacks.com/)

---

**Last Updated:** 2026-01-16
