import { zoom } from "d3";

export function buildZoomBehavior(width: number, height: number, zoomedFn: (event: d3.D3ZoomEvent<Element, unknown>) => void): d3.ZoomBehavior<Element, unknown> {
  return zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomedFn);
}
