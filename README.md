<p align="center">
<img src="https://github.com/user-attachments/assets/9d509529-b2fd-4965-8601-07099b917cdf" width="120px" alt="micon">
</p>

# Micon

A high-performance, lightweight icon library built with **Web Components** and **Declarative Shadow DOM (DSD)**. 
Designed for modern web apps with zero dependencies.

## Features

- **Framework Agnostic**: Works with React, Vue, Svelte, or pure HTML.
- **Performance**: Best-in-class performance using `:host` styling.
- **SSR Ready**: Supports Server-Side Rendering via DSD (no layout shift).
- **Tree-shaking**: Import only the icons you use.
- **Fully Customizable**: Control size, color, and stroke via CSS variables.

## Installation

```bash
npm install micon
```

## Usage

### 1. Global Setup (Optional)

Import the base CSS to enable global theming via :root variables.

```js
import 'micon/base.css'
```

### 2. Client-side (SPA)

Simply import the icon you need. It automatically registers the custom element.

```js
import 'micon/heart'
```

```html
<!-- Use it in your HTML -->
<micon-heart></micon-heart>

<!-- Custom styling -->
<micon-heart style="--micon-size: 40px; --micon-color: royalblue;"></micon-heart>
```

### 3. Server-side Rendering (SSR)

Use the render function to generate SEO-friendly HTML with DSD support.

```js
import { render } from 'micon/settings';

const html = render({ size: 32, color: 'red', stroke: 1 });
// Output: <micon-settings style="..."><template shadowrootmode="open">...</template></micon-settings>
```
## Customization

You can override default styles globally in your CSS:

```css
:root {
  --micon-size: 24px;
  --micon-color: currentColor;
  --micon-stroke: 2px;
}
```
