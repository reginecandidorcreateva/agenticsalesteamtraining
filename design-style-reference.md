# Chosen App Look — "Whimsical" style reference

> Saved from the creator's pasted style guide. Use this as the design-token source when building the app's visual style (Milestone 1 and onward), achieved via hand-rolled CSS custom properties / inline styles per conventions — NOT via Tailwind or any UI library, even though the source reference includes a Tailwind block. Ignore the Tailwind section; use the CSS Custom Properties block instead.

## Summary
- Theme: light. Near-black deep plum (#250835) ink on a soft lavender/cream canvas (#ffffff / #f5f4f5), with hairline lavender borders (#ebe6ee).
- Display headlines: Agrandir (bold, 700 weight, 48–96px, tight negative tracking). Substitute if unavailable: Recoleta, Gilroy Bold, or Manrope 800.
- Body/UI text: Manrope (400–700 weight, 12–16px).
- Accents: Vivid Violet (#ab2fed) for links/share actions, Vivid Blue (#0283ec) and Electric Indigo (#4b38ee) for icons/diagram elements — used sparingly, never as large fills.
- Two signature full-bleed gradients: Plum-to-Pink (142deg, #ba59ff → #ff59f1) for hero sections, and Aurora (97deg, #3ca1ff → #c852ff → #ff60f0) for logo/divider bands. Gradients are full-bleed only — never small accents or button fills.
- Radius scale: 8px images, 12px buttons/nav/links, 16px cards, 9999px pills/badges.
- Shadows are plum-tinted: rgba(37,8,53, 0.06–0.2), never neutral gray.
- Primary buttons: Deep Plum fill, white text, 12px radius.
- Cards: white/soft-white surface, soft plum shadow, generous internal padding (40px), sit on a lavender-mist-bordered canvas.

## CSS Custom Properties (use these, adapt as needed — no Tailwind)
```css
:root {
  --color-deep-plum: #250835;
  --color-dark-mauve: #473054;
  --color-vivid-violet: #ab2fed;
  --color-vivid-blue: #0283ec;
  --color-electric-indigo: #4b38ee;
  --color-warm-gray-purple: #6a5b72;
  --color-lavender-mist: #ebe6ee;
  --color-soft-white: #f5f4f5;
  --color-plum-shadow: #cdc7d1;
  --color-lavender-wash: #decaff;
  --color-blush-bloom: #e9bded;
  --color-sky-mist: #bbcfe4;
  --gradient-plum-to-pink: linear-gradient(142deg, #ba59ff 0%, #ba59ff 30%, #ff59f1 100%);
  --gradient-aurora: linear-gradient(97deg, #3ca1ff 5.54%, #c852ff 49.85%, #ff60f0 94.14%);
  --font-agrandir: 'Agrandir', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-manrope: 'Manrope', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-buttons: 12px;
  --radius-cards: 16px;
  --radius-images: 8px;
  --radius-badges: 9999px;
  --shadow-xl: rgba(37, 8, 53, 0.06) 0px 16px 32px -4px;
  --shadow-md: rgba(37, 8, 53, 0.2) 0px 12px 16px -4px;
}
```

## Note for the orbit dashboard (09-dashboard-design.md)
The dashboard keeps its exact layout/animations/behavior verbatim. Only its skin changes to match this palette/type instead of the warm-dark default: swap the deep-purple radial gradient background to work with Deep Plum/lavender tones, use Agrandir for the center number, Manrope for labels, and keep Vivid Violet/Vivid Blue/Electric Indigo as the accent set already baked into this style (a natural fit since the dashboard's default accents are already violet/blue/pink).
