import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideCheckNoChangesConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
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
    provideHttpClient(withXhr())
  ]
};
