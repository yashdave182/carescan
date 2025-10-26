# CareScan Web

CareScan Web is a lightweight React (Vite) implementation of the CareScan app for the browser. It mirrors the main app’s screens and uses the same assets and API endpoints for predictions and risk assessments.

- Tech stack: React 19 + Vite 5
- Assets: copied to `public/assets`
- Routing: client-side via React Router
- Build: static site (can be hosted on any static host)

## Prerequisites

- Node.js 18+ (recommended LTS)
- npm (bundled with Node.js) or Yarn

Check versions:
~~~
node -v
npm -v
~~~

## Getting started

1) Navigate to the web folder:
~~~
cd CareScan/web
~~~

2) Install dependencies:
- With npm:
~~~
npm install
~~~
- Or with Yarn:
~~~
yarn
~~~

3) Start the development server:
- With npm:
~~~
npm run dev
~~~
- Or with Yarn:
~~~
yarn dev
~~~

This launches Vite on http://localhost:5173 (it may open automatically).

## Build for production

- Create an optimized build:
~~~
npm run build
~~~

- Preview the production build locally (useful to verify before deploying):
~~~
npm run preview
~~~

The build output is generated in `web/dist`.

## Project structure (web)

- `web/`
  - `index.html` — HTML entry point
  - `vite.config.js` — Vite configuration
  - `package.json` — scripts and dependencies
  - `public/`
    - `assets/` — images (copied from the app’s assets)
  - `src/`
    - `main.jsx` — App entry, routes, and page implementations

## Routes and features

The web app provides the same top-level screens as the app:

- `/` — Home
- `/scanner` — Condition list
  - `/scanner/skin` — Skin disease image upload and predict
  - `/scanner/pneumonia` — Pneumonia X-ray upload and predict
  - `/scanner/lung-cancer` — Lung cancer image upload and predict
  - `/scanner/diabetes` — Diabetes risk form
  - `/scanner/hypertension` — Hypertension risk form
  - `/scanner/ckd` — CKD risk form
- `/health` — Health overview (static mock)
- `/profile` — Profile (static mock)

## APIs used

The web version calls the same public endpoints as the app:

- Skin disease (image):
  - `https://walgar-skin-2.hf.space/predict`
- Pneumonia (image):
  - `https://walgar-pneumonia.hf.space/predict`
- Lung cancer (image):
  - `https://walgar-lung.hf.space/predict`
- Diabetes (form-data):
  - `https://walgar-diabetes.hf.space/predict`
- Hypertension (JSON body):
  - `https://walgar-hyper.hf.space/predict`
- CKD (JSON body):
  - `https://walgar-ckd.hf.space/predict`

Notes:
- No API keys are required.
- If an endpoint is down or responds with unexpected data, you’ll see an error on the page.
- Responses are normalized for display, but exact shapes may vary between services.

## Common issues and troubleshooting

- Port already in use (5173):
  - Stop the process using the port or run with a different port:
    ~~~
    npm run dev -- --port=5174
    ~~~
- CORS errors:
  - The target API must allow browser requests. If CORS is blocked by the remote server, you will see errors in the browser console. Try again later or through a proxy if needed.
- Mixed content / HTTPS:
  - When hosting over HTTPS, ensure all APIs are also HTTPS (these endpoints already are).
- Image upload fails:
  - Make sure you select an image file (JPG/PNG). Very large images may take longer to upload.
- Build not routing correctly on your host:
  - Configure your host for SPA fallback so all routes serve `index.html` (e.g., Netlify `_redirects`, Vercel rewrites).

## Customization

- App title:
  - Update the document title in `src/main.jsx` (`document.title = "CareScan Web"`).
- Assets:
  - Replace or add images in `public/assets`. Update references in `src/main.jsx`.
- Colors and styles:
  - The UI is inline-styled for simplicity. Adjust styles directly in components in `src/main.jsx`.

## Deployment

Since this is a static build, you can deploy `web/dist` to:
- Netlify
- Vercel
- GitHub Pages
- Any static server (Nginx, Apache, S3 + CloudFront, etc.)

Ensure SPA routing fallback to `index.html` is configured on your platform.

## Scripts reference

- `npm run dev` — start Vite dev server
- `npm run build` — build for production (output to `dist`)
- `npm run preview` — preview production build locally

## License and usage

This web UI is intended as a companion front-end for demo and educational purposes. The predictions are not medical advice. Always consult a qualified healthcare professional for diagnosis or treatment.