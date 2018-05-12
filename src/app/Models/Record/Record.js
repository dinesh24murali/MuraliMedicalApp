"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Purchase = (function () {
    function Purchase() {
    }
    return Purchase;
}());
exports.Purchase = Purchase;
var Sales = (function () {
    function Sales() {
    }
    return Sales;
}());
exports.Sales = Sales;
var PurchaseData = (function () {
    function PurchaseData() {
    }
    return PurchaseData;
}());
exports.PurchaseData = PurchaseData;
var SalesData = (function () {
    function SalesData() {
    }
    return SalesData;
}());
exports.SalesData = SalesData;
var Item = (function (_super) {
    __extends(Item, _super);
    function Item() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Item;
}(PurchaseData));
exports.Item = Item;
var Supplier = (function () {
    function Supplier() {
    }
    return Supplier;
}());
exports.Supplier = Supplier;
//# sourceMappingURL=Record.js.map