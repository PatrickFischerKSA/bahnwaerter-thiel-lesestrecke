# Browser checks for the sketch review

Build and serve the exported site under its configured base path. Install Playwright in a separate test environment; the production site needs no Playwright dependency.

Run the three `.cjs` files with `PLAYWRIGHT_MODULE` pointing to that environment's Playwright package and, optionally, `TEST_BASE_URL` pointing to the served site (default: http://127.0.0.1:8768/bahnwaerter-thiel-lesestrecke/).

The UI and error tests deliberately substitute a worker to test manual confirmation, stale crop results, saved state, responsive layout, cancellation, errors and timeouts deterministically. The no-WebGPU test removes the browser feature and checks that the manual checklist still works. These tests do **not** measure model recognition accuracy or real download/inference performance.

For a real model check, load the page without overrides, upload a simple drawing, start the model, and test both a present and an absent element. Never count an unconfirmed model response as a student finding.
