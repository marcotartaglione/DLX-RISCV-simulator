import {Component} from '@angular/core';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.sass'],
  imports: [
    MatCard
  ],
  standalone: true
})
export class AboutPageComponent {
  constructor() {
  }
}
