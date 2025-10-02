# Accessibility Testing Guide

## Overview
This document outlines the accessibility improvements made to BetterMaps and how to test them.

## Text Contrast Improvements

### Color Scheme
- **Headings**: `text-gray-900` (dark mode: `text-white`)
- **Body text**: `text-gray-700` (dark mode: `text-gray-200`) 
- **Subtext**: `text-gray-600` (dark mode: `text-gray-300`)

### Dark Mode Support
- Toggle available in navbar (sun/moon icon)
- Persists preference in localStorage
- Respects system preference by default
- All components support dark mode theming

## Testing with Chrome Lighthouse

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Run audit on main pages:
   - Home page (/)
   - Planner (/planner) 
   - Feedback (/feedback)
   - Download (/download)

### Expected Results
- **Contrast**: Should score 100% (all text meets WCAG AA standards)
- **Color**: No reliance on color alone for information
- **Focus**: All interactive elements have visible focus states
- **ARIA**: Proper labeling and semantic markup

## Manual Testing

### Keyboard Navigation
- Tab through all interactive elements
- Ensure focus is visible and logical
- Test dark mode toggle with keyboard

### Screen Reader Testing
- Test with screen reader (NVDA, JAWS, or VoiceOver)
- Verify all content is announced correctly
- Check that semantic HTML is used properly

### Color Contrast Testing
- Use tools like WebAIM Contrast Checker
- Test both light and dark modes
- Verify all text meets WCAG AA standards (4.5:1 ratio)

## Typography Plugin
- Installed `@tailwindcss/typography` for enhanced readability
- Better line spacing and text proportions
- Consistent typography scale across components

## Components Updated
- [x] HomePage (feature cards, How It Works section)
- [x] AnimatedHero
- [x] Navbar (with dark mode toggle)
- [x] Footer
- [x] DistanceTable
- [x] App layout (_app.tsx)

## Accessibility Features
- Proper heading hierarchy (h1, h2, h3, h4)
- Semantic HTML elements
- ARIA labels where needed
- Keyboard focus management
- High contrast text colors
- Dark mode support
- Responsive design for all screen sizes
