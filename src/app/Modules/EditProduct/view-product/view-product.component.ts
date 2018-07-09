import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EditProductService } from '../edit-product.service';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'view-product',
  templateUrl: './view-product.component.html',
  styles: [``]
})
export class ViewProductComponent implements OnInit {

  searchProductForm: FormGroup;
  currentPage: string;
  searchCriteria: any = { page: 0, searchTest: '', is_expired_only: false, is_out_of_stock: false };
  products: any = [];
  totalProd: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private editProductService: EditProductService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // building the form controls
    this.searchProductForm = this.formBuilder.group({
      name: [''],
      expired: [false],
      outOfStock: [false],
    });
    this.searchProductForm.valueChanges.pipe(debounceTime(500))
      .subscribe(res => {
        this.searchCriteria = {};
        this.searchCriteria.searchTest = res.name;
        this.searchCriteria.is_expired_only = res.expired;
        this.searchCriteria.is_out_of_stock = res.outOfStock;
        this.searchCriteria.page = 0;
        this.fetchProducts(this.searchCriteria);
      });
    this.fetchProducts(this.searchCriteria);
  }

  editProduct() {

  }

  fetchProducts(searchCriteria: any) {
    this.editProductService.searchProducts(searchCriteria).toPromise()
      .then(res => {
        if (res._body) {
          const response = JSON.parse(res._body);
          this.totalProd = response.count;
          this.products = response.product_list;
        } else {
          this.snackBar.open('Response error', 'ok');
        }
      });
  }

  onPageChange(event: any) {
    this.searchCriteria.page = event.offset;
    this.fetchProducts(this.searchCriteria);
  }
}
