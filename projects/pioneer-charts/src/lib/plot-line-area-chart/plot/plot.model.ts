import { PcacLineAreaChartConfig } from "../plot-line-area-chart.model";

/**
 * How the plot chart spreads out points that share a coordinate (see
 * `PcacPlotChartConfig.pointFanOut`). Each group of coincident points is placed evenly around
 * a ring centered on the shared coordinate, starting at 12 o'clock and going clockwise in data
 * order (series order, then point order), so every point stays visible and hoverable.
 */
export class PcacPointFanOutConfig {
  /**
   * Ring radius in px, the same for every group. When not set, each group gets the smallest
   * radius at which its neighbours sit `gap` px apart - so a pair barely moves while a group of
   * five spreads as far as it has to.
   */
  radius?: number

  /**
   * Space between neighbouring points on the ring, in px, when `radius` is not set. Measured
   * between their image boxes (or hovered dots), not their centers.
   */
  gap: number = 4

  /**
   * Draw a dot at the shared coordinate - the value the group's points actually have - with a
   * spoke out to each of them. Styled by the theme's `.fan-out-anchor` / `.fan-out-spoke` rules.
   */
  showAnchor: boolean = true
}

export class PcacPlotChartConfig extends PcacLineAreaChartConfig {
  /**
   * Spread points that share a coordinate around it instead of drawing them on top of one
   * another (where only the last series' point shows, and only it can be hovered). Off when not
   * set; `{}` turns it on with every `PcacPointFanOutConfig` default. The fanned points keep
   * their true value in the tooltip, and the hovered point's tooltip context lists the others at
   * its coordinate in `coincident` (see `PcacTooltipContext`).
   *
   * Plot chart only: a line or area chart's points are joined in series order, so moving one
   * would kink the line.
   */
  pointFanOut?: Partial<PcacPointFanOutConfig>
}
