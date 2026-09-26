import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideCheckNoChangesConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { routes } from './app.routes';
import { PageSeoStrategy } from './seo';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Zoneless is already the framework default (bootstrapApplication includes it without this
    // call), so this is kept purely for the dev-mode NG0914 warning that lives inside it: the
    // tripwire that fires if zone.js ever sneaks back in via a dependency. See CLAUDE.md.
    provideZonelessChangeDetection(),
    // Dev-only (ngDevMode-gated, no-ops in production builds): periodically re-checks every
    // OnPush view's bindings for changes Angular wasn't notified about. This is the tripwire for
    // exactly the failure mode zoneless CD introduces - a binding going stale because whatever
    // changed it didn't go through a path Angular's scheduler knows to react to. Every chart's
    // click output (barClicked/sliceClicked/dotClicked) already goes through Angular's own
    // compiled listener wrapping regardless of the originating D3-native DOM event, 
    // so this should stay silent - keeping it on permanently costs nothing and is
    // the cheapest possible guard against a future regression of that assumption.
    provideCheckNoChangesConfig({ exhaustive: true, interval: 5000 }),
    provideRouter(routes),
    // Page titles, meta descriptions and canonical URLs, from each route's title/data (see seo.ts).
    { provide: TitleStrategy, useClass: PageSeoStrategy },
    provideHttpClient(withXhr())
  ]
};
