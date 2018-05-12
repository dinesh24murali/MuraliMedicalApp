import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { Purchase, Item, PurchaseData } from '../Models/Record/Record';
import { SupplierPayment } from '../Models/Payment/Payment';
import { GlobalConstants } from '../GlobalConstants/GlobalConstants';

@Injectable()
export class SupplierService {

    private host: string = GlobalConstants.host;

    constructor(private http: Http) { }

    GetFilteredSuppliers(searchText: string) {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host + "/medical/main.php/Supplier/GetFilteredSuppliers", 'data={"queryString":"' + searchText + '"}', options)
            .map(response => response.json());
    }

    GetPurchaseForPayment(supplierId: string, fromDate: string, toDate: string): Promise<Purchase[]> {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host + "/medical/main.php/Supplier/GetPurchaseForPayment", 'data={"SupplierId":"' + supplierId + '","FromDate":"' + fromDate + '","ToDate":"' + toDate + '"}', options).toPromise()
            .then(response => response.json() as Purchase[])
            .catch(this.handleError);
    }

    SamplePostExpress(): Promise<string> {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        let options = new RequestOptions({ headers: headers });
        // return this.http.post("http://localhost:4545/samp",'data={"samp":"cap"}', options).toPromise()
        //     .then(response => response.toString());
        return this.http.get("http://localhost:4545/samp/12", options).toPromise()
            .then(response => response.toString());
    }

    MakePayment(supplierPayment: SupplierPayment) {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host + "/medical/main.php/Supplier/MakePayment", "data=" + JSON.stringify(supplierPayment), options).toPromise()
            .then(response => response.json());
    }

    private handleError(error: any): Promise<any> {
        console.error('error occured', error);
        return Promise.reject(error.message || error);
    }
}