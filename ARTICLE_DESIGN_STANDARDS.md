# Article Design Standards

A professional design step for Decryptica articles. This document ensures all published content meets our visual standards.

## Content Formatting Rules

### 1. Code Blocks
- Use triple backticks with language identifier: \`\`\`javascript
- Wrap in a styled container with syntax highlighting appearance
- Background: `bg-zinc-900`
- Border: `border border-zinc-700`
- Rounded corners: `rounded-xl`
- Padding: `p-4`
- Font: `font-mono text-sm`
- Add copy button for UX

### 2. Inline Code
- Use single backticks: \`code\`
- Style: `bg-zinc-800 px-2 py-1 rounded-lg text-pink-400 font-mono text-sm`
- NOT: `bg-zinc-100 text-black` (never light mode code)

### 3. Lists
- **Unordered:** Use • or - or *
  - Prefix with "• " in plain text
  - Render with proper spacing
  - Add left border accent for key points
- **Ordered:** Use 1., 2., 3.
  - Numbered steps for tutorials
  - Include checkmarks for completed steps

### 4. Tables
- Use markdown table syntax:
  ```
  | Header | Header |
  |--------|--------|
  | Cell   | Cell   |
  ```
- Style: `w-full text-sm`
- Header: `bg-zinc-800 text-white font-semibold`
- Rows: `border-b border-zinc-700`
- Alternating: Slight zebra striping
- Horizontal scroll on mobile

### 5. Blockquotes
- Use `>` for quotes
- Style: `border-l-4 border-indigo-500 pl-4 italic text-zinc-400`
- Add left accent bar in brand color

### 6. Images
- Always add descriptive alt text
- Wrap in figure with caption
- Add loading="lazy"
- Max width: 100%
- Rounded corners

### 7. Horizontal Rules
- Use `---` for section breaks
- Style: `border-t border-zinc-800 my-8`

### 8. Headings
- H2: `font-display text-2xl font-bold text-white mt-12 mb-4`
- H3: `font-display text-xl font-semibold text-white mt-8 mb-3`
- Add anchor links for H2 (optional enhancement)

## Typography Standards

### Font Hierarchy
- **Display/Headlines:** Space Grotesk (via CSS variable --font-display)
- **Body:** Inter (via CSS variable --font-sans)
- **Code:** JetBrains Mono or similar monospace

### Size Scale
- H1: 3rem (48px) - Article titles
- H2: 1.75rem (28px) - Section headers  
- H3: 1.25rem (20px) - Subsection
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Caption: 0.75rem (12px)

### Color Palette
- **Primary text:** `text-zinc-300`
- **Headlines:** `text-white`
- **Muted:** `text-zinc-500`
- **Accent:** `text-indigo-400`
- **Links:** `text-indigo-400 hover:text-indigo-300`
- **Code text:** `text-pink-400` (for inline)

### Spacing System
- Paragraphs: `mb-4` (16px margin bottom)
- Sections: `mt-8` (32px margin top)
- Cards: `p-6` (24px padding)
- Grid gap: `gap-6` (24px)

## Content Structure Template

### Opening Section
```
[TL;DR Box - 3 bullet points]
[Introduction - 2-3 paragraphs]
[Why this matters - 1 paragraph]
```

### Body Sections
```
## Section Title

Content with proper paragraphs...

### Subsection (if needed)

More content...

[Code example if applicable]

[Key takeaways in bullet list]
```

### Closing Section
```
## TL;DR

- Key point 1
- Key point 2
- Key point 3

[Related articles section]
[Subscribe CTA]
```

## TL;DR Box Design
- Position: Top of article, below header
- Background: `bg-indigo-500/10 border border-indigo-500/30`
- Padding: `p-5 rounded-xl`
- Title: `font-display font-semibold text-white mb-3`
- Items: `text-zinc-300 text-sm`
- Icon: Lightbulb or bullet points

## Pro Tips

1. **Scanability:** Use short paragraphs (3-4 sentences max)
2. **Visual breaks:** Code blocks and tables break up text walls
3. **Callouts:** Use blockquotes for important warnings/tips
4. **Scannable lists:** Use bold for key terms in lists
5. **Mobile-first:** Tables must scroll horizontally on mobile

## Automated Checks

Before publishing, verify:
- [ ] No raw Markdown symbols visible (\`\`\`, \*, \_)
- [ ] Code blocks have language labels
- [ ] All images have alt text
- [ ] Links open in new tab for external URLs
- [ ] Phone numbers, emails formatted correctly
- [ ] No orphan words at line ends
- [ ] Consistent heading levels (no skipped H2 → H4)

## Common Errors to Fix

| Error | Fix |
|-------|-----|
| `**bold**` renders as literal | Replace with `<strong>` or proper bold |
| `\`code\`` looks wrong | Wrap in styled span |
| Tables broken | Ensure pipe alignment correct |
| Wall of text | Break into sections with headers |
| No spacing | Add `my-4` or `my-8` between elements |
