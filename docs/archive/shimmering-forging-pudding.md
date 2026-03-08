# Workforce Pulse — Design System + API Integration

## Overview
Apply Montgomery city portal design tokens (colors, typography, spacing) to Workforce Pulse, and add real ArcGIS open data endpoints to the service layer behind the existing `USE_STUBS` flag.

---

## Part 1: Design System Migration

### Files to modify
| File | Change |
|------|--------|
| `src/app/globals.css` | Full CSS variable replacement |
| `src/app/layout.tsx` | Replace Geist with DM Sans via `next/font/google` |
| `tailwind.config.ts` | Add `fontFamily.sans` extension |

---

### 1a. `src/app/globals.css` — Replace CSS variables

Montgomery portal design tokens:

| Token | Hex | HSL (for CSS vars) |
|-------|-----|--------------------|
| Primary navy (header/nav) | `#005e95` | `205 100% 29%` |
| Deep navy | `#05466c` | `204 93% 22%` |
| Gold / CTA buttons | `#b98646` | `36 44% 50%` |
| Link / hover blue | `#136fbf` | `210 80% 41%` |
| Body text | `#343434` | `0 0% 20%` |
| Page background | `#f7f7f7` | `0 0% 97%` |
| Divider / footer bg | `#e7e7e7` | `0 0% 91%` |

**New `:root` block (replace existing one entirely):**
```css
:root {
  --background: 0 0% 97%;           /* #f7f7f7 off-white page bg */
  --foreground: 0 0% 20%;           /* #343434 body text */
  --card: 0 0% 100%;                /* white cards on off-white bg */
  --card-foreground: 0 0% 20%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 20%;
  --primary: 205 100% 29%;          /* #005e95 primary navy */
  --primary-foreground: 0 0% 98%;
  --secondary: 36 44% 50%;          /* #b98646 gold */
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 91%;                /* #e7e7e7 subtle bg / dividers */
  --muted-foreground: 0 0% 45%;
  --accent: 210 80% 41%;            /* #136fbf link/hover blue */
  --accent-foreground: 0 0% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 87%;
  --input: 0 0% 87%;
  --ring: 205 100% 29%;             /* focus ring = primary navy */
  --chart-1: 205 100% 29%;          /* navy */
  --chart-2: 36 44% 50%;            /* gold */
  --chart-3: 210 80% 41%;           /* link blue */
  --chart-4: 204 93% 22%;           /* deep navy */
  --chart-5: 27 87% 67%;            /* warm orange */
  --radius: 0.625rem;               /* 10px — matches portal card radius */
}
```

Keep the `.dark` block unchanged (dark mode not in hackathon scope).

**Add card shadow utility** at end of file (inside `@layer utilities`):
```css
.card-shadow {
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
}
```

---

### 1b. `src/app/layout.tsx` — Swap font

Avenir Next is proprietary — closest Google Fonts match is **DM Sans** (geometric humanist, clean, matches Avenir Next's civic/professional character). Replace Geist entirely.

```tsx
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})
```

In `<body>`:
```tsx
<body className={`${dmSans.variable} font-sans antialiased`}>
```

Remove both `localFont` imports and all `geistSans`/`geistMono` variables.

---

### 1c. `tailwind.config.ts` — Font family

Add `fontFamily` inside `theme.extend` so `font-sans` resolves to DM Sans:

```ts
fontFamily: {
  sans: ["var(--font-sans)", "system-ui", "sans-serif"],
},
```

No changes needed to the `borderRadius` keys — `--radius: 0.625rem` (10px) already gives:
- `rounded-lg` = 10px (cards)
- `rounded-md` = 8px (inputs/selects)
- `rounded-sm` = 6px (badges)

---

## Part 2: API Integration

### Strategy
The service layer already has a `USE_STUBS` flag. Real fetch functions are added alongside stubs — no behavior change while `NEXT_PUBLIC_USE_STUBS=true`. To activate real data: set `NEXT_PUBLIC_USE_STUBS=false`.

### ArcGIS FeatureServer query format
```
{endpointUrl}/query?where=1%3D1&outFields=*&resultRecordCount={n}&f=json
```
Response: `{ features: Array<{ attributes: Record<string, unknown> }> }`

---

### Files to modify: `src/services/api/`

#### `sectors.ts` — Public Safety: 911 Calls data

**Endpoint:** `https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/911_Calls_Data/FeatureServer/0`

Maps to Public Safety sector. Call volume = demand pressure proxy.

```ts
// Inside fetchSectors(), replace the stub return with:
const url = `${process.env.NEXT_PUBLIC_ARCGIS_911_URL}/query?where=1%3D1&outFields=*&resultRecordCount=500&f=json`
const res = await fetch(url, { next: { revalidate: 3600 } })
const json = await res.json()
const callCount = json.features?.length ?? 0
// Merge real count into Public Safety sector stub shape
```

#### `sectors.ts` — Construction: Permits data

**Endpoint:** `https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Construction_Permits/FeatureServer/0`

Permit count signals Construction sector workforce demand.

#### `roles.ts` — Fire/Police station locations

**Endpoint:** `https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer`

Maps station records to Police Officer / Firefighter / EMS roles.

#### `skills.ts` — No change

Real skill extraction requires backend NLP pipeline (not built yet). Keep stubs.

---

### `.env.local` additions

```
# Existing
NEXT_PUBLIC_USE_STUBS=true
NEXT_PUBLIC_API_URL=

# ArcGIS open data endpoints
NEXT_PUBLIC_ARCGIS_911_URL=https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/911_Calls_Data/FeatureServer/0
NEXT_PUBLIC_ARCGIS_STATIONS_URL=https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Story_Map___Live__1__WFL1/FeatureServer
NEXT_PUBLIC_ARCGIS_PERMITS_URL=https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Construction_Permits/FeatureServer/0
NEXT_PUBLIC_ARCGIS_EDUCATION_URL=https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/Education_Facility/FeatureServer/0
```

---

## Execution Order

1. `src/app/globals.css` — replace `:root` variables + add `.card-shadow`
2. `src/app/layout.tsx` — swap Geist → DM Sans
3. `tailwind.config.ts` — add `fontFamily.sans`
4. `.env.local` — add ArcGIS URL vars (no functional change; stubs stay `true`)
5. `src/services/api/sectors.ts` — add real fetch helpers behind `USE_STUBS` guard
6. `src/services/api/roles.ts` — add station data fetch behind `USE_STUBS` guard
7. `npm run build` — verify 0 type errors

---

## Verification

1. `npm run dev` → visit `http://localhost:3000`
2. **Font**: DevTools computed styles on any `<p>` → `font-family` shows `DM Sans`
3. **Navy nav**: Sidebar active links use `bg-primary` → should render `#005e95` navy
4. **Background**: `<body>` bg-color = `#f7f7f7` off-white
5. **Cards**: White on off-white creates natural depth without shadows by default; add `card-shadow` class to any card to get the portal-matching shadow
6. **All 7 pages**: Still render correctly with stub data — no regressions
7. `npm run build` → 0 errors, 0 type warnings
