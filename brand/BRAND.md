# Victor Brand Guide

## Brand Essence

Victor is an Uber-style marketplace for plumbing and electrical domestic services. The brand must communicate trust, professionalism, and modern technology to two audiences: homeowners seeking reliable help and tradespeople seeking a serious platform.

## Brand Voice

**Five adjectives, in priority order:**

1. **Reliable** -- We show up when we say we will. No overpromising.
2. **Direct** -- No jargon, no filler. Clear communication that respects your time.
3. **Competent** -- Quiet expertise. The brand knows what it's doing.
4. **Warm** -- Professional doesn't mean cold. We're human and approachable.
5. **Modern** -- Technology that works, not a directory listing from 2005.

Lead with Reliable and Direct. Soften with Warm. Underpin with Competent. Express through Modern.

## Color System

### Primary Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Deep Navy | `#1B2A4A` | Buttons, headings, hero backgrounds, navigation |
| Accent | Warm Amber | `#E8A020` | CTAs, interactive elements, ratings, highlights |

### Semantic Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Success | Forest Green | `#2D8F5E` | Confirmations, completed states |
| Warning | Amber | `#E8A020` | Warnings (shared with accent) |
| Error | Crimson | `#D94052` | Errors, destructive actions |
| Info | Steel Blue | `#3B7DD8` | Informational states |

### Neutral Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Text primary | Charcoal | `#1A1A2E` | Headings, primary text |
| Text secondary | Slate | `#4A4A5A` | Body text, descriptions |
| Text muted | Storm | `#8B8B9E` | Placeholders, disabled text |
| Border | Fog | `#E2E2EA` | Borders, dividers |
| Surface | Mist | `#F0F0F5` | Card backgrounds, sections |
| Background | Cloud | `#F8F8FC` | Page backgrounds |
| White | White | `#FFFFFF` | Cards, modals, inputs |

## Typography

**Font family:** Inter (Google Fonts, variable weight 100-900)

| Role | Weight | Size | Tracking |
|------|--------|------|----------|
| Display (hero) | 700 (Bold) | 48-60px | -0.025em |
| Heading (h2) | 700 (Bold) | 30-36px | -0.025em |
| Subheading (h3) | 600 (Semibold) | 24px | -0.015em |
| Body | 400 (Regular) | 16px | normal |
| Body emphasis | 500 (Medium) | 16px | normal |
| Small/Caption | 400 (Regular) | 14px | normal |
| Label | 500 (Medium) | 14px | 0.01em |

## Logo

The Victor logo is a **lettermark** -- a bold "V" inside a rounded square container.

- **Mark:** White "V" on Deep Navy (#1B2A4A) background
- **Corners:** 8px radius (matches --radius token)
- **Sizes:** 32px (footer), 36px (header), 48px (hero/splash)
- **Wordmark:** "Victor" in Inter Bold, tracking-tight, beside the mark
- **SVG files:** `/brand/logo-mark.svg`, `/brand/logo-full.svg`

Usage rules:
- Always maintain 8px minimum clear space around the mark
- On dark backgrounds, invert to Navy "V" on White container, or use White "V" on transparent with amber accent
- Never stretch, rotate, or add effects to the logo

## Visual Style

- **Photography over illustration** for trust
- **Dark hero sections** using Deep Navy background
- **Generous white space** -- let the design breathe
- **Card-based UI** with 12px border-radius and subtle elevation
- **Icon style:** Lucide icons, 2px stroke, rounded caps
- **Shadows:** `0 1px 3px rgba(27, 42, 74, 0.08)` for cards

## Component Patterns

### Buttons

- **Primary:** Deep Navy background, white text. Hover: lighten to `#243557`
- **Accent/CTA:** Warm Amber background, Deep Navy text. Hover: darken to `#D4911C`
- **Secondary:** White background, Navy border, Navy text. Hover: Mist background
- **Ghost:** Transparent, Navy text. Hover: Mist background

### Cards

- White background, Fog border, 12px radius
- Hover: border darkens slightly, subtle shadow appears
- Active/selected: Amber left border or amber ring

### Trust Badges

- "Victor Verified" badge: Amber check icon + navy text
- Ratings: Amber filled stars
- Certification: Shield icon in Navy

## CSS Custom Properties

All colors are defined as CSS custom properties in `globals.css` using oklch color space for shadcn/ui compatibility. See `globals.css` for the definitive token values.

## File Structure

```
brand/
  BRAND.md          -- This file (brand guide)
  logo-mark.svg     -- V lettermark only
  logo-full.svg     -- Lettermark + wordmark
```
