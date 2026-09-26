import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// Only used at build time: the docs site is pre-rendered to static HTML (angular.json's
// `outputMode: "static"`), one file per route, and served as plain files from GitHub Pages.
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
