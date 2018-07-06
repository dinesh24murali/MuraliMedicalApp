import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from './../../../Services/utils.service';
import { RecordService } from './../record.service';

@Component({
  selector: 'print-record',
  templateUrl: './print-record.component.html',
  styles: [`
  .bill-table{
    width: 100%;
  }
  td {
    padding: 12px;
  }

  @media print
  {    
      .no-print, .no-print *
      {
          display: none !important;
      }
  }
  `]
})
export class PrintRecordComponent implements OnInit, OnDestroy {

  title: string = '';
  to: string;
  billDate: Date;
  billNo: string;
  billAmt: number;
  companyName: string = 'Murali medicals';
  items: any = [];
  taxDetails: any = {};
  taxTypes: string[] = [];

  constructor(
    private utilitsService: UtilsService,
    private recordService: RecordService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // hides the navigation bar when entering this module
    this.utilitsService.hideNavigationBar(true);
    // gets the data after the resolver has checked whether the ID is present
    this.route.data
      .subscribe((data: any) => {
        this.to = data.record.Customer ? data.record.Customer : data.record.Supplier;
        this.title = data.record.Customer ? 'Sales' : 'Purchase';
        this.billDate = new Date(data.record.BillDate);
        this.billNo = data.record.BillNo;
        this.billAmt = this.title === 'Purchase' ? data.record.Purchase_amt : data.record.Sales_amt;
        this.items = data.record.Items;
        this.calculateTax(this.items);
      });
  }

  calculateTax(itms: any) {

    itms.forEach(item => {
      const value = item['qty'] * (this.title === 'Sales' ? item['mrp'] / item['pack'] : item['P_rate']);
      if (!this.taxDetails[item.tax_percent]) {
        this.taxDetails[item.tax_percent] = { sales: value, tax_percent: item.tax_percent, tax_value: (value * item.tax_percent) / 100 };
      } else {
        this.taxDetails[item.tax_percent].sales += value;
        this.taxDetails[item.tax_percent].tax_value += (this.taxDetails[item.tax_percent].sales * item.tax_percent) / 100;
      }
    });
    this.taxTypes = Object.keys(this.taxDetails);
  }

  ngOnDestroy() {
    this.utilitsService.hideNavigationBar(false);
  }

  onPrint() {
    window.print();
  }

  onBack() {
    this.router.navigate(['/viewRecord/Purchase']);
  }
}
