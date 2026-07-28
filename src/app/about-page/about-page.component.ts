import {Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatTooltip} from '@angular/material/tooltip';
import {MatActionList, MatListItem} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.sass'],
  imports: [
    MatCard,
    MatTooltip,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatActionList,
    MatIcon,
    MatListItem,
    MatCardFooter
  ],
  standalone: true
})
export class AboutPageComponent {

}
