# T-Shirt Planner

## Overview

T-Shirt Planner is a browser-based page built with HTML, CSS, and JavaScript. It generates a transparent PNG image filled with rows of repeating labels, which can be used as a T-shirt design plan.

## Labels

On first load, the planner uses the built-in labels `T-SHIRT`, `DESIGN`, `TEAM`, `SUMMER`, and `PRINT`. To use custom labels, upload a plain-text `.txt` file with one label per line. Leading and trailing whitespace is removed, and blank lines are ignored. If the file contains no non-empty labels, the built-in labels are used.
Labels can start with * character, which marks the importnat labels. The starting * has to be removed before rendering.

## Rendering and download

Labels are laid out in sequence across rows and repeat from the beginning when the end of the list is reached. Rows fill the canvas from near its top to near its bottom. Each row begins at a random horizontal position no farther left than the width of the widest label; labels continue past the right edge of the canvas.
Important labels are rendered twice, with one pixel shift to the right too.
Before rendering the labels array, a new array should be created with the same labels in it in a mixed random order. The rendering should go via the miced array of labels.

Each label is assigned a random palette color, avoiding the color used for the preceding label when the palette has multiple colors. The output has a transparent background and gradual transparency around all four edges. Labels that extend beyond the left or right canvas boundary are also faded according to their position and the edge-fade setting.

A large music-note shape is cut out of the center of the design, leaving that shape transparent. The preview is displayed inside a frame over a checkerboard background. Select **Render** to generate a new randomized layout. Select **Download PNG** to save the canvas as `tshirt-plan.png`.

## Settings

The controls update the preview as they change:

| Setting | Default | Available values |
| --- | --- | --- |
| Font size | 44 px | 12–120 px |
| Gap between labels | 24 px | 0–80 px |
| Gap between rows | 18 px | 0–80 px |
| Font type | Arial | Arial, Verdana, Georgia, Courier New, or Tahoma |
| Output width | 1200 px | 100–4000 px |
| Output height | 1600 px | 100–4000 px |
| Transparent edge size | 120 px | 0–300 px |

## Color palette

The initial palette contains 16 shades interpolated from dark blue (`#05236e`) to light blue (`#96d2ff`). Use the color picker and **Add color** to add a color that is not already in the palette. Remove colors with the × button; at least one color must remain. The picker initially selects `#1f77b4`.
