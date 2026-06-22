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
| `foregroundOpacity` | `number` | `1` | Dot opacity multiplier (0–1) |
| `background` | `string` | `#161616` | Canvas background (hex) |
| `backgroundOpacity` | `number` | `1` | Background opacity (0–1) |
| `animation` | `"random" \| "wave" \| "plasma"` | `"wave"` | Animation mode |
| `wave.scale` | `number` | `0.01` | Wave spatial frequency |
| `wave.speed` | `number` | `0.001` | Wave animation speed |
| `plasma.scale` | `number` | `0.004` | Plasma noise scale |
| `plasma.speed` | `number` | `0.0003` | Plasma animation speed |
| `plasma.threshold` | `number` | `0.15` | Plasma lower threshold |
| `plasma.softness` | `number` | `0.5` | Plasma fade width |
| `devicePixelRatio` | `number` | `window.devicePixelRatio` | DPR override |
| `maxDots` | `number` | `100000` | Safety cap on dot count |
| `respectReducedMotion` | `boolean` | `true` | Honor prefers-reduced-motion |

## License

MIT
