/**
 * Micon SSR Demo
 * This script demonstrates how to generate SEO-friendly HTML on the server.
 */
import { render as renderHeart } from '../../dist/heart.js'
import { render as renderSettings } from '../../dist/settings.js'

function generatePage() {
	// Generate icon strings with specific props
	const heartIcon = renderHeart({ size: 48, color: '#27ae60' })
	const settingsIcon = renderSettings({ stroke: 1 })

	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Micon | SSR Demo</title>
  <link rel="stylesheet" href="../../dist/base.css">
  <style>
    body { font-family: system-ui; padding: 2rem; text-align: center; }
    .container { display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>Micon Server-Side Rendering</h1>
  <p>These icons are rendered with Declarative Shadow DOM (DSD).</p>
  
  <div class="container">
    <div>
      <p>Heart (48px, Green)</p>
      ${heartIcon}
    </div>
    <div>
      <p>Settings (Default size, 1px stroke)</p>
      ${settingsIcon}
    </div>
  </div>

  <!-- Hydration: Load JS to make components interactive on the client -->
  <script type="module" src="../../dist/index.js"></script>
</body>
</html>
  `.trim();
}

console.log("--- Generated SSR HTML ---");
console.log(generatePage());
console.log("\n✅ Done! You can pipe this output to an .html file to test it.");
