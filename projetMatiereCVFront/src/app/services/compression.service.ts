import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompressionService {
  private readonly API_URL = 'http://127.0.0.1:5000'; // ton Flask local

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.API_URL}/upload`, formData);
  }

  compressLossyPreview(file: File, quality = 60, width = 800): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality.toString());
    formData.append('width', width.toString());
    return this.http.post(`${this.API_URL}/compress/preview`, formData);
  }

  compressLossless(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.API_URL}/compress/lossless`, formData);
  }
}
