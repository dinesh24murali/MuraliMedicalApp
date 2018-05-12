<?php

include_once "PurchaseController.php";

class SupplierController{
	
	private $dbHandler;
	private $postRequest;
	private $purchaseObject;
	
	function __construct() {
        $this->dbHandler = new DataBaseHandler();
		$this->purchaseObject = new PurchaseController();
	}
	
	public function main($method){
		$this->postRequest = (array) json_decode($_POST['data']);
		switch($method){
			case "GetFilteredSuppliers":
				$this->GetFilteredSuppliers($this->postRequest);
				break;
			case "GetPurchaseForPayment":
				$this->GetPurchaseForPayment($this->postRequest);
				break;
			case "MakePayment":
				$this->MakePayment($this->postRequest);
				break;
			default:
				echo "Exception in SupplierController: Method not found";
		}
	}

	private function GetFilteredSuppliers($data){
		if($data['queryString'] != "null")
			$query = "select id, name from Supplier where name like '".$data['queryString']."%' limit 15;";
		else
			$query = "select id, name from Supplier limit 15";
		
		$suppliers = $this->dbHandler->ExecuteQuery($query);
		echo '[';
        $i=0;
        $no_records = mysqli_num_rows($suppliers);
		if($no_records > 0)
		while($supplier = mysqli_fetch_assoc($suppliers)){
			echo '{';
			echo '"id":"'.$supplier['id'].'",';
			echo '"name":"'.$supplier['name'].'"';
			$i++;
            echo $i <= $no_records-1 ? '},' : '}';
		}
		echo ']';
	}
	
	private function GetPurchaseForPayment($data){
			
		if($data['FromDate'] != "" && $data['ToDate'] != ""){
			$query = "select * from Purchase where bill_Date >= '".$data['FromDate']."' and bill_Date <= '".$data['ToDate']."' and supplierId = '".$data['SupplierId']."' and payed = 0;";
		}else if($data['FromDate'] != "" && $data['ToDate'] == ""){
			$query = "select * from Purchase where bill_Date >= '".$data['FromDate']."' and supplierId = '".$data['SupplierId']."' and payed = 0";
		}else if($data['FromDate'] == "" && $data['ToDate'] != ""){
			$query = "select * from Purchase where bill_Date <= '".$data['ToDate']."' and supplierId = '".$data['SupplierId']."' and payed = 0";
		}else if($data['FromDate'] == "" && $data['ToDate'] == ""){
			$query = "select * from Purchase where supplierId = '".$data['SupplierId']."' and bill_Date <= DATE_ADD(CURDATE(), INTERVAL -1 MONTH) and payed = 0 order by bill_Date desc";
		}
		$data['forSupplier'] = true;
		$data['query'] = $query;
		$this->purchaseObject->GetPurchaseRecords($data);
		$temp = "select id from Purchase where bill_Date >= '".$data['FromDate']."' and bill_Date <= '".$data['ToDate']."' and supplierId = '".$data['SupplierId']."';";
		$queryTotalPayment = "select sum(s.P_rate * p.qty) as Purchase_amt from prod_stock as s,purchase_data as p where p.bill_id in 
		(select id from Purchase where bill_Date >= '".$data['FromDate']."' and bill_Date <= '".$data['ToDate']."' and supplierId = '".$data['SupplierId']." and payed = 0) and p.pid = s.pid and p.BatchNo = s.batchNo;";
		
		//select sum(s.P_rate * p.qty) as Purchase_amt from prod_stock as s,purchase_data as p where p.bill_id in (select id from Purchase where supplierId = '5a151bc8a1ee34.78493510' order by bill_Date desc limit 5) and p.pid = s.pid and p.BatchNo = s.batchNo;
	}
	
	private function MakePayment($data){
		
		$query = "insert into supplierPayment (`id`,`supplierId`,`paidBills`,`invoiceNo`,`invoiceDate`) values 
			(uuid(),'".implode($data['paiedBills'])."','".$data['supplierId']."','".$data['invoiceNo']."','".$data['invoiceDate']."')";
		//$this->dbHandler->ExecuteQuery($query);
		
		$bills = implode("','",$data['paiedBills']);
		$paymentUpdateQuery = "update Purchase set payed = 1 where id in ('$bills')";
		
		//$this->dbHandler->ExecuteMultipleQuery($paymentUpdateQuery);
		echo '{"errorFlag":false,"message":""}';
	}
}

?>