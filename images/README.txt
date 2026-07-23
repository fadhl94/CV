Add your image assets here, using these exact filenames so index.html picks
them up automatically (or edit the paths in index.html to match your own):

  profile.jpg                 Hero section profile photo (square, 500x500+ recommended)
  og-cover.jpg                Social share preview image (1200x630 recommended)

  video-1-poster.jpg          Poster/thumbnail frame for videos/project-1.mp4
  video-2-poster.jpg          Poster/thumbnail frame for videos/project-2.mp4
  video-3-poster.jpg          Poster/thumbnail frame for videos/project-3.mp4

  photo-portrait-1.jpg .. 3   Photography gallery — portrait category
  photo-product-1.jpg .. 3    Photography gallery — product category
  photo-landscape-1.jpg .. 3  Photography gallery — landscape category

  IT Projects (each project now supports MULTIPLE screenshots — a small
  carousel with arrows/dots shows on the card, and clicking it opens a full
  gallery in the lightbox you can page through):
    project-inventory-1.jpg, -2.jpg, -3.jpg   Inventory Management System
    project-network-1.jpg, -2.jpg             Office Network Overhaul
    project-portfolio-1.jpg, -2.jpg, -3.jpg   Client Portfolio Sites
    project-helpdesk-1.jpg, -2.jpg            Internal Helpdesk Tool

  Want more or fewer screenshots per project, or a 5th project? In
  index.html, edit the data-images="[...]" attribute on that project's
  <div class="project-shot"> — it's a plain JSON array of image paths, so
  you can add/remove entries freely. Just also update the first <img>'s
  data-src to match the first image in the array, and add matching files
  here. Works for websites, apps, dashboards — any project you want to
  showcase with more than one screenshot.

Tips:
- Compress images (e.g. with Squoosh or TinyPNG) before adding them — this
  keeps the site fast, especially on GitHub Pages.
- Recommended photo gallery image width: 900–1400px on the long edge.
- The favicon.svg is already included and used as the site icon.
