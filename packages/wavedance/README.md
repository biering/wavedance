# wavedance

High-performance animated dot-grid canvas library.

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
    scale: 0.004,
    speed: 0.0003,
    threshold: 0.15,
    softness: 0.5,
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
| `background` | `string` | `#161616` | Canvas background (hex) |
| `animation` | `"none" \| "random" \| "wave"` | `"wave"` | Animation mode |
| `devicePixelRatio` | `number` | `window.devicePixelRatio` | DPR override |
| `maxDots` | `number` | `100000` | Safety cap on dot count |
| `respectReducedMotion` | `boolean` | `true` | Honor prefers-reduced-motion |

## License

MIT
