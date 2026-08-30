#!/usr/bin/env python3
"""Register transparent generated sprite cells to a shared origin and baseline."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


ALPHA_THRESHOLD = 16


def opaque_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= ALPHA_THRESHOLD else 0)
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError("Sprite cell has no opaque pixels above the alpha threshold.")
    return bounds


def register_sheet(
    source_path: Path,
    output_path: Path,
    columns: int,
    rows: int,
    baseline_ratio: float,
    horizontal_padding: int,
) -> dict[str, object]:
    source = Image.open(source_path).convert("RGBA")
    source_width, source_height = source.size

    if source_width % columns or source_height % rows:
        raise ValueError("Source dimensions must divide evenly into the sprite grid.")

    cell_width = source_width // columns
    cell_height = source_height // rows
    output_cell_width = cell_width + horizontal_padding * 2
    target_origin_x = output_cell_width // 2
    target_baseline_y = round(cell_height * baseline_ratio)
    output = Image.new("RGBA", (output_cell_width * columns, cell_height * rows))
    frames: list[dict[str, object]] = []

    for frame in range(columns * rows):
        column = frame % columns
        row = frame // columns
        left = column * cell_width
        top = row * cell_height
        cell = source.crop((left, top, left + cell_width, top + cell_height))
        bounds = opaque_bounds(cell)
        frame_center_x = (bounds[0] + bounds[2] - 1) / 2
        frame_baseline_y = bounds[3] - 1
        offset_x = round(target_origin_x - frame_center_x)
        offset_y = target_baseline_y - frame_baseline_y

        registered = Image.new("RGBA", (output_cell_width, cell_height))
        registered.alpha_composite(cell, (offset_x, offset_y))
        output.alpha_composite(
            registered,
            (column * output_cell_width, top),
        )
        frames.append(
            {
                "frame": frame + 1,
                "sourceBounds": bounds,
                "translation": {"x": offset_x, "y": offset_y},
            }
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(output_path)

    manifest = {
        "source": str(source_path),
        "output": str(output_path),
        "grid": {"columns": columns, "rows": rows},
        "sourceCell": {"width": cell_width, "height": cell_height},
        "outputCell": {"width": output_cell_width, "height": cell_height},
        "horizontalPadding": horizontal_padding,
        "sharedOrigin": {"x": target_origin_x, "y": target_baseline_y},
        "alphaThreshold": ALPHA_THRESHOLD,
        "frames": frames,
    }
    output_path.with_suffix(".json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--columns", type=int, default=3)
    parser.add_argument("--rows", type=int, default=2)
    parser.add_argument("--baseline", type=float, default=0.9)
    parser.add_argument("--horizontal-padding", type=int, default=64)
    arguments = parser.parse_args()
    manifest = register_sheet(
        arguments.source,
        arguments.output,
        arguments.columns,
        arguments.rows,
        arguments.baseline,
        arguments.horizontal_padding,
    )
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
