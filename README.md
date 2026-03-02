# reidsurmeier.wtf

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (Turbopack, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Font | Test Pitch Sans |
| Lines | LeaderLine (SVG connector lines) |
| Deployment | GitHub Pages via GitHub Actions |

## Architecture

```
app/
  page.tsx              Main homepage (desktop + mobile)
  layout.tsx            Root layout with metadata
  data.ts               Tile data (img/txt collections)
  globals.css           Global styles, animations, font-faces
  sitemap.ts            Dynamic sitemap generation
  robots.ts             Robots.txt generation
  manifest.ts           Web app manifest
  not-found.tsx         Custom 404 page
  components/
    BookCovers.tsx      DVD-bounce animated book covers
    CustomCursor.tsx    Custom cursor (desktop only)
    DetailView.tsx      PDF viewer / detail page
    OverviewTile.tsx    Thumbnail tile component
    GalleryPage.tsx     Gallery/grid view
    ContactForm.tsx     Contact form
  img/[id]/page.tsx     Dynamic image detail routes
  txt/[id]/page.tsx     Dynamic text detail routes

lib/                    Vendored libraries (Three.js, LeaderLine, etc.)
public/
  fonts/                Test Pitch Sans font files
  img/                  Images and thumbnails
  pdf/                  PDF documents
```

MIT License — Reid Surmeier

```
      RSRSRSRSba   RSRSRSRSRS8  RS  RSRSRSRSba,
      RS      "8b  RS           RS  RS      `"8b
      RS      ,8P  RS           RS  RS        `8b
      RSaaaaaa8P'  RSaaaaa      RS  RS         RS
      RS""""RS'    RS"""""      RS  RS         RS
      RS    `8b    RS           RS  RS         8P
      RS     `8b   RS           RS  RS      .a8P
      RS      `8b  RSRSRSRSRS8  RS  RSRSRSRSY"'


       adRSRS8ba   RS        RS  RSRSRSRSba   RSb           dRS  RSRSRSRSRS8  RS  RSRSRSRSRS8  RSRSRSRSba
      d8"     "8b  RS        RS  RS      "8b  RS8b         dRS8  RS           RS  RS           RS      "8b
      Y8,          RS        RS  RS      ,8P  RS`8b       d8'RS  RS           RS  RS           RS      ,8P
      `Y8aaaaa,    RS        RS  RSaaaaaa8P'  RS `8b     d8' RS  RSaaaaa      RS  RSaaaaa      RSaaaaaa8P'
        `"""""8b,  RS        RS  RS""""RS'    RS  `8b   d8'  RS  RS"""""      RS  RS"""""      RS""""RS'
              `8b  RS        RS  RS    `8b    RS   `8b d8'   RS  RS           RS  RS           RS    `8b
      Y8a     a8P  Y8a.    .a8P  RS     `8b   RS    `RS8'    RS  RS           RS  RS           RS     `8b
       "YRSRS8P"    `"YRSRSY"'   RS      `8b  RS     `8'     RS  RSRSRSRSRS8  RS  RSRSRSRSRS8  RS      `8b


       I8,        8        ,8I  RSRSRSRSRSRS  RSRSRSRSRS8
       `8b       d8b       d8'       RS       RS
        "8,     ,8"8,     ,8"        RS       RS
         Y8     8P Y8     8P         RS       RSaaaaa
         `8b   d8' `8b   d8'         RS       RS"""""
          `8a a8'   `8a a8'          RS       RS
      RS8  `8a8'     `8a8'           RS       RS
      RS8   `8'       `8'            RS       RS
```
