import {Component} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.sass'],
  imports: [
    MatCard,
    MatTooltip
  ],
  standalone: true
})
export class AboutPageComponent {

}
