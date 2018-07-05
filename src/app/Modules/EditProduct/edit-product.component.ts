import { UtilsService } from './../../Services/utils.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'edit-product',
  templateUrl: './edit-product.component.html',
  styles: [``]
})
export class EditProductComponent implements OnInit, OnDestroy {

  constructor(
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    debugger;
    setTimeout(() => {
      this.utilsService.hideNavigationBar(true);
    }, 2000);
  }

  ngOnDestroy() {
    debugger;
    this.utilsService.hideNavigationBar(false);
  }
}
