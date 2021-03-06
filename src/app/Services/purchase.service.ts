import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { Purchase, Item, PurchaseData, FilterPurchaseSearchCriteria } from '../Models/Record/Record';
import { GlobalConstants } from '../core/GlobalConstants/GlobalConstants';

@Injectable()
export class PurchaseService {

    private headers: Headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    private options: RequestOptions = new RequestOptions({ headers: this.headers });
    private host: string = GlobalConstants.host;
    constructor(private http: Http) { }

    AddPurchaseRecord(purchase: Purchase, items: any[]): Promise<any> {

        return this.http.post(this.host + "/medical/main.php/Purchase/AddPurchaseRecord", 'data={"RecordDetail":' + encodeURIComponent(JSON.stringify(purchase)) + ',"Items":' + encodeURIComponent(JSON.stringify(items)) + '}', this.options).toPromise()
            .then((response: any) => response._body ? JSON.parse(response._body) : response)
            .catch((error) => {
                return { Error: true, Message: error.message };
            });
    }

    UpdatePurchaseRecord(purchase: Purchase, items: Item[]): Promise<any> {

        return this.http.post(this.host + "/medical/main.php/Purchase/UpdatePurchaseRecord", 'data={"RecordDetail":' + encodeURIComponent(JSON.stringify(purchase)) + ',"Items":' + encodeURIComponent(JSON.stringify(items)) + '}', this.options).toPromise()
            .then(response => {
                return response;
            }).catch(function (error) {
                return { Error: true, Message: error.message };
            });
    }

    GetPurchaseRecord(RecordId: string, forEdit: boolean): Observable<any> {
        return this.http.post(this.host + "/medical/main.php/Purchase/GetPurchaseRecord", 'data={"RecordId":"' + RecordId + '","forEdit":' + forEdit + '}', this.options);
    }

    GetPurchaseRecords(searchCriteria: FilterPurchaseSearchCriteria): Promise<Purchase[]> {
        let postRequestData: string = 'data={"SearchCriteria":' + encodeURIComponent(JSON.stringify(searchCriteria)) + '}';
        return this.http.post(this.host + "/medical/main.php/Purchase/GetPurchaseRecords", postRequestData, this.options).toPromise()
            .then(response => response.json() as Purchase[]);
    }

    GetCountForFilterRecords(searchCriteria: FilterPurchaseSearchCriteria): Promise<number> {
        let postRequestData: string = 'data={"SearchCriteria":' + encodeURIComponent(JSON.stringify(searchCriteria)) + '}';
        return this.http.post(this.host + "/medical/main.php/Purchase/GetCountForFilterRecords", postRequestData, this.options).toPromise()
            .then((response: any) => {
                if (response._body && response._body.trim() != "")
                    return parseInt(response._body.trim());
                else
                    return 0;
            });
    }

    GetPurchaseRecordData(RecordId: string): Promise<PurchaseData[]> {

        return this.http.post(this.host + "/medical/main.php/Purchase/GetPurchaseRecordData", 'data={"RecordId":"' + RecordId + '"}', this.options).toPromise()
            .then(response => response.json() as PurchaseData[]);
    }

    DeletePurchaseRecord(RecordId: string): Promise<any> {

        return this.http.post(this.host + "/medical/main.php/Purchase/DeletePurchaseRecord", 'data={"RecordId":"' + RecordId + '"}', this.options).toPromise()
            .then((response: any) => JSON.parse(response._body));
    }

    GetTotalAmtForFilterRecords(searchCriteria: FilterPurchaseSearchCriteria): Promise<any> {
        let postRequestData: string = 'data={"SearchCriteria":' + encodeURIComponent(JSON.stringify(searchCriteria)) + '}';
        return this.http.post(this.host + "/medical/main.php/Purchase/GetTotalAmtForFilterRecords", postRequestData, this.options).toPromise()
            .then(response => { return response.json() });
    }

    AddPurchaseRecordExpress(purchase: Purchase, items: Item[]): Promise<any> {

        return this.http.post("http://localhost:4545/Purchase/AddPurchaseRecord", 'data={"RecordDetail":' + JSON.stringify(purchase) + ',"Items":' + JSON.stringify(items) + '}', this.options).toPromise()
            .then((response: any) => JSON.parse(response._body))
            .catch(function (response) {
                return { Error: true, Message: 'Network Error' };
            });
    }
}