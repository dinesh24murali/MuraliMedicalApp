import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { Sales, Item, SalesData, PurchaseData, FilterSalesSearchCriteria } from '../Models/Record/Record';
import { GlobalConstants } from '../GlobalConstants/GlobalConstants';

@Injectable()
export class SalesService {

    private headers: Headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    private options: RequestOptions = new RequestOptions({ headers: this.headers });
    
    private host: string = GlobalConstants.host;

    constructor(private http: Http) { }

    AddSalesRecord(sales: Sales, items: SalesData[]): Promise<any> {

        return this.http.post(this.host + "/medical/main.php/Sales/AddSalesRecord", 'data={"RecordDetail":' + encodeURIComponent(JSON.stringify(sales)) + ',"Items":' + encodeURIComponent(JSON.stringify(items)) + '}', this.options).toPromise()
            .then((response: any) => {
                return response._body ? JSON.parse(response._body) : {};
            }).catch(function (response) {
                return { Error: true, type: 'Network Error' };
            });
    }

    GetSalesRecords(searchCriteria: FilterSalesSearchCriteria): Promise<Sales[]> {
        let postRequestData: string = 'data={"SearchCriteria":' + encodeURIComponent(JSON.stringify(searchCriteria)) + '}';
        return this.http.post(this.host + "/medical/main.php/Sales/GetSalesRecords", postRequestData, this.options).toPromise()
            .then(response => response.json() as Sales[])
            .catch(this.handleError);
    }

    GetCountForFilterRecords(searchCriteria: FilterSalesSearchCriteria): Promise<number> {
        let postRequestData: string = 'data={"SearchCriteria":' + encodeURIComponent(JSON.stringify(searchCriteria)) + '}';
        return this.http.post(this.host + "/medical/main.php/Sales/GetCountForFilterRecords", postRequestData, this.options).toPromise()
            .then((response: any) => {
                if (response._body && response._body.trim() != "")
                    return parseInt(response._body.trim());
                else
                    return 0;
            })
            .catch(this.handleError);
    }

    GetTotalAmtForFilterRecords(searchCriteria: FilterSalesSearchCriteria): Promise<any> {
        let postRequestData: string = 'data={"SearchCriteria":' + encodeURIComponent(JSON.stringify(searchCriteria)) + '}';
        return this.http.post(this.host + "/medical/main.php/Sales/GetTotalAmtForFilterRecords", postRequestData, this.options).toPromise()
            .then(response => { return response.json() })
            .catch(this.handleError);
    }

    // In the view the sales records are viewed as same as the purchase records so we use the same model
    GetSalesRecordData(RecordId: string): Promise<PurchaseData[]> {

        return this.http.post(this.host + "/medical/main.php/Sales/GetSalesRecordData", 'data={"RecordId":"' + RecordId + '"}', this.options).toPromise()
            .then(response => response.json() as PurchaseData[])
            .catch(this.handleError);
    }

    GetSalesRecord(RecordId: string, forEdit: boolean): Promise<any> {

        return this.http.post(this.host + "/medical/main.php/Sales/GetSalesRecord", 'data={"RecordId":"' + RecordId + '","forEdit":' + forEdit + '}', this.options).toPromise()
            .then(response => response.json() as any)
            .catch(this.handleError);
    }

    UpdateSalesRecord(sales: Sales, items: Item[]): Promise<any> {

        return this.http.post(this.host + "/medical/main.php/Sales/UpdateSalesRecord", 'data={"RecordDetail":' + encodeURIComponent(JSON.stringify(sales)) + ',"Items":' + encodeURIComponent(JSON.stringify(items))+ '}', this.options).toPromise()
            .then(response => {
                return response;
            }).catch(function (response) {
                return { error: true, type: 'Network Error' };
            });
    }

    DeleteSalesRecord(RecordId: string): Promise<any> {

        return this.http.post(this.host + "/medical/main.php/Sales/DeleteSalesRecord", 'data={"RecordId":"' + RecordId + '"}', this.options).toPromise()
            .then((response: any) => JSON.parse(response._body))
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('error occured', error);
        return Promise.reject(error.message || error);
    }
}