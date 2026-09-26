import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // The browser build loads the mock data with XHR, which doesn't exist at build time; the
    // pre-renderer serves the site's own files (./mock/*.json) to `fetch` instead. The data then
    // travels in each page's HTML (hydration's HTTP transfer cache), so the browser doesn't
    // request it again.
    provideHttpClient(withFetch()),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
