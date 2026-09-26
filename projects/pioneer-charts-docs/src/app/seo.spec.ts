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
});
