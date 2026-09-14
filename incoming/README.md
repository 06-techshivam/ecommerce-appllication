# ZENVORA Product Import Pipeline

This directory manages batch product additions to the ZENVORA storefront.

## Workflow

1. Copy `incoming/listings-template.csv` to `incoming/listings.csv`:
   ```bash
   cp incoming/listings-template.csv incoming/listings.csv
   ```
2. Fill one row per product in `incoming/listings.csv`.
3. Drop corresponding photos into `incoming/images/`.
4. Run the import script:
   ```bash
   npm run import-listings
   ```
5. The script validates all entries, optimizes/copies imagery into `public/images/products/`, and regenerates `lib/generated-products.ts` automatically.
6. The newly imported items are immediately available across the storefront and listing pages.

---

## CSV Column Reference

All columns must be specified in the following exact order:

| Column | Type | Required | Description & Accepted Values |
| :--- | :--- | :--- | :--- |
| `name` | string | **Yes** | Product title (e.g. `"Pure Cashmere Overcoat"`). Used to generate unique slug ID. |
| `category` | string | **Yes** | Either `women` or `men` (case-insensitive). |
| `subcategory` | string | **Yes** | Product subcategory (e.g. `Coats & Jackets`, `Knitwear`, `Dresses`, `Trousers`, etc.). |
| `price` | number | **Yes** | Numerical retail price in USD (e.g. `240` or `240.00`). |
| `compareAtPrice` | number | No | Original/strikethrough retail price for sale items (e.g. `300`). Leave empty if not on sale. |
| `description` | string | No | Editorial product description. Wrap in quotes if it contains commas. |
| `sizes` | string | No | Pipe-separated size options (e.g. `XS\|S\|M\|L\|XL`). Defaults to `XS\|S\|M\|L\|XL` if blank. |
| `image1` | string | **Yes** | Primary image filename located in `incoming/images/` (e.g. `coat-front.jpg`). |
| `image2` | string | No | Secondary/hover image filename in `incoming/images/`. If blank, falls back to `image1`. |
| `featured` | string | No | `yes` or `no` (default: `no`). Displayed on homepage featured grid. |
| `isNew` | string | No | `yes` or `no` (default: `no`). Renders "NEW" badge and shows in New Arrivals. |
| `trending` | string | No | `yes` or `no` (default: `no`). Shows in Trending section and renders badge. |

---

## Image Optimization & Fallbacks

- On macOS, the script utilizes the native `sips` utility to resize and optimize photos to max 1400px JPEG.
- On Windows and Linux, photos are safely transferred and linked.
- If a referenced image file is missing from `incoming/images/`, the importer logs a warning and links a high-contrast neutral fallback placeholder SVG so the site never renders broken images.

