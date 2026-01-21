import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CompressionComponent } from './compression/compression/compression.component';
import { ComparisonComponent } from './comparison/comparison/comparison.component';
import { ReportComponent } from './report/report/report.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'compression', component: CompressionComponent },
    { path: 'compare', component: ComparisonComponent },
    { path: 'report', component: ReportComponent}

];
