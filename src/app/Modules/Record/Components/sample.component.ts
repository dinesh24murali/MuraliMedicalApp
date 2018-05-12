import { Component } from '@angular/core';

@Component({
  selector: 'chkbox-selection-template-demo',
  template: `
  <div class="container">
  
    <div>
      <h3>
        Custom Checkbox Selection
        <small>
          <button (click)="add()">Add</button> |
          <button (click)="update()">Update</button> |
          <button (click)="remove()">Remove</button> 
        </small>
      </h3>
      <div style='width:100%'>
        <ngx-datatable
          style="width: 90%"
          class="material"
          [rows]="rows"
          [columnMode]="'force'"
          [headerHeight]="50"
          [footerHeight]="50"
          [rowHeight]="'auto'"
          [limit]="10"
          [selected]="selected"
          [selectionType]="'checkbox'"
          (activate)="onActivate($event)"
          (select)='onSelect($event)'>
          <ngx-datatable-column [width]="30" [sortable]="false" [canAutoResize]="false" [draggable]="true" [resizeable]="true">
              <ng-template ngx-datatable-header-template let-value="value" let-allRowsSelected="allRowsSelected" let-selectFn="selectFn">
                <input type="checkbox" [checked]="allRowsSelected" (change)="selectFn(!allRowsSelected)"/>
              </ng-template>
              <ng-template ngx-datatable-cell-template let-value="value" let-isSelected="isSelected" let-onCheckboxChangeFn="onCheckboxChangeFn">
                <input type="checkbox" [checked]="isSelected" (change)="onCheckboxChangeFn($event)"/>
              </ng-template>
          </ngx-datatable-column>
          <ngx-datatable-column [draggable]="true" name="Name"></ngx-datatable-column>
          <ngx-datatable-column name="Gender"></ngx-datatable-column>
          <ngx-datatable-column name="Company"></ngx-datatable-column>
        </ngx-datatable>
      </div>
    </div>
    </div>
  `
})
export class SampleComponent {

  rows:any[] = [];
  selected:any[] = [];

  constructor() {
    this.fetch((data:any) => {
      this.rows = data;
    });
  }

  fetch(cb:any) {
    const req = new XMLHttpRequest();
    req.open('GET', `app/Modules/Record/data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  onSelect({ selected }:any) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event:any) {
    console.log('Activate Event', event);
  }

  add() {
    this.rows.push({
        "name": "Carroll Buchanan",
        "gender": "male",
        "company": "Ecosys"
    });
  }

  update() {
    this.selected = [this.rows[1], this.rows[3]];
  }

  remove() {
    
    let scope = this;
    this.selected.forEach(function(item){
        let index = scope.rows.indexOf(item);
        scope.rows.splice(index,1);
    });
    this.selected = [];
  }

}