Local ebook parsing dependencies (loaded only when needed):

- `fflate/fflate.min.js`: fflate 0.8.2 UMD build, MIT. Source: https://github.com/101arrowz/fflate. License is retained in `fflate/LICENSE`.
- `pdfjs/pdf.mjs` and `pdfjs/pdf.worker.mjs`: PDF.js 4.10.38, `pdfjs-dist` legacy builds, Apache-2.0. Source: https://github.com/mozilla/pdf.js. License is retained in `pdfjs/LICENSE`.
- `pdfjs/cmaps/` and `pdfjs/standard_fonts/`: matching PDF.js package resources, including their supplied license files. These support local extraction of CJK and standard-font PDFs.

The distributions are unmodified. No CDN request is required to import a book. The reader extracts text into Iris paper pages; it does not execute imported ebook scripts or render imported HTML.
