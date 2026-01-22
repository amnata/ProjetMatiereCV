// app.component.ts
import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatFileSizePipe } from './pipes/format-file-size.pipe';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ImageItem {
  id: string;
  name: string;
  file: File;
  preview: string;
  compressed?: {
    file: Blob;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    type: 'lossy' | 'lossless';
  };
  isCompressing?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, FormatFileSizePipe,HttpClientModule],
  template: `
    <div class="app-container">
      <!-- Header with Upload Button -->
      <header class="header">
        <div class="header-content">
          <div class="header-title">
            <h1>OptiPix</h1>
            <p>Compressez vos images facilement</p>
          </div>
          <div class="header-upload">
            <input 
              #fileInput 
              type="file" 
              multiple 
              accept="image/*"
              (change)="onFileSelected($event)"
              hidden>
            <button (click)="fileInput.click()" class="btn btn-upload">
              <i class="fas fa-cloud-upload-alt"></i> Importer des images
            </button>
          </div>
        </div>
      </header>

      <!-- Images Grid or Empty State -->
      <div class="images-container">
        <!-- Empty State -->
        <div class="empty-state" *ngIf="images.length === 0">
          <div class="empty-content">
            <i class="empty-icon fas fa-images"></i>
            <h2>Vous n'avez pas encore d'images</h2>
            <p>Commencez par importer vos images pour les compresser</p>
          </div>
        </div>

        <!-- Grid with Images (3 par ligne) -->
        <div class="grid" *ngIf="images.length > 0">
          <div *ngFor="let image of images" 
               class="grid-item"
               (click)="openPreview(image)">
            <img [src]="image.preview" [alt]="image.name">
            
            <!-- Badge de compression -->
            <div class="compression-badge" *ngIf="image.compressed">
              <i class="fas fa-check-circle"></i>
              <span>-{{image.compressed.compressionRatio}}%</span>
            </div>
            
            <!-- Loader pendant compression -->
            <div class="compression-loader" *ngIf="image.isCompressing">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Compression...</span>
            </div>
            
            <div class="image-info">
              <p class="image-name">{{ image.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Barre d'actions globales -->
      <div class="global-actions" *ngIf="images.length > 0">
        <button class="action-global-btn compress-all-btn" 
                (click)="showCompressionTypeModal = true"
                [disabled]="isCompressingAll">
          <i class="fas fa-compress"></i> 
          <span *ngIf="!isCompressingAll">Tout compresser</span>
          <span *ngIf="isCompressingAll">Compression en cours... ({{compressionProgress}}/{{images.length}})</span>
        </button>
      </div>

      <!-- Drop Zone (drag and drop) -->
      <div class="drop-zone" 
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           [class.drag-active]="isDragging"
           *ngIf="isDragging">
        <div class="drop-content">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Déposez vos images ici</p>
        </div>
      </div>

      <!-- Stats Footer -->
      <footer class="footer" *ngIf="images.length > 0">
        <p>{{ images.length }} image(s) • {{ getCompressedCount() }} compressée(s)</p>
      </footer>

      <!-- Modal de choix de type de compression -->
      <div class="modal-overlay" *ngIf="showCompressionTypeModal" (click)="showCompressionTypeModal = false">
        <div class="compression-modal" (click)="$event.stopPropagation()">
          <h2> Choisir le type de compression</h2>
          <p class="modal-subtitle">Sélectionnez le niveau de compression souhaité</p>
          
          <div class="compression-options">
            <button class="compression-option lossy-option" 
                    (click)="compressAllImages('lossy')">
              <div class="option-icon">
                <i class="fas fa-bolt"></i>
              </div>
              <h3>Lossy (Avec perte)</h3>
              <p>Compression maximale, légère perte de qualité</p>
              <span class="option-badge">Recommandé pour le web</span>
            </button>
            
            <button class="compression-option lossless-option" 
                    (click)="compressAllImages('lossless')">
              <div class="option-icon">
                <i class="fas fa-gem"></i>
              </div>
              <h3>Lossless (Sans perte)</h3>
              <p>Qualité préservée, compression modérée</p>
              <span class="option-badge">Meilleure qualité</span>
            </button>
          </div>
          
          <button class="cancel-btn" (click)="showCompressionTypeModal = false">
            Annuler
          </button>
        </div>
      </div>

      <!-- Preview Modal -->
      <div class="modal-overlay" *ngIf="selectedImage" (click)="closePreview()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          
          <!-- Top Bar avec bouton fermer à gauche et menu 3 points à droite -->
          <div class="modal-header">
            <button class="close-btn" 
                    (click)="closePreview()"
                    title="Fermer">
              <i class="fas fa-times"></i>
            </button>
            
            <h2>{{ selectedImage.name }}</h2>
            
            <div class="menu-container">
              <button class="menu-btn" 
                      (click)="toggleMenu($event)"
                      title="Options">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              
              <!-- Menu déroulant -->
              <div class="dropdown-menu" *ngIf="isMenuOpen">
                <button class="menu-item compress-item" 
                        (click)="openSingleCompressionModal()"
                        [disabled]="selectedImage.isCompressing">
                  <i class="fas fa-compress"></i>
                  <span *ngIf="!selectedImage.compressed && !selectedImage.isCompressing">Compresser</span>
                  <span *ngIf="selectedImage.compressed">Recompresser</span>
                  <span *ngIf="selectedImage.isCompressing">Compression...</span>
                </button>
                <button class="menu-item download-item" 
                        (click)="downloadImage(selectedImage)">
                  <i class="fas fa-download"></i>
                  <span>{{ selectedImage.compressed ? 'Télécharger (compressée)' : 'Télécharger (originale)' }}</span>
                </button>
                <button class="menu-item delete-item" 
                        (click)="deleteImage(selectedImage)">
                  <i class="fas fa-trash-alt"></i>
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Image Display -->
          <div class="modal-body">
            <img [src]="selectedImage.preview" [alt]="selectedImage.name">
          </div>

          <!-- Image Info -->
          <div class="modal-footer">
            <div class="info-item">
              <i class="fas fa-file"></i>
              <span *ngIf="!selectedImage.compressed">{{ selectedImage.file.size | formatFileSize }}</span>
              <span *ngIf="selectedImage.compressed">
                {{ selectedImage.compressed.originalSize | formatFileSize }} 
                <i class="fas fa-arrow-right"></i> 
                {{ selectedImage.compressed.compressedSize | formatFileSize }}
                <span class="compression-percent">(-{{selectedImage.compressed.compressionRatio}}%)</span>
              </span>
            </div>
            <div class="info-item" *ngIf="selectedImage.compressed">
              <i class="fas fa-tag"></i>
              <span class="compression-type-badge">{{ selectedImage.compressed.type === 'lossy' ? 'Lossy' : 'Lossless' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de compression individuelle -->
      <div class="modal-overlay" *ngIf="showSingleCompressionModal" (click)="showSingleCompressionModal = false">
        <div class="compression-modal" (click)="$event.stopPropagation()">
          <h2> Choisir le type de compression</h2>
          <p class="modal-subtitle">Pour : {{ selectedImage?.name }}</p>
          
          <div class="compression-options">
            <button class="compression-option lossy-option" 
                    (click)="compressImage(selectedImage!, 'lossy')">
              <!-- <div class="option-icon">
                <i class="fas fa-bolt"></i>
              </div> -->
              <h3>Lossy (Avec perte)</h3>
              <p>Compression maximale, légère perte de qualité</p>
              <span class="option-badge">Recommandé pour le web</span>
            </button>
            
            <button class="compression-option lossless-option" 
                    (click)="compressImage(selectedImage!, 'lossless')">
              <!-- <div class="option-icon">
                <i class="fas fa-gem"></i>
              </div> -->
              <h3>Lossless (Sans perte)</h3>
              <p>Qualité préservée, compression modérée</p>
              <span class="option-badge">Meilleure qualité</span>
            </button>
          </div>
          
          <button class="cancel-btn" (click)="showSingleCompressionModal = false">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    /* ============ HEADER ============ */
    .header {
      background: #667eea;
      color: white;
      padding: 20px 40px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title h1 {
      font-size: 28px;
      margin-bottom: 4px;
      font-weight: 700;
    }

    .header-title p {
      font-size: 14px;
      opacity: 0.9;
    }

    .btn-upload {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }



    /* ============ MAIN CONTENT ============ */
    .images-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 60vh;
    }

    .empty-state {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
    }

    .empty-content {
      text-align: center;
      color: #999;
    }

    .empty-icon {
      font-size: 80px;
      display: block;
      margin-bottom: 20px;
      color: #ddd;
    }

    .empty-content h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }

    /* Grid - 3 images par ligne */
    .grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
    }

    .grid-item {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      aspect-ratio: 1;
    }


    .grid-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Badge de compression */
    .compression-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 2;
    }

    .compression-loader {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      gap: 10px;
      z-index: 3;
    }

    .compression-loader i {
      font-size: 30px;
    }

    /* Image Info */
    .image-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      padding: 20px 15px 12px;
      color: white;
    }

    .image-name {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ============ ACTIONS GLOBALES ============ */
    .global-actions {
      max-width: 1200px;
      margin: 30px auto;
      padding: 0 20px;
      display: flex;
      justify-content: center;
    }

    .action-global-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px 30px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .compress-all-btn {
      background: rgba(102, 126, 234, 0.95);
      color: white;
    }


    .compress-all-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ============ MODAL DE COMPRESSION ============ */
    .compression-modal {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    .compression-modal h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .modal-subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
    }

    .compression-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .compression-option {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 25px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      text-align: center;
    }


    .option-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 15px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: #f8f9fa;
    }

    .compression-option h3 {
      font-size: 18px;
      color: #333;
      margin-bottom: 8px;
    }

    .compression-option p {
      font-size: 13px;
      color: #666;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .option-badge {
            background: rgba(102, 126, 234, 0.95);
      display: inline-block;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 600;
      color: white;
    }

    .cancel-btn {
      width: 100%;
      padding: 12px;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 800;
      color: #666;
      transition: all 0.3s ease;
    }

    /* ============ DROP ZONE ============ */
    .drop-zone {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(102, 126, 234, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .drop-content {
      text-align: center;
      color: white;
    }

    .drop-content i {
      font-size: 80px;
      display: block;
      margin-bottom: 20px;
      opacity: 0.9;
    }

    /* ============ FOOTER ============ */
    .footer {
      text-align: center;
      padding: 30px;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #eee;
      margin-top: 40px;
    }

    /* ============ MODAL PREVIEW ============ */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      border-radius: 15px;
      width: 100%;
      max-width: 1400px;
      height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 1px solid #eee;
      gap: 15px;
    }

    .close-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: #f1f3f5;
      color: #495057;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      order: 1;
    }

    .modal-header h2 {
      font-size: 18px;
      color: #333;
      flex: 1;
      text-align: center;
      order: 2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-container {
      position: relative;
      order: 3;
    }

    .menu-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: #f1f3f5;
      color: #495057;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      min-width: 220px;
      overflow: hidden;
      z-index: 1001;
      animation: menuSlideIn 0.2s ease;
    }

    @keyframes menuSlideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .menu-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border: none;
      background: white;
      color: #333;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      text-align: left;
    }

    .menu-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-item i {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .delete-item {
      border-top: 1px solid #f1f3f5;
    }

    .modal-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      background: #f9f9f9;
      padding: 20px;
    }

    .modal-body img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .modal-footer {
      padding: 15px 30px;
      border-top: 1px solid #eee;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .info-item i {
      color: #667eea;
    }

    .compression-percent {
      font-weight: 600;
      margin-left: 5px;
    }

    .compression-type-badge {
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    /* ============ RESPONSIVE ============ */
    @media (max-width: 1024px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
      .compression-options { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .header { padding: 15px 20px; }
      .header-content { flex-direction: column; gap: 15px; }
      .grid { gap: 15px; }
      .modal-header h2 { font-size: 16px; }
    }

    @media (max-width: 480px) {
      .grid { grid-template-columns: 1fr; }
      .modal-content { height: 100vh; border-radius: 0; }
    }
  `]
})
export class AppComponent {
  images: ImageItem[] = [];
  selectedImage: ImageItem | null = null;
  isDragging = false;
  isMenuOpen = false;
  showCompressionTypeModal = false;
  showSingleCompressionModal = false;
  isCompressingAll = false;
  compressionProgress = 0;

  // 🔗 REMPLACEZ CES URLs PAR VOS ENDPOINTS
  private readonly UPLOAD_ENDPOINT = 'https://votre-api.com/upload';
  private readonly LIST_IMAGES_ENDPOINT = 'https://votre-api.com/images/list';
  private readonly LOSSY_ENDPOINT = 'https://votre-api.com/compress/lossy';
  private readonly LOSSLESS_ENDPOINT = 'https://votre-api.com/compress/lossless';

  constructor(private http: HttpClient) {
    this.loadImagesFromServer();
  }

  // ✅ Ajouter cette fonction juste après le constructor
  async loadImagesFromServer(): Promise<void> {
    try {
      const response = await this.http.get<any[]>(this.LIST_IMAGES_ENDPOINT).toPromise();
      
      if (response) {
        response.forEach((imageData: any) => {
          const imageItem: ImageItem = {
            id: imageData.id || Date.now().toString() + Math.random(),
            name: imageData.name || 'image.jpg',
            file: null as any, // Pas de fichier local pour images serveur
            preview: imageData.url || imageData.preview // URL de l'image depuis le serveur
          };
          this.images.push(imageItem);
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement images:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addImages(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.addImages(Array.from(event.dataTransfer.files));
    }
  }

  addImages(files: File[]): void {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageItem: ImageItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          file: file,
          preview: e.target?.result as string
        };
        this.images.push(imageItem);
        
        // ✅ Upload automatique
        this.uploadImageToServer(imageItem);
      };
      reader.readAsDataURL(file);
    }
  });
}

// ✅ Ajouter cette nouvelle fonction juste après addImages()
async uploadImageToServer(image: ImageItem): Promise<void> {
  const formData = new FormData();
  formData.append('image', image.file);

  try {
    const response = await this.http.post<any>(this.UPLOAD_ENDPOINT, formData).toPromise();
    console.log(`✅ Image uploadée: ${image.name}`, response);
  } catch (error) {
    console.error('❌ Erreur upload:', error);
  }
}

  getCompressedCount(): number {
    return this.images.filter(img => img.compressed).length;
  }

  openPreview(image: ImageItem): void {
    this.selectedImage = image;
    this.isMenuOpen = false;
    document.body.style.overflow = 'hidden';
  }

  closePreview(): void {
    this.selectedImage = null;
    this.isMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  openSingleCompressionModal(): void {
    this.showSingleCompressionModal = true;
    this.isMenuOpen = false;
  }

  deleteImage(image: ImageItem): void {
    this.images = this.images.filter(img => img.id !== image.id);
    if (this.selectedImage?.id === image.id) {
      this.closePreview();
    }
    this.isMenuOpen = false;
  }

  downloadImage(image: ImageItem): void {
    let url: string;
    let filename: string;

    if (image.compressed) {
      url = URL.createObjectURL(image.compressed.file);
      const ext = image.name.split('.').pop();
      filename = image.name.replace(`.${ext}`, `_compressed_${image.compressed.type}.${ext}`);
    } else {
      url = image.preview;
      filename = image.name;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (image.compressed) {
      URL.revokeObjectURL(url);
    }

    this.isMenuOpen = false;
  }

  async compressImage(image: ImageItem, type: 'lossy' | 'lossless'): Promise<void> {
    this.showSingleCompressionModal = false;
    image.isCompressing = true;

    const formData = new FormData();
    formData.append('image', image.file);

    const endpoint = type === 'lossy' ? this.LOSSY_ENDPOINT : this.LOSSLESS_ENDPOINT;

    try {
      const response = await this.http.post(endpoint, formData, {
        responseType: 'blob',
        observe: 'response'
      }).toPromise();

      if (response && response.body) {
        const compressedBlob = response.body;
        const originalSize = image.file.size;
        const compressedSize = compressedBlob.size;
        const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

        image.compressed = {
          file: compressedBlob,
          originalSize,
          compressedSize,
          compressionRatio,
          type
        };

        const reader = new FileReader();
        reader.onload = (e) => {
          image.preview = e.target?.result as string;
        };
        reader.readAsDataURL(compressedBlob);

        console.log(`✅ Compression ${type} réussie:`, {
          original: `${(originalSize / 1024).toFixed(2)} KB`,
          compressed: `${(compressedSize / 1024).toFixed(2)} KB`,
          ratio: `${compressionRatio}%`
        });
      }
    } catch (error) {
      console.error('❌ Erreur de compression:', error);
      alert(`Erreur lors de la compression de ${image.name}`);
    } finally {
      image.isCompressing = false;
    }
  }

  async compressAllImages(type: 'lossy' | 'lossless'): Promise<void> {
    this.showCompressionTypeModal = false;
    this.isCompressingAll = true;
    this.compressionProgress = 0;

    for (const image of this.images) {
      if (!image.compressed) {
        await this.compressImage(image, type);
      }
      this.compressionProgress++;
    }

    this.isCompressingAll = false;
    this.compressionProgress = 0;
  }
}