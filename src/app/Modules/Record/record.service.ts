import { Injectable } from '@angular/core';
import { PurchaseService } from './../../Services/purchase.service';
import { SalesService } from './../../Services/sales.service';

@Injectable()
export class RecordService {

    constructor(
        private purchaseService: PurchaseService,
        private salesService: SalesService,
    ) { }

    GetPurchaseRecord(recordId: string, forEdit: boolean): any {
        return this.purchaseService.GetPurchaseRecord(recordId, forEdit);
    }

    GetSalesRecord(recordId: string, forEdit: boolean): any {
        return this.salesService.GetSalesRecord(recordId, forEdit);
    }

}