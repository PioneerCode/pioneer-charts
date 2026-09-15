import { zoom } from "d3";

/**
 * `extent` (the viewport the gesture happens in) is set to the plot area explicitly rather than
 * left to d3's default, which reads the *owning `<svg>`'s* size - plot plus margins. With the
 * viewport wider than `translateExtent`, d3's constraint centers the plot within it instead of
 * pinning the two together, so the first gesture (even one that zooms straight back out to k = 1)
 * left the chart shifted right/down by half the margins: x domain min detached from the y axis,
 * domain max pushed off the right edge.
 */
export function buildZoomBehavior(width: number, height: number, zoomedFn: (event: d3.D3ZoomEvent<Element, unknown>) => void): d3.ZoomBehavior<Element, unknown> {
  return zoom()
    .scaleExtent([1, 10])
    .extent([[0, 0], [width, height]])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomedFn);
}
