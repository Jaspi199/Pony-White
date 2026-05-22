---
name: Warm Veridian
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414944'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#717974'
  outline-variant: '#c0c8c3'
  surface-tint: '#396756'
  primary: '#00261b'
  on-primary: '#ffffff'
  primary-container: '#0b3d2e'
  on-primary-container: '#79a894'
  inverse-primary: '#a0d1bc'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#21211d'
  on-tertiary: '#ffffff'
  tertiary-container: '#363632'
  on-tertiary-container: '#a09f99'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcedd7'
  primary-fixed-dim: '#a0d1bc'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#214f3f'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e5e2dc'
  tertiary-fixed-dim: '#c9c6c1'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#474743'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
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
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1200px
---

## Brand & Style
The design system moves away from clinical precision toward a welcoming, human-centric experience. The brand personality is rooted in "approachable luxury"—retaining the prestige of deep greens and golds while softening the edges through tactile elements and organic movement. 

The aesthetic style is a hybrid of **Minimalism** and **Tactile** design. It prioritizes heavy whitespace and clear hierarchy, but injects warmth through subtle gradients and extremely soft geometry. The emotional response should be one of "effortless hospitality": professional and reliable, yet inherently friendly and inclusive.

## Colors
The palette is anchored by a "Forest Veridian" (Primary), providing a sense of grounded stability. This is balanced by a "Soft Gold" (Secondary) used for high-intent actions and accentuation. 

To ensure the vibe feels warmer and less clinical, the background is a "Warm Alabaster" (Tertiary) rather than a stark, cold white. Neutrals are tinted with warm undertones to prevent a sterile gray-scale appearance. Color application should favor large washes of the tertiary background with primary and secondary colors used for focal points.

## Typography
This design system utilizes **Hanken Grotesk** across all levels to maintain a contemporary and clean look. To achieve a friendlier tone, weight usage is intentionally capped—avoiding heavy "Black" or "Extra Bold" weights in favor of "Medium" and "SemiBold." 

Headlines feature slightly tighter letter spacing for a more editorial, sophisticated feel, while body text maintains generous line heights to maximize readability and create an "airy" reading experience.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop (12 columns) and a fluid model on mobile (4 columns). The rhythm is based on an 8px square grid, ensuring consistent vertical cadence.

To enhance the friendly vibe, spacing is intentionally "loose." Padding within containers should be generous to avoid a cramped, information-dense appearance. Sections should be separated by large vertical gaps to allow the eye to rest.

## Elevation & Depth
Depth is created through **Ambient Shadows** and **Tonal Layers** rather than sharp borders. Surfaces use very soft, diffused shadows with a slight warm-tinted blur (e.g., a shadow with a hint of the primary green) to feel integrated into the environment.

Instead of traditional elevation, use "Soft Wells"—inner shadows or subtle color shifts—to indicate interactive areas like input fields. This creates a tactile, "squishy" feel that is more inviting than flat, clinical planes.

## Shapes
The shape language is defined by extreme softness. All interactive elements use **Pill-shaped** (Full Round) or significant radii to eliminate "sharpness." This visual metaphor communicates safety and approachability. Large containers (like cards) use the `rounded-xl` scale to feel like smooth, tumbled stones.

## Components
- **Buttons**: Primary buttons are pill-shaped with a solid Veridian fill and white text. Secondary buttons use a thick Gold border with a subtle cream background on hover.
- **Input Fields**: Borders are replaced by soft, warm-gray background fills with high corner radii (16px+). On focus, the background shifts to a very light gold tint.
- **Cards**: Cards feature significant padding (32px) and `rounded-xl` corners. They use a low-opacity ambient shadow to "float" off the warm background.
- **Chips & Tags**: Always fully rounded (pill) with semi-transparent fills of the primary or secondary colors to maintain lightness.
- **Lists**: List items are separated by generous white space and soft dividers rather than harsh lines. Use icons with rounded terminals to match the typography and shape language.
- **Feedback Elements**: Success and Error states should use softened versions of green/red (e.g., sage and coral) to remain informative without feeling alarming or clinical.