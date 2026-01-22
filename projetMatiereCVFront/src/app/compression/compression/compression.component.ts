// import { Component } from '@angular/core';
// import { CompressionService } from '../../services/compression.service';

// @Component({
//   selector: 'app-compress',
//   standalone: true,
//   templateUrl: './compression.component.html',
// })
// export class CompressComponent {

//   constructor(private compressionService: CompressionService) {}

//   onCompress(fileInput: HTMLInputElement) {
//   const file = fileInput.files?.[0];

//   if (!file) {
//     return;
//   }

//   this.compressionService
//     .compressPreview(file, 60, 800)
//     .subscribe(result => {
//       console.log(result);
//     });
// }

// }
