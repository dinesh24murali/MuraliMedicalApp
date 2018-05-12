export class Purchase {
    Id: string;
    BillNo: string;
    BillDate: string;
    Supplier: any;
    Purchase_amt: number;
    Items: string;
}

export class Sales {
    Id: string;
    BillNo: string;
    BillDate: string;
    Customer: string;
    Items: string;
}

export class PurchaseData {
    Pid: string;
    Pname: string;
    manufacturer: string;
    type: boolean;
    tax_percent: number;
    BatchNo: string;
    Exp_date: string;
    stock: number;
    qty: number;
    mrp: number;
    P_rate: number;
}

export class SalesData {
    Pid: string;
    Pname: string;
    manufacturer: string;
    type: boolean;
    tax_percent: number;
    BatchNo: any[];
    Exp_date: string;
    stock: string;
    qty: number;
    mrp: number;
    P_rate: number;
    Batches: any[];
}

export class Item extends PurchaseData {
    Batches: any[];
}

export class Supplier {
    id: string;
    name: string;
}

export class FilterPurchaseSearchCriteria {
    fromDate: string;
    toDate: string;
    billNo: string;
    supplier: string;
    bufferPageStart: number;
    bufferPageEnd: number;
}
export class FilterSalesSearchCriteria {
    fromDate: string;
    toDate: string;
    billNo: string;
    customer: string;
    bufferPageStart: number;
    bufferPageEnd: number;
}
