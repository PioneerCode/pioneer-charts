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

interface ShowcaseShot {
  page: string;
  charts: string;
  theme: 'Light' | 'Dark';
  url: string;
  image: string;
}

/** A shot of a downlanemotion.com page, its image under public/showcase. */
function showcaseShot(page: string, charts: string, theme: 'Light' | 'Dark', path: string, image: string): ShowcaseShot {
  return {
    page,
    charts,
    theme,
    url: `https://downlanemotion.com/${path}`,
    image: `showcase/down-lane-motion-${image}.jpg`,
  };
}
