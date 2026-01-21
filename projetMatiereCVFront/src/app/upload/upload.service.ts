import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    // Pour l'instant, simule juste un upload
    console.log('Uploading file:', file.name);
    return of('url/de/limage/compressée');
    // Pour un backend réel :
    // const formData = new FormData();
    // formData.append('file', file);
    // return this.http.post<{url: string}>('/api/upload', formData).pipe(map(res => res.url));
  }
}
