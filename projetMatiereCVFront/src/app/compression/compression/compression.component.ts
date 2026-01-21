import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compression',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compression.component.html'
})
export class CompressionComponent {
  preview: string | null = null;

  // Fonction pour l'upload
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]; // récupère le fichier
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string; // stocke l'image sous forme de DataURL
    };
    reader.readAsDataURL(file);
  }
}
