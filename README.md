# Ponywhite Custom Square Online Embeds Workspace

This workspace is set up to develop custom, highly-performant HTML components and pages for the Ponywhite website hosted on Square Online.

## Folder Directory Structure

* **`/src`**: Contains clean, readable, standard web source files (HTML, CSS, JS).
  * **`/src/pages`**: Main page layouts.
  * **`/src/styles`**: Beautiful, modular stylesheets.
  * **`/src/components`**: Reusable elements.
* **`/assets`**: Local image assets. These are committed to Git and hosted on a CDN for free.
* **`/square_embeds`**: Compiled single-line HTML codes ready to copy-paste directly into Square Online embeds.
* **`/tools`**: Compiling and minifying scripts.

---

## Workflow

1. Write clean, readable code in `src/`.
2. Save local preview images in `assets/`.
3. Push to GitHub to host images automatically on a lightning-fast CDN.
4. Run `npm run build` (or our compiler script) to generate the minified, inline-styled Square embeds in `/square_embeds`.
5. Copy-paste the compiled strings into your Square Website Builder!
