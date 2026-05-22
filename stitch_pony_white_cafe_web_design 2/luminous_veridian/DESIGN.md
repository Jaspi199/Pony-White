---
name: Luminous Veridian
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#414845'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#717975'
  outline-variant: '#c1c8c4'
  surface-tint: '#42655a'
  primary: '#001a13'
  on-primary: '#ffffff'
  primary-container: '#0b3027'
  on-primary-container: '#75998d'
  inverse-primary: '#a9cfc1'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#141716'
  on-tertiary: '#ffffff'
  tertiary-container: '#282b2b'
  on-tertiary-container: '#909291'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c4ebdd'
  primary-fixed-dim: '#a9cfc1'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#2b4d43'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e1e3e2'
  tertiary-fixed-dim: '#c5c7c6'
  on-tertiary-fixed: '#191c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e2e0'
  forest-velvet: '#0B3027'
  premium-gold: '#C5A059'
  marble-white: '#FFFFFF'
  vein-gray: '#E0E0E0'
  latte-peach: '#FFCBAA'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-mobile: 20px
  margin-desktop: 64px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 80px
---

## Brand & Style

The brand personality is one of **Refined Minimalism**, evoking an atmosphere of quiet luxury, botanical freshness, and high-end artisanal craft. It targets a discerning, lifestyle-oriented audience that values aesthetic "Instagrammable" moments as much as product quality. The UI should feel airy, expensive, and serene.

The design style is **Corporate / Modern** infused with **Minimalist** discipline. It relies on expansive white space to mimic bright natural light reflecting off marble, while using deep forest greens and metallic accents to provide a sense of grounded, velvet-like texture and premium weight. The interface avoids unnecessary clutter, allowing the high-resolution imagery and sophisticated typography to act as the primary visual drivers.

## Colors

The palette is anchored by **Marble White**, serving as the primary background to maintain a bright, high-key aesthetic. **Forest Velvet** (a deep emerald-olive hybrid) is used for primary actions and structural highlights, echoing the cafe's physical upholstery. 

**Premium Gold** is reserved for high-impact accents, utilizing subtle linear gradients (from #D4AF37 to #C5A059) to simulate metallic reflections. **Vein Gray** is used sparingly for dividers and subtle borders, mimicking the natural patterns in white marble. The **Latte Peach** from the reference material serves as a warm functional accent for notifications or secondary highlights, softening the cooler green tones.

## Typography

This design system utilizes **Hanken Grotesk** across all roles to achieve a cohesive, sophisticated, and clean sans-serif look that feels contemporary and high-end. 

Headlines use tighter letter spacing and heavier weights to establish a confident hierarchy. Body text is prioritized for legibility with generous line heights. A signature "Label Caps" style is used for small metadata, navigation items, and overlines, featuring wide letter spacing to evoke a boutique, editorial feel. On mobile devices, display sizes scale down to maintain visual balance while preserving the bold typographic character.

## Layout & Spacing

The layout follows a **fluid grid** model with significant breathing room to reflect the physical cafe's airy atmosphere. We utilize a 12-column grid for desktop and a 4-column grid for mobile. 

Spacing is governed by an 8px rhythmic scale, but vertical section padding is intentionally oversized (80px+) to create a sense of luxury and focus. On mobile, margins are reduced to 20px to maximize real estate while maintaining a "safe" border that prevents the layout from feeling cramped. Content reflows vertically on smaller screens, with image assets maintaining a consistent aspect ratio to preserve the high-end photography's impact.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-contrast outlines**. 

Surfaces are predominantly flat to mimic smooth marble. Depth is suggested through very subtle, highly-diffused ambient shadows (e.g., `0px 4px 20px rgba(0, 0, 0, 0.03)`) used only on primary floating elements like cards or modals. Secondary containers use a 1px border in **Vein Gray** rather than shadows. 

For the "Gold" elements, a subtle inner glow is applied to simulate a metallic finish without breaking the minimalist aesthetic. Forest Green elements appear "heavy" and grounded, often acting as the base layer for white or gold text.

## Shapes

The design system adopts a **Soft** shape language. Elements use a 0.25rem (4px) base radius, providing just enough softness to feel approachable while maintaining the precision and architectural structure of high-end design. Larger components like cards or buttons may use up to 0.5rem (8px), but fully pill-shaped or overly rounded elements are avoided to keep the brand feeling "refined" rather than "playful."

## Components

### Buttons
Primary buttons are solid **Forest Velvet** with white typography in `label-caps`. Secondary buttons use a **Premium Gold** outline with a subtle gradient reflection on hover. All buttons feature a 4px corner radius.

### Input Fields
Fields utilize a minimalist "Underline" style or a very light gray container with a **Vein Gray** border. On focus, the border transitions to **Forest Velvet** with a 1px thickness.

### Cards
Cards are white with a 1px **Vein Gray** border. They rely on high-quality photography as the header. Text within cards is left-aligned with generous internal padding (24px) to maintain the airy aesthetic.

### Chips & Tags
Used for menu categories (e.g., "Vegan," "Seasonal"), these are small, `label-caps` elements with a light **Tertiary** background and **Forest Velvet** text.

### Dividers
Horizontal dividers are 1px thick, utilizing **Vein Gray**, often used to separate editorial sections or menu items, echoing the clean lines of a marble counter.