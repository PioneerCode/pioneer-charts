import { TestBed } from '@angular/core/testing';
import { provideRouter, Route } from '@angular/router';
import { routes } from './app.routes';
import { CHARTS } from './home/home';
import { LayoutPageDocsNavigation } from './layout/page-docs/navigation/navigation';

/** Every page's route, by its URL (the routes are flat: one per page). */
function pages(): Map<string, Route> {
  return new Map(routes.filter((route) => route.path !== undefined && route.path !== '**').map((route) => [`/${route.path}`, route]));
}

describe('docs pages', () => {
  const navigation = async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(LayoutPageDocsNavigation);
    await fixture.whenStable();
    return Array.from(fixture.nativeElement.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>)
      .map((a) => a.getAttribute('href')!);
  };

  // A page left out of the routes would be a link to the not-found page; one without a search title
  // or description, a page search engines show badly
  it('has a route for every link in the docs navigation, each with a search title and a description', async () => {
    const found = pages();
    for (const href of await navigation()) {
      const route = found.get(href);
      expect(route, href).toBeDefined();
      expect(route!.title, href).toBeTruthy();
      expect(route!.data?.['description'], href).toBeTruthy();
    }
  });

  it('has a docs page for every chart the home page links', () => {
    const found = pages();
    for (const chart of CHARTS) {
      expect(found.has(`/docs/components/charts/${chart.path}`), chart.name).toBe(true);
    }
  });

  it('links the State Timeline page from the navigation and the home page', async () => {
    expect(await navigation()).toContain('/docs/components/charts/state-timeline');
    expect(CHARTS.map((chart) => chart.path)).toContain('state-timeline');
    expect(pages().get('/docs/components/charts/state-timeline')!.data?.['searchTitle']).toBe('Angular State Timeline Chart');
  });
});
