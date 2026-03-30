import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

export type Documentation = {name: string, type: string, syntax: string, description: string};

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.sass'],
  imports: [
    MatFormFieldModule,
    MatInput,
    FormsModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader
  ],
  standalone: true
})
export class DocumentationComponent implements OnInit, OnDestroy {

  private routeDataSub: Subscription;

  documentation: Documentation[];
  search: string = '';

  get documentationFiltered() {
    let upSearch = this.search.toUpperCase();
    return this.documentation.filter(val =>
      val.name.startsWith(upSearch) ||
      val.description.toUpperCase().includes(upSearch)
    ).sort((a,b) =>
      a.name.startsWith(upSearch)
        ? b.name.startsWith(upSearch)
          ? a.name.localeCompare(b.name)
          : -1
        : b.name.startsWith(upSearch)
          ? 1
          : a.name.localeCompare(b.name)
    );
  }

  constructor(route: ActivatedRoute) {
    this.routeDataSub = route.data.subscribe(data => {
      this.documentation = data.documentation
    })
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.routeDataSub) this.routeDataSub.unsubscribe();
  }
}
