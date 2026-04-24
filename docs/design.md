# AccentSketch Design System - COA

## Philosophy
The **AccentSketch** design language is centered around high-fidelity, interactive, and premium student experiences. It combines a clean "pill" aesthetic with vibrant micro-interaction highlights.

## Visual Language
- **Accent Palette**: Deep Azure (#137fec), Amber Warning (#F59E0B), and Success Teal (#10B981).
- **Surface**: Muted light surfaces with soft shadow elevation. Dark mode uses deep graphite backgrounds with subtle border accents.
- **Corner Style**: Uniform pill-shaped roundness (8px - 16px) across all buttons, inputs, and cards.
- **Typography**: Inter for standard UI, Lexend for headers to provide a friendly yet professional "Intelligence Platform" feel.
- **Glassmorphism**: Subtle backdrop blurs for modals, drawers, and persistent navigation bars.

## Navigation Architecture
- **Student**: Persistent Bottom Navigation (Mobile) and Top Nav (Desktop).
- **Admin**: Fixed Left Sidebar (240px wide) with collapsable hamburger menu for mobile.
- **Interactions**: Smooth 150ms-300ms transitions. Outgoing pages fade out while new content fades in.

## Component Specifications
- **Pill Buttons**: Rounded containers with scale-down interactions on click.
- **Listing Cards**: Card-based layouts with shadow elevation gain on hover.
- **Toasts**: Fixed bottom-right (desktop) or bottom-center (mobile) with slide-and-fade entry.
- **Skeletons**: Geometric shimmer loaders that mirror the real component structure.
- **Domain Chips**: Compact fill/outline chips used for categorizing opportunities.
