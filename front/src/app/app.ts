import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ConversionResponse {
  	message: string;
  	title: string;
  	thumbnail: string;
  	downloadUrl: string;
}

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App {
	private http = inject(HttpClient);
	private cdr = inject(ChangeDetectorRef);
	
	youtubeUrl: string = '';
	isLoading: boolean = false;
	isDownloaded: boolean = false;
	videoData: ConversionResponse | null = null;
	errorMessage: string = '';

	convertURL() {
		if (!this.youtubeUrl) return;

		this.isLoading = true;
		this.videoData = null;
		this.errorMessage = '';

		const backendUrl = 'http://localhost:3000/api/convert';
		const body = { url: this.youtubeUrl };

		this.http.post<ConversionResponse>(backendUrl, body).subscribe({
			next: (response) => {
				console.log('Respuesta que llega del backend:', response);
				this.videoData = response;
				this.isLoading = false;
				this.cdr.detectChanges();
			},
			error: (err) => {
				this.isLoading = false;
				this.errorMessage = 'Inténtelo de nuevo o convierta otro video.';
				console.error('Error:', err);
				this.cdr.detectChanges();
			}
		});
	}

	downloadAndReset() {
        setTimeout(() => {
            this.resetForm();
            this.cdr.detectChanges();
        }, 800);
	}

	resetForm() {
		this.videoData = null;
		this.youtubeUrl = '';
		this.errorMessage = '';
	}

}
