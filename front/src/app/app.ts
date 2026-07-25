import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private http = inject(HttpClient);
  youtubeUrl: string = ""

  convertURL() {
    if (!this.youtubeUrl) return;
    const backendUrl = 'http://localhost:3000/api/convert';
    const body = { url: this.youtubeUrl };
    this.http.post(backendUrl, body).subscribe({
      next: (response) => {
        console.log('Respuesta recibida del servidor:', response);
      },
      error: (err) => {
        console.error('Error al conectar con el servidor:', err);
      }
    });
  }

}
