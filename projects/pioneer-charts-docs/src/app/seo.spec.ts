import { Component, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, TitleStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PageSeoStrategy } from './seo';

@Component({ template: '' })
class PageComponent {}

describe('PageSeoStrategy', () => {
  let harness: RouterTestingHarness;
  let document: Document;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: PageComponent, data: { description: 'Home page.' } },
          { path: 'docs/guides/theme', title: 'Theme', component: PageComponent, data: { description: 'Theming.' } },
          {
            path: 'docs/components/charts/bar-chart', title: 'Bar Chart', component: PageComponent,
            data: { searchTitle: 'Angular Bar Chart', description: 'Bars.' },
          },
          { path: 'docs/guides/introduction', title: 'Getting Started', component: PageComponent, data: { description: 'Start.' } },
          { path: 'charts', title: 'Charts', component: PageComponent, data: { description: 'Gallery.' } },
          { path: '**', component: PageComponent, data: { notFound: true } },
        ]),
        { provide: TitleStrategy, useClass: PageSeoStrategy },
      ],
    });
    harness = await RouterTestingHarness.create();
    document = TestBed.inject(DOCUMENT);
  });

  const meta = (selector: string) => document.head.querySelector(`meta[${selector}]`)?.getAttribute('content');
  const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

  it('titles a page after its route, with the site name', async () => {
    await harness.navigateByUrl('/docs/guides/theme');

    expect(TestBed.inject(Title).getTitle()).toBe('Theme · Pioneer Charts');
    expect(meta('property="og:title"')).toBe('Theme · Pioneer Charts');
  });

  it('gives the home page the site\'s own title', async () => {
    await harness.navigateByUrl('/');

    expect(TestBed.inject(Title).getTitle()).toBe('Pioneer Charts - Angular charts built on D3');
  });

  it('describes a page from its route data', async () => {
    await harness.navigateByUrl('/docs/guides/theme');

    expect(meta('name="description"')).toBe('Theming.');
    expect(meta('property="og:description"')).toBe('Theming.');
  });

  it('points the canonical URL at the page on pioneercharts.com, without query or fragment', async () => {
    await harness.navigateByUrl('/docs/guides/theme?x=1#colors');

    expect(canonical()).toBe('https://pioneercharts.com/docs/guides/theme');
    expect(meta('property="og:url"')).toBe('https://pioneercharts.com/docs/guides/theme');
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });

  it('keeps a URL that isn\'t a page out of the index, pointing it at the home page', async () => {
    await harness.navigateByUrl('/no/such/page');

    expect(meta('name="robots"')).toBe('noindex');
    expect(canonical()).toBe('https://pioneercharts.com/');
  });

  it('lifts noindex again on the next real page', async () => {
    await harness.navigateByUrl('/no/such/page');
    await harness.navigateByUrl('/docs/guides/theme');

    expect(meta('name="robots"')).toBeUndefined();
  });

  it('titles a page by its search title where it has one, keeping the short title for breadcrumbs', async () => {
    await harness.navigateByUrl('/docs/components/charts/bar-chart');

    expect(TestBed.inject(Title).getTitle()).toBe('Angular Bar Chart · Pioneer Charts');
    expect(meta('property="og:title"')).toBe('Angular Bar Chart · Pioneer Charts');
    expect(structured().itemListElement.at(-1).name).toBe('Bar Chart');
  });

  describe('link-preview image', () => {
    it('gives a page its own image, named after its path, with its title in the alt text', async () => {
      await harness.navigateByUrl('/docs/components/charts/bar-chart');

      expect(meta('property="og:image"')).toBe('https://pioneercharts.com/og/bar-chart.png');
      expect(meta('property="og:image:alt"')).toMatch(/^Angular Bar Chart - Pioneer Charts: /);
    });

    it('gives the home page, and a URL that isn\'t a page, the site\'s image', async () => {
      await harness.navigateByUrl('/docs/guides/theme');
      await harness.navigateByUrl('/');
      expect(meta('property="og:image"')).toBe('https://pioneercharts.com/og-image.png');

      await harness.navigateByUrl('/no/such/page');
      expect(meta('property="og:image"')).toBe('https://pioneercharts.com/og-image.png');
      expect(meta('property="og:image:alt"')).toMatch(/^Pioneer Charts: /);
    });
  });

  describe('structured data', () => {
    const scripts = () => document.head.querySelectorAll('script[type="application/ld+json"]');

    it('describes the site and the library on the home page', async () => {
      await harness.navigateByUrl('/');

      const types = structured()['@graph'].map((node: { '@type': string }) => node['@type']);
      expect(types).toEqual(['WebSite', 'SoftwareSourceCode']);
      expect(structured()['@graph'][1].codeRepository).toBe('https://github.com/PioneerCode/pioneer-charts');
    });

    it('gives a docs page breadcrumbs through the documentation', async () => {
      await harness.navigateByUrl('/docs/components/charts/bar-chart');

      expect(crumbs()).toEqual([
        ['Pioneer Charts', 'https://pioneercharts.com/'],
        ['Documentation', 'https://pioneercharts.com/docs/guides/introduction'],
        ['Bar Chart', 'https://pioneercharts.com/docs/components/charts/bar-chart'],
      ]);
    });

    it('leaves out the documentation step for the documentation start page and pages outside it', async () => {
      await harness.navigateByUrl('/docs/guides/introduction');
      expect(crumbs().map(([name]) => name)).toEqual(['Pioneer Charts', 'Getting Started']);

      await harness.navigateByUrl('/charts');
      expect(crumbs().map(([name]) => name)).toEqual(['Pioneer Charts', 'Charts']);
    });

    it('keeps one block, replaced on each navigation, and none for a URL that isn\'t a page', async () => {
      await harness.navigateByUrl('/docs/guides/theme');
      await harness.navigateByUrl('/charts');
      expect(scripts().length).toBe(1);

      await harness.navigateByUrl('/no/such/page');
      expect(scripts().length).toBe(0);
    });
  });

  function structured() {
    return JSON.parse(document.head.querySelector('script#pc-structured-data')!.textContent!);
  }

  function crumbs(): [string, string][] {
    return structured().itemListElement.map((step: { name: string; item: string }) => [step.name, step.item]);
  }
});
