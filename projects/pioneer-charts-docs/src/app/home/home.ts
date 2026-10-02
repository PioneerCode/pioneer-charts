import { Component, inject } from '@angular/core';
import { PcacAreaChart } from '@pioneer-code/pioneer-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppService } from '../app.service';
import { LayoutResourceState } from '../layout/resource-state/resource-state';
import { ChartCard } from '../layout/chart-card/chart-card';
import { ChartContract } from '../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [
    ChartCard,
    ChartContract,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    PcacAreaChart,
    LayoutResourceState,
  ]
})
export class Home {
  readonly appService = inject(AppService);

  /**
   * Every chart's docs page, linked from the home page so each is one click from the site's
   * strongest page (and found by crawlers from it) rather than only from the docs sidebar.
   */
  readonly charts: ChartLink[] = [
    { name: 'Bar Chart', path: 'bar-chart', summary: 'Vertical and horizontal - single, grouped and stacked, with thresholds.' },
    { name: 'Line Chart', path: 'line-chart', summary: 'Series over time or any scale, with zoom and hover effects.' },
    { name: 'Area Chart', path: 'area-chart', summary: 'Filled series with zoom, point images and ranges.' },
    { name: 'Plot Chart', path: 'plot-chart', summary: 'A scatter plot that fans out overlapping points.' },
    { name: 'Pie Chart', path: 'pie-chart', summary: 'Animated slices, each one clickable.' },
    { name: 'Donut Chart', path: 'donut-chart', summary: 'A ring with a total or any label in its center.' },
    { name: 'Dot Plot Chart', path: 'dot-plot-chart', summary: 'Values stacked into columns along one axis.' },
    { name: 'Proximity Chart', path: 'proximity-chart', summary: 'One item in the middle, its closest matches around it.' },
    { name: 'Legend', path: 'legend', summary: 'Show a chart\'s series and react to clicks.' },
  ];

  /** Down Lane Motion pages for the "Built with Pioneer Charts" gallery, alternating light and dark. */
  readonly showcase: ShowcaseShot[] = [
    showcaseShot('Stats', 'Bar and donut charts', 'Light', '', 'stats-light'),
    showcaseShot('Tech Specs', 'Plot chart', 'Dark', 'tech-specs', 'tech-specs-dark'),
    showcaseShot('Reaction', 'Plot chart', 'Light', 'reaction', 'reaction-light'),
    showcaseShot('Look-alikes', 'Proximity chart', 'Dark', 'look-alikes', 'look-alikes-dark'),
    showcaseShot('Arsenal Ladder', 'Dot plot chart', 'Light', 'arsenal-ladder', 'arsenal-ladder-light'),
    showcaseShot('Stats', 'Bar and donut charts', 'Dark', '', 'stats-dark'),
  ];
}

interface ChartLink {
  name: string;
  /** Its page under /docs/components/charts. */
  path: string;
  summary: string;
}

interface ShowcaseShot {
  page: string;
  charts: string;
  theme: 'Light' | 'Dark';
  url: string;
  image: string;
  /** Describes the screenshot itself, so it can be found in image search; the caption names the link. */
  alt: string;
}

/** A shot of a downlanemotion.com page, its image under public/showcase. */
function showcaseShot(page: string, charts: string, theme: 'Light' | 'Dark', path: string, image: string): ShowcaseShot {
  return {
    page,
    charts,
    theme,
    url: `https://downlanemotion.com/${path}`,
    image: `showcase/down-lane-motion-${image}.jpg`,
    alt: `${charts} built with Pioneer Charts on Down Lane Motion's ${page} page, ${theme.toLowerCase()} theme`,
  };
}
