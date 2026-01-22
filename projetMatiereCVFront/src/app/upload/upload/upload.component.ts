import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
// import { UploadService } from '../upload.service';


// export class UploadComponent {
//   selectedFile: File | null = null;
//   uploadedUrl: string | null = null;

//   constructor(private uploadService: UploadService) {}

//   onFileSelected(event: any) {
//     this.selectedFile = event.target.files[0];
//   }

//   upload() {
//     if (this.selectedFile) {
//       this.uploadService.uploadImage(this.selectedFile).subscribe(url => {
//         this.uploadedUrl = url;
//       });
//     }
//   }
// }

import {OnInit } from '@angular/core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  imports: [CommonModule]
})
export class UploadComponent implements OnInit {

  // Préloader
  isLoading = true;

  // Modal
  showModal = false;
  showLoginForm = false;
  showRegisterForm = false;
  showSocialForm = true;

  ngOnInit(): void {
    // Simuler le preloader
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  openModal(): void {
    this.showModal = true;
    this.showSocialForm = true;
    this.showLoginForm = false;
    this.showRegisterForm = false;
  }

  closeModal(): void {
    this.showModal = false;
  }

  openLogin(): void {
    this.showSocialForm = false;
    this.showLoginForm = true;
    this.showRegisterForm = false;
  }

  openRegister(): void {
    this.showSocialForm = false;
    this.showLoginForm = false;
    this.showRegisterForm = true;
  }

  backToSocial(): void {
    this.showSocialForm = true;
    this.showLoginForm = false;
    this.showRegisterForm = false;
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
