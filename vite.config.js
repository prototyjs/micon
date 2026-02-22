import { defineConfig } from 'vite'
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from 'svgo'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PATHS = {
	svgSource: resolve(__dirname, 'src/icons'),
	virtualDir: resolve(__dirname, 'node_modules/.vite-micon'),
}

if (!existsSync(PATHS.virtualDir)) {
	mkdirSync(PATHS.virtualDir, { recursive: true })
}

const toPascalCase = (str) =>
	str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')

let iconNames = []
try {
	iconNames = readdirSync(PATHS.svgSource)
		.filter(file => file.endsWith('.svg'))
		.map(file => basename(file, '.svg'))

	if (iconNames.length === 0) {
		console.warn('⚠️ No SVG files found in src/icons directory')
	}
} catch (error) {
	console.error(`❌ Error: Icons directory not found at ${PATHS.svgSource}`)
	process.exit(1)
}

iconNames.forEach(name => {
	try {
		const svgPath = resolve(PATHS.svgSource, `${name}.svg`)
		const svgRaw = readFileSync(svgPath, 'utf-8')

		const { data: optimizedSvg } = optimize(svgRaw, {
			path: svgPath,
			plugins: [
				'preset-default',
				'removeDimensions',
				'convertStyleToAttrs',
				{
					name: 'removeAttributesBySelector',
					params: {
						selector: 'svg *',
						attributes: ['stroke-width']
					}
				},
				{
					name: 'addAttributesToSVGElement',
					params: {
						attributes: [{ fill: 'none' }, { stroke: 'currentColor' }]
					}
				}
			]
		})

		if (svgRaw !== optimizedSvg) {
			writeFileSync(svgPath, optimizedSvg)
		}

		const tagName = `micon-${name.toLowerCase()}`
		const className = `Micon${toPascalCase(name)}`

		const content = `
      const svg = \`${optimizedSvg.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
      const styles = \`:host { display: inline-flex; width: var(--micon-size, 24px); height: var(--micon-size, 24px); color: var(--micon-color, currentColor); } svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: var(--micon-stroke, 6px); }\`

      export class ${className} extends HTMLElement {
        connectedCallback() {
          if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' }).innerHTML = \`<style>\${styles}</style>\${svg}\`
          }
        }
      }

      if (typeof window !== 'undefined' && !customElements.get('${tagName}')) {
        customElements.define('${tagName}', ${className})
      }

      export const render = (props = {}) => {
        const styleParts = [];
        if (props.size) styleParts.push(\`--micon-size: \${props.size}px\`);
        if (props.color) styleParts.push(\`--micon-color: \${props.color}\`);
        if (props.stroke) styleParts.push(\`--micon-stroke: \${props.stroke}px\`);
        const styleAttr = styleParts.length ? \`style="\${styleParts.join(';')}"\` : '';
        return \`<${tagName} \${styleAttr}><template shadowrootmode="open"><style>\${styles}</style>\${svg}</template></${tagName}>\`
      }

      export default ${className}
    `.trim()

		writeFileSync(resolve(PATHS.virtualDir, `${name}.js`), content)
	} catch (error) {
		console.error(`❌ Error processing icon ${name}:`, error.message)
	}
})

const cssContent = `:root { --micon-size: 24px; --micon-color: currentColor; --micon-stroke: 2px; }`.trim()
writeFileSync(resolve(PATHS.virtualDir, 'base.css'), cssContent)

const indexContent = `import './base.css';\n` +
	iconNames.map(name => `export * from './${name}.js';`).join('\n')
writeFileSync(resolve(PATHS.virtualDir, 'index.js'), indexContent)

const entryPoints = {
	index: resolve(PATHS.virtualDir, 'index.js'),
	...Object.fromEntries(
		iconNames.map(name => [name, resolve(PATHS.virtualDir, `${name}.js`)])
	)
}

export default defineConfig({
	build: {
		lib: {
			entry: entryPoints,
			formats: ['es']
		},
		rollupOptions: {
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'shared/[name].js',
				assetFileNames: (assetInfo) => {
					const name = assetInfo.names ? assetInfo.names[0] : assetInfo.name
					if (name?.endsWith('.css')) return 'base.css'
					return 'assets/[name]-[hash][extname]'
				}
			}
		},
		minify: 'terser',
		emptyOutDir: true,
		sourcemap: false
	}
})
