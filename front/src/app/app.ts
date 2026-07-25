import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [ FormsModule ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front');

  youtube_url = ""
  submitted_url = ""

  convertURL() {
    this.submitted_url = this.youtube_url
  }

}
