import {Component, OnDestroy, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

export type Documentation = { name: string, type: string, syntax: string, description: string };

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
export class DocumentationComponent implements OnDestroy {

  private _documentation = signal<Documentation[]>([]);
  private _search = signal('');
  private _routeDataSub: Subscription;

  constructor(route: ActivatedRoute) {
    this._routeDataSub = route.data.subscribe(data => {
      if (data['documentation']) {
        this._documentation.set(data['documentation']);
      }
    });
  }

  public get searchQuery() {
    return this._search();
  }

  public set searchQuery(value: string) {
    this._search.set(value);
  }

  public get documentationFiltered() {
    const upSearch = this._search().toUpperCase();
    const docs = this._documentation();

    if (!upSearch) {
      return docs;
    }

    return docs.filter(val =>
      val.name.toUpperCase().startsWith(upSearch) ||
      val.description.toUpperCase().includes(upSearch)
    ).sort((a, b) => {
      const aStarts = a.name.toUpperCase().startsWith(upSearch);
      const bStarts = b.name.toUpperCase().startsWith(upSearch);

      if (aStarts && !bStarts) {
        return -1;
      }
      if (!aStarts && bStarts) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  ngOnDestroy() {
    if (this._routeDataSub) {
      this._routeDataSub.unsubscribe();
    }
  }
}
