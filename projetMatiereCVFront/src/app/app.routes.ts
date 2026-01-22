import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UploadComponent } from './upload/upload/upload.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    // { path: 'compression', component: CompressionComponen },
    { path: 'upload', component: UploadComponent }
];