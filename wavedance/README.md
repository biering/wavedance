# wavedance

High-performance animated dot-grid canvas library.

**Live demo:** [biering.github.io/wavedance](https://biering.github.io/wavedance/)

## Install

```bash
npm install wavedance
```

## Usage

```ts
import { createWavedance } from "wavedance";

const container = document.getElementById("background")!;
const wavedance = createWavedance(container, {
  dotSize: 1,
  gap: 10,
  foreground: "#7c7c7c",
  background: "#161616",
  animation: "wave",
  wave: {
    scale: 0.01,
    speed: 0.001,
  },
});

// Update at runtime
wavedance.update({ animation: "random", foreground: "#cccccc" });

// Cleanup
wavedance.destroy();
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dotSize` | `number` | `1` | Dot diameter in CSS pixels |
| `gap` | `number \| { x, y }` | `10` | Gap between dots |
| `foreground` | `string` | `#7c7c7c` | Dot color (hex) |
| `secondaryForegroundColor` | `string` | `""` | Second tint: wave territories, plasma blobs, ribbon bands, or a second arc |
| `foregroundOpacity` | `number` | `1` | Dot opacity multiplier (0–1) |
| `background` | `string` | `#161616` | Canvas background (hex) |
| `backgroundOpacity` | `number` | `1` | Background opacity (0–1) |
| `animation` | `"random" \| "wave" \| "plasma" \| "arc" \| "ribbon"` | `"wave"` | Animation mode |
| `wave.scale` | `number` | `0.01` | Wave spatial frequency |
| `wave.speed` | `number` | `0.001` | Wave animation speed |
| `plasma.scale` | `number` | `0.004` | Plasma noise scale |
| `plasma.speed` | `number` | `0.0003` | Plasma animation speed |
| `plasma.threshold` | `number` | `0.15` | Plasma lower threshold |
| `arc.speed` | `number` | `1` | Arc breathing speed |
| `arc.center` | `number` | `0.4` | Arc vertical position (0–1) |
| `arc.drop` | `number` | `0.9` | How far the arc drops at the edges |
| `arc.thickness` | `number` | `0.35` | Band thickness as a fraction of height |
| `arc.curve` | `number` | `1.8` | Arc curvature exponent |
| `ribbon.speed` | `number` | `1` | Ribbon phase speed |
| `ribbon.amplitude` | `number` | `0.2` | Vertical amplitude of the sine paths |
| `ribbon.thickness` | `number` | `1` | Ribbon thickness multiplier |
| `ribbon.spread` | `number` | `1` | Vertical spacing of the three bands |
| `ribbon.fade` | `number` | `0.25` | Left-to-right composition fade |
| `devicePixelRatio` | `number` | `window.devicePixelRatio` | DPR override |
| `maxDots` | `number` | `100000` | Safety cap on dot count |
| `respectReducedMotion` | `boolean` | `true` | Honor prefers-reduced-motion |

## Runtime behavior

The animation loop pauses when the canvas is off-screen, the tab is hidden, or the user prefers reduced motion. In those cases it draws one static frame and stops scheduling `requestAnimationFrame` until visibility changes.

## License

MIT
