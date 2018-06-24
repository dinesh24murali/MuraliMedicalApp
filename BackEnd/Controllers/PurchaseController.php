<?php

class PurchaseController{
	
	private $postRequest;
	private $componentsObject;
	private $dbHandler;
	
	function __construct() {
        $this->dbHandler = new DataBaseHandler();
        $this->componentsObject = new ComponentsController();
	}
	
	public function main($method){
		$this->postRequest = (array) json_decode($_POST['data']);
		switch($method){
			case "AddPurchaseRecord":
				$this->AddPurchaseRecord($this->postRequest);
				break;
			case "UpdatePurchaseRecord":
				$this->UpdatePurchaseRecord($this->postRequest);
				break;
			case "GetPurchaseRecords":
				$this->GetPurchaseRecords($this->postRequest);
				break;
			case "GetPurchaseRecordData":
				$this->GetPurchaseRecordData($this->postRequest);
				break;
			case "GetPurchaseRecord":
				$this->GetPurchaseRecord($this->postRequest);
				break;
			case "DeletePurchaseRecord":
				$this->DeletePurchaseRecord($this->postRequest);
				break;
			case "GetCountForFilterRecords":
				$this->GetCountForFilterRecords($this->postRequest,false);
				break;
			case "GetTotalAmtForFilterRecords":
				$this->GetTotalAmtForFilterRecords($this->postRequest);
				break;
			default:
				echo "Exception in PurchaseController: Method not found";
		}		
	}
	
	private function GetPurchaseRecord($data){
		$no_records = 0;
		$recordData = "";
				
		if(isset($data['RecordId']) && $data['RecordId'] != ""){
			$query = "select pur.id,pur.billNo,pur.bill_Date,sup.name from purchase as pur, supplier as sup where pur.id = '".$data['RecordId']."' and pur.supplierId = sup.id;";
			$recordData = $this->dbHandler->ExecuteQuery($query);
			$no_records = mysqli_num_rows($recordData);
		}
		echo '{';
		while ($row = mysqli_fetch_assoc($recordData)) {       
			echo '"Id":"'.$row['id'].'",';
            echo '"BillNo":"'.$row['billNo'].'",';
            echo '"BillDate":"'.$row['bill_Date'].'",';
            echo '"Supplier":"'.$row['name'].'",';
			
			$query = "select sum(s.P_rate * p.qty * s.pack) as Purchase_amt from prod_stock as s,purchase_data as p where p.bill_id = '".$data['RecordId']."' and p.BatchNo = s.batchNo";
			$PurchaseAmt = $this->dbHandler->ExecuteQuery($query);
			$PurchaseAmt = mysqli_fetch_assoc($PurchaseAmt);
			echo '"Purchase_amt":'.$PurchaseAmt['Purchase_amt'].',';
					
			echo '"Items":';
			if($data['forEdit'] == "1")
				$this->componentsObject->GetProductsAndBatches($data);
			else
				$this->GetPurchaseRecordData($data);
		}
		echo '}';
	}
	
	public function GetPurchaseRecords($data){
		$searchCriteria = $data['SearchCriteria'];
		if(isset($data['forSupplier'])){
			$filterQuery = $data['query'];
		}else{
			$noOfRecdsToFetch = $searchCriteria->bufferPageEnd - $searchCriteria->bufferPageStart;
			if($searchCriteria->fromDate == "" && $searchCriteria->toDate == "" && $searchCriteria->billNo == "" && $searchCriteria->supplier == "")
				$filterQuery = "select * from Purchase order by bill_Date asc limit $searchCriteria->bufferPageStart,$noOfRecdsToFetch;";
			else{
				$filterQuery = "select * from Purchase where ";
				if($searchCriteria->fromDate != "")
					$filterQuery .= "bill_Date >= '".$searchCriteria->fromDate."' and ";
				if($searchCriteria->toDate != "")
					$filterQuery .= "bill_Date <= '".$searchCriteria->toDate."' and ";
				if($searchCriteria->billNo != "")
					$filterQuery .= "billNo like '".$searchCriteria->billNo."%' and ";
				if($searchCriteria->supplier != "")
					$filterQuery .= "supplierId in (select id from supplier where name like '".$searchCriteria->supplier."%')";
				$isAndPresent = substr($filterQuery, strlen($filterQuery)-4, 4);
				if($isAndPresent == "and ")
					$filterQuery = substr($filterQuery, 0, -4)."  order by bill_Date asc limit $searchCriteria->bufferPageStart,$noOfRecdsToFetch;";
				else
					$filterQuery = $filterQuery."  order by bill_Date asc limit $searchCriteria->bufferPageStart,$noOfRecdsToFetch;";
				
				//echo $filterQuery;
			}
		}
		$this->_PrintPurchaseRecords($filterQuery);
	}
	
	public function _PrintPurchaseRecords($filterQuery){
		$filteredRecords = $this->dbHandler->ExecuteQuery($filterQuery);
		echo '[';
        $i = 0;
        $no_records = mysqli_num_rows($filteredRecords);
		while ($row = mysqli_fetch_assoc($filteredRecords)) {
            echo '{';
			echo '"Id":"'.$row['id'].'",';
            echo '"BillNo":"'.$row['billNo'].'",';
            echo '"BillDate":"'.$row['bill_Date'].'",';
			$query = "select name from supplier where id ='".$row['supplierId']."'";
			$supplierName = $this->dbHandler->ExecuteQuery($query);
			$supplierName = mysqli_fetch_assoc($supplierName);
            echo '"Supplier":"'.$supplierName['name'].'",';
			
			$query = "select sum(s.P_rate * p.qty * s.pack) as Purchase_amt from prod_stock as s,purchase_data as p where p.bill_id = '".$row['id']."' and p.pid = s.pid and p.BatchNo = s.batchNo;";
			$PurchaseAmt = $this->dbHandler->ExecuteQuery($query);
			$PurchaseAmt = mysqli_fetch_assoc($PurchaseAmt);
			$PurchaseAmt = $PurchaseAmt['Purchase_amt'] == NULL ? 0 : $PurchaseAmt['Purchase_amt'];
			echo '"Purchase_amt":'.$PurchaseAmt.',';
			
			$query = "select s.Pname as Pname from prod_stock as s, purchase_data as p where p.bill_id = '".$row['id']."' and p.pid = s.pid and p.batchNo = s.batchNo limit 1;";
			$items = $this->dbHandler->ExecuteQuery($query);
			$items = mysqli_fetch_assoc($items);
			echo '"Items":"'.$items['Pname'].'..."';
		    $i++;
            echo $i <= $no_records-1 ? '},' : '}';
        }
		echo ']';
	}
	// select pur.bill_id, pur.BatchNo, stk.stock, pur.qty, stk.Pname, stk.P_rate, stk.mrp from purchase_data as pur join prod_stock stk on pur.bill_id in('5ac4ade17a7a21.25904206','5ac323ab22e1c7.22828879') and stk.batchNo = pur.BatchNo
	//select  sum(pur.qty * stk.P_rate) as tot_amt from purchase_data as pur join prod_stock stk on pur.bill_id in(select id from purchase where bill_Date >= '2018-04-01' and bill_Date <= '2018-04-04' order by bill_Date asc) and pur.batchNo = stk.BatchNo and pur.Pid = stk.Pid
	private function AddPurchaseRecord($data){
		$RecordDetail = $data['RecordDetail'];
		$recordId = uniqid("",true);
		$uniqueSupplierId = $RecordDetail->Supplier->id == "" ? uniqid("",true) : $RecordDetail->Supplier->id;
		$query = "Insert into purchase (`id`,`billNo`,`bill_Date`,`supplierId`) values ('$recordId','$RecordDetail->BillNo','".$RecordDetail->BillDate."','".$uniqueSupplierId."')";
		$hasError = $this->dbHandler->ExecuteInsert($query);
		if(!$hasError){
			$hasError = $this->_AddPurchaseData($recordId,$data['Items']);
			if($RecordDetail->Supplier->id == "" && !$hasError){ // if its a new supplier
				$query = "insert into supplier (`id`,`name`) values ('$uniqueSupplierId','".$RecordDetail->Supplier->name."')";
				$hasError = $this->dbHandler->ExecuteInsert($query);
			}
			if(!$hasError)
				echo '{"Error":false,"Message":""}';
		}
	}
	
	private function GetPurchaseRecordData($data){
		$no_records = 0;
		$recordData = "";
		if(isset($data['RecordId']) && $data['RecordId'] != ""){
			$query = "select s.Pid,s.Pname as Pname,s.manufacturer,s.type,s.tax_percent,s.pack,p.BatchNo as batchNo,s.Exp_date,p.qty,s.mrp,s.P_rate from prod_stock as s, purchase_data as p where p.bill_id = '".$data['RecordId']."' and p.pid = s.pid and p.batchNo = s.batchNo;";

			$recordData = $this->dbHandler->ExecuteQuery($query);
			
			$no_records = mysqli_num_rows($recordData);
		}
		echo '[';
        $i=0;
		if($no_records > 0)
		while ($row = mysqli_fetch_assoc($recordData)) {
            echo '{';
			echo '"Pid":"'.$row['Pid'].'",';
			echo '"Pname":"'.$row['Pname'].'",';
            echo '"manufacturer":"'.$row['manufacturer'].'",';
            echo '"type":'.($row['type'] == "1" ? "true" : "false").',';
            echo '"tax_percent":'.$row['tax_percent'].',';
            echo '"pack":'.$row['pack'].',';
            echo '"BatchNo":"'.$row['batchNo'].'",';
			echo '"Exp_date":"'.date('m/Y',strtotime($row['Exp_date'])).'",';
			echo '"qty":'.$row['qty'].',';
			echo '"mrp":'.$row['mrp'].',';
			echo '"P_rate":'.$row['P_rate'].'';
			
		    $i++;
            echo $i <= $no_records-1 ? '},' : '}';
        }
		echo ']';
	}
		
	private function UpdatePurchaseRecord($data){
		$RecordDetail = $data['RecordDetail'];
		$recordId = uniqid("",true);
		if($RecordDetail->Supplier->id == ""){
			$RecordDetail->Supplier->id = uniqid("",true);
			$this->supplierObject->_AddSupplier($RecordDetail->Supplier->id,$RecordDetail->Supplier->name);
		}
		$query = "update purchase set billNo = '$RecordDetail->BillNo',bill_Date = '".$RecordDetail->BillDate."',supplierId = '".$RecordDetail->Supplier->id."' where id='$RecordDetail->Id';";
		$this->dbHandler->ExecuteQuery($query);
		
		// removes the previous records
		$this->_UpdateProductStockAfterDelete($RecordDetail->Id);
		// add the new records
		$this->_AddPurchaseData($RecordDetail->Id,$data['Items']);
	}
	
	private function DeletePurchaseRecord($data){
		$query = "select s.Pid,s.Pname as Pname,p.BatchNo as batchNo from prod_stock as s, purchase_data as p where p.bill_id = '".$data['RecordId']."' and p.pid = s.pid and p.batchNo = s.batchNo and (s.stock - p.qty) < 0;";
		$checkStockException = $this->dbHandler->ExecuteQuery($query);
		$no_records = mysqli_num_rows($checkStockException);
		
		echo "{";
		if($no_records > 0){
			echo '"Error": true,';
			echo '"Message": "Product(s) have Low Stock:';
			while ($row = mysqli_fetch_assoc($checkStockException)) {
				echo $row['Pname']."(".$row['batchNo'].") ,";
			}
			echo '"';
		}else{
			echo '"Error": false';
			
			$this->dbHandler->ExecuteQuery("Delete from Purchase where id = '".$data['RecordId']."'");
			// echo "Delete Record: Delete from Purchase where id = '".$data['RecordId']."' <br> ";
			
			// Remove Product Batch if stock becomes Zero	
			// $query = "select s.Pid as Pid,p.BatchNo as batchNo from prod_stock as s, purchase_data as p where p.bill_id = '".$data['RecordId']."' and p.pid = s.pid and p.batchNo = s.batchNo and (s.stock - p.qty) = 0;";
			// $resultSet = $this->dbHandler->ExecuteQuery($query);
			// $no_records = mysqli_num_rows($resultSet);
			// $queryDeletePurchase_Data = "";
			
			// if($no_records > 0){
				// while ($row = mysqli_fetch_assoc($resultSet)){
					// $queryDeletePurchase_Data .= "Delete from purchase_data where Pid = '".$row['Pid']."' and BatchNo = '".$row['batchNo']."' and bill_id = '".$data['RecordId']."';";
				// }
				// $this->dbHandler->ExecuteMultipleQuery($queryDeletePurchase_Data);
				// echo "<br><br> Delete = 0: <br> ".$queryDeletePurchase_Data;
			// }
			$this->_UpdateProductStockAfterDelete($data['RecordId']);		
		}
		echo "}";
	}
	
	private function _UpdateProductStockAfterDelete($recordId) {
		$query = "select s.Pid as Pid,p.BatchNo as batchNo,s.pack as pack,p.qty as qty from prod_stock as s, purchase_data as p where p.bill_id = '$recordId' and p.pid = s.pid and p.batchNo = s.batchNo;";
		$resultSet = $this->dbHandler->ExecuteQuery($query);
		$no_records = mysqli_num_rows($resultSet);
		$queryUpdateProduct_Stock = "";
		$queryDeletePurchase_Data = "";
		
		if($no_records > 0){
			while ($row = mysqli_fetch_assoc($resultSet)) {
				$queryUpdateProduct_Stock .= "Update prod_stock set stock = stock - ".($row['qty'] * $row['pack'])." where Pid = '".$row['Pid']."' and BatchNo = '".$row['batchNo']."';";
			}
			$queryDeletePurchase_Data .= "Delete from purchase_data where bill_id = '".$recordId."';";
			// I have no idea how this is working but I solved a confusing error by splitting one statement into two here
			$this->dbHandler->ExecuteMultipleQuery($queryUpdateProduct_Stock);
			$this->dbHandler->ExecuteMultipleQuery($queryDeletePurchase_Data);
			// echo "<br><br> Update Stock: <br> ".$queryUpdateProduct_Stock.$queryDeletePurchase_Data;
		}
	}
	
	private function _AddPurchaseData($recordId,$data){
		
		$queryPurchase_Data = "Insert into purchase_data (`bill_id`,`qty`,`batchNo`,`pid`) values ";
		$queryProduct_Stock = "Insert into prod_stock (`Pid`,`Pname`,`manufacturer`,`type`,`tax_percent`,`pack`,`BatchNo`,`stock`,`Exp_date`,`mrp`,`P_rate`) values ";
		$queryUpdates = "";
		$queryUpdateProduct_tax = "";
		$InsertNewProd_StockFlag = false;
		$InsertNewBatchFlag = false;
		$UpdateStockFlag = false;
		if(count($data))
		foreach ($data as $key => $value){
			if($value->Pid == ""){		// Checks if its a new Product
				$Pid = uniqid("P",true);
				$queryProduct_Stock .= "('$Pid','$value->Pname','$value->manufacturer',".($value->type == "1" ? "true" : "false").",'$value->tax_percent',$value->pack,'$value->BatchNo',".($value->qty * $value->pack).",'".strftime("%Y-%d-%m", strtotime("01/".$value->Exp_date))."','".round($value->mrp/$value->pack,2)."','".round($value->P_rate/$value->pack,2)."'),";
				$InsertNewProd_StockFlag = true;
				// Date format that "strtotime" takes in is M/D/Y. But we are supplying D/M/Y. In this case since we are sure that the date will always be 01. we invert format string to "%Y-%d-%m"
				$queryPurchase_Data .= "('$recordId',$value->qty,'$value->BatchNo','$Pid'),";

			}else{		// executed if it is an existing product
				$batches = $value->Batches;
				$flag = true;
				foreach ($batches as $BatchKey => $BatchValue){
					if(!$flag)
						break;
					if($BatchValue->BatchNumber == $value->BatchNo)
						$flag = false;
				}
				if($flag == true){ // will be true if the user has added a new batch
					$queryProduct_Stock .= "('$value->Pid','$value->Pname','$value->manufacturer',".($value->type == "1" ? "true" : "false").",'$value->tax_percent',$value->pack,'$value->BatchNo',".($value->qty * $value->pack).",'".strftime("%Y-%d-%m", strtotime("01/".$value->Exp_date))."','".round($value->mrp/$value->pack,2)."','".round($value->P_rate/$value->pack,2)."'),";
					$queryPurchase_Data .= "('$recordId',".$value->qty.",'".$value->BatchNo."','$value->Pid'),";
					$InsertNewBatchFlag = true;
					// update tax percent
					$queryUpdateProduct_tax .= "update prod_stock set tax_percent = '$value->tax_percent' where Pid = '$value->Pid';";
				}else{
					// update the batch details when 
					$queryUpdates .= "update prod_stock set stock = stock + ".($value->qty * $value->pack).",Exp_date='".strftime("%Y-%d-%m", strtotime("01/".$value->Exp_date))."',mrp = '".round($value->mrp/$value->pack,2)."', P_rate = '".round($value->P_rate/$value->pack,2)."',pack = $value->pack where Pid = '$value->Pid' and batchNo = '$value->BatchNo';";
					$UpdateStockFlag = true;
					$queryPurchase_Data .= "('$recordId',".$value->qty.",'".$value->BatchNo."','$value->Pid'),";
					// update tax precent
					$queryUpdateProduct_tax .= "update prod_stock set tax_percent = '$value->tax_percent' where Pid = '$value->Pid';";
				}
			}
		}
		$queryPurchase_Data = substr($queryPurchase_Data, 0, -1).";";
		
		// echo "<br><br> Insert into purchase_data: ".$queryPurchase_Data;
		$this->dbHandler->ExecuteInsert($queryPurchase_Data);
		if($InsertNewProd_StockFlag || $InsertNewBatchFlag){
			$queryProduct_Stock = substr($queryProduct_Stock, 0, -1).";";
			$this->dbHandler->ExecuteInsert($queryProduct_Stock);
			// echo "<br><br> Insert into prod_stock: ".$queryProduct_Stock;
		}
		if($UpdateStockFlag){
			$this->dbHandler->ExecuteMultipleQuery($queryUpdates);
			// echo "<br><br> ".$queryUpdates;
		}
		// Run the query to update tax percent and batch number_format
		// this will not be executer if all the products in a purchase order are new products
		// if($InsertNewBatchFlag || $UpdateStockFlag){
			// $this->dbHandler->ExecuteMultipleQuery($queryUpdateProduct_tax);
			// echo "<br><br> ".$queryUpdateProduct_tax;
		// }
	}
	
	private function GetCountForFilterRecords($data,$returnQuery){
		$searchCriteria = $data['SearchCriteria'];
		$noOfRecdsToFetch = $searchCriteria->bufferPageEnd - $searchCriteria->bufferPageStart;
		if($searchCriteria->fromDate == "" && $searchCriteria->toDate == "" && $searchCriteria->billNo == "" && $searchCriteria->supplier == "")
			$filterQuery = "select id as count from Purchase order by bill_Date asc";
		else{
			$filterQuery = "select id as count from Purchase where ";
			if($searchCriteria->fromDate != "")
				$filterQuery .= "bill_Date >= '".$searchCriteria->fromDate."' and ";
			if($searchCriteria->toDate != "")
				$filterQuery .= "bill_Date <= '".$searchCriteria->toDate."' and ";
			if($searchCriteria->billNo != "")
				$filterQuery .= "billNo like '".$searchCriteria->billNo."%' and ";
			if($searchCriteria->supplier != "")
				$filterQuery .= "supplierId in (select id from supplier where name like '".$searchCriteria->supplier."%')";
			$isAndPresent = substr($filterQuery, strlen($filterQuery)-4, 4);
			if($isAndPresent == "and ")
				$filterQuery = substr($filterQuery, 0, -4)." order by bill_Date asc";
			else
				$filterQuery = $filterQuery." order by bill_Date asc";
		}

		if($returnQuery)
			return $filterQuery;
		else{
			$result = $this->dbHandler->ExecuteQuery($filterQuery);
			$noOfRecords = mysqli_num_rows($result);
			echo $noOfRecords;
		}
	}
	/**
	* Example Query:
	* select  sum(pur.qty * stk.P_rate) as tot_amt from purchase_data as pur join prod_stock stk on pur.bill_id in(select id from purchase where bill_Date >= '2018-04-01' and bill_Date <= '2018-04-04' order by bill_Date asc) and pur.batchNo = stk.BatchNo and pur.Pid = stk.Pid
	*
	* This function will give the sum of all bill_amount of purchase Orders that are filtered based on the search criteria
	*/
	private function GetTotalAmtForFilterRecords($data){

		$subQuery = $this->GetCountForFilterRecords($data,true);
		$result = $this->dbHandler->ExecuteQuery("select  sum(pur.qty * stk.P_rate * stk.pack) as total_amount from purchase_data as pur join prod_stock stk on pur.bill_id in($subQuery) and pur.batchNo = stk.BatchNo and pur.Pid = stk.Pid;");
		$result = mysqli_fetch_assoc($result);
		echo ' { "total_amount":'.$result['total_amount'].",";
		$forCount = $this->dbHandler->ExecuteQuery($subQuery);
		$noOfRecords = mysqli_num_rows($forCount);
		echo ' "count":'.$noOfRecords.'}';
	}
}
?>