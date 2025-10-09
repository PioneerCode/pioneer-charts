import { zoom } from "d3";

export function buildZoomBehavior(zoomedFn: (event: d3.D3ZoomEvent<Element, unknown>) => void): d3.ZoomBehavior<Element, unknown> {
  return zoom()
    .on("zoom", zoomedFn);
  // .extent([[marginLeft, 0], [width - marginRight, height]])
  // .translateExtent([[marginLeft, -Infinity], [width - marginRight, Infinity]])
}
