import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BaseConfigComponent } from './components/base-config/base-config.component';
import { DocNavComponent } from './components/doc-nav/dov-nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { JumpNavComponent } from './components/jump-nav/jump-nav.component';
import { NavComponent } from './components/nav/nav.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PrismComponent } from './components/prism/prism.component';
import { ChartsComponent } from './pages/charts/charts.component';
import { BarChartComponent } from './pages/docs/components/charts/bar-chart/bar-chart.component';
import { LineAreaChartComponent } from './pages/docs/components/charts/line-area-chart/line-area-chart.component';
import { PieChartComponent } from './pages/docs/components/charts/pie-chart/pie-chart.component';
import { TableComponent } from './pages/docs/components/charts/table/table.component';
import { DialogComponent } from './pages/docs/components/helpers/dialog/dialog.component';
import { PaginationComponent } from './pages/docs/components/helpers/pagination/pagination.component';
import { SpinnerComponent } from './pages/docs/components/helpers/spinner/spinner.component';
import { HeaderComponent } from './pages/docs/components/ui/header/header.component';
import { DataContractComponent } from './pages/docs/guides/data-contract/data-contract.component';
import { IntroductionComponent } from './pages/docs/guides/introduction/introduction.component';
import { ThemeComponent } from './pages/docs/guides/theme/theme.component';
import { HomeComponent } from './pages/home/home.component';
import { DocLayoutComponent } from './pages/layouts/doc/doc.component';
import { PublicComponent } from './pages/layouts/public/public.component';
import { StringifyPipe } from './pipes/stringify.pipe';
import { PcacPieChartModule, PcacBarVerticalChartModule, PcacBarHorizontalChartModule, PcacLineAreaChartModule } from 'pioneer-charts';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,

    HomeComponent,
    LineAreaChartComponent,
    BarChartComponent,
    HeaderComponent,
    BaseConfigComponent,
    PieChartComponent,
    TableComponent,
    PageHeaderComponent,
    PrismComponent,
    DocLayoutComponent,
    DocNavComponent,
    NavComponent,
    FooterComponent,
    ChartsComponent,
    IntroductionComponent,
    ThemeComponent,
    DataContractComponent,
    PublicComponent,
    JumpNavComponent,
    StringifyPipe,
    PaginationComponent,
    DialogComponent,
    SpinnerComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    PcacPieChartModule,
    PcacBarVerticalChartModule,
    PcacBarHorizontalChartModule,
    PcacLineAreaChartModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
