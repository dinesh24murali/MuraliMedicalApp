<?php

class SalesController{
	
	private $postRequest;
	private $dbHandler;
	
	function __construct() {
        $this->dbHandler=new DataBaseHandler();
	}
	
	public function main($method){
		$this->postRequest = (array) json_decode($_POST['data']);
		switch($method){
			case "AddSalesRecord":
				$this->AddSalesRecord($this->postRequest);
				break;
			case "GetSalesRecords":
				$this->GetSalesRecords($this->postRequest);
				break;
			case "GetSalesRecordData":
				$this->GetSalesRecordData($this->postRequest);
				break;
			case "GetSalesRecord":
				$this->GetSalesRecord($this->postRequest);
				break;
			case "UpdateSalesRecord":
				$this->UpdateSalesRecord($this->postRequest);
				break;
			case "DeleteSalesRecord":
				$this->DeleteSalesRecord($this->postRequest);
				break;
			case "GetCountForFilterRecords":
				$this->GetCountForFilterRecords($this->postRequest,false);
				break;
			case "GetTotalAmtForFilterRecords":
				$this->GetTotalAmtForFilterRecords($this->postRequest);
				break;
			default:
				echo "Exception in SalesController: Method not found";
		}
	}
	
	private function AddSalesRecord($data){
		$RecordDetail = $data['RecordDetail'];
		$recordId = uniqid("",true);
		$query = "Insert into sales (`id`,`billNo`,`bill_Date`,`customerId`) values ('$recordId','$RecordDetail->BillNo','".$RecordDetail->BillDate."','$RecordDetail->Customer')";
		$hasError = $this->dbHandler->ExecuteInsert($query);
		// echo "<br> ".$query;
		if(!$hasError){
			echo '{"Error":false}';
			$this->_AddSalesData($recordId,$data['Items']);
		}
	}
	
	private function _AddSalesData($recordId,$addItems){
		$querySales_Data = "Insert into sales_data (`bill_id`,`qty`,`batchNo`,`pid`) values";
		$queryUpdates = "";
		$flag = false;
		
		if(count($addItems) > 0)
		foreach ($addItems as $key => $value){
			foreach ($value->Batches as $batchKey => $batchValue){
				if(isset($batchValue->batchValue) && $batchValue->batchValue > 0){
					$querySales_Data .= "('$recordId',$batchValue->batchQty,'$batchValue->BatchNumber','$value->Pid'),";
					if($batchValue->batchQty <= $batchValue->stock)
						$queryUpdates .= "update prod_stock set stock = stock - $batchValue->batchQty where Pid = '$value->Pid' and batchNo = '$batchValue->BatchNumber';";

					$flag = true;
				}
			}
		}

		if($flag){
			$querySales_Data = substr($querySales_Data, 0, -1).";";
			// $this->dbHandler->ExecuteInsert($querySales_Data);
			echo "<br><br>Add sales data: <br>".$queryUpdates;
			
			if($queryUpdates != ""){
				// $this->dbHandler->ExecuteMultipleQuery($queryUpdates);
				echo "<br><br>Update Query: <br>".$queryUpdates;
			}
		}
	}
	
	private function GetSalesRecords($data){

		$searchCriteria = $data['SearchCriteria'];
		$noOfRecdsToFetch = $searchCriteria->bufferPageEnd - $searchCriteria->bufferPageStart;
		if($searchCriteria->fromDate == "" && $searchCriteria->toDate == "" && $searchCriteria->billNo == "" && $searchCriteria->customer == "")
			$filterQuery = "select * from Sales order by bill_Date asc limit $searchCriteria->bufferPageStart,$noOfRecdsToFetch;";
		else{
			$filterQuery = "select * from Sales where ";
			if($searchCriteria->fromDate != "")
				$filterQuery .= "bill_Date >= '".$searchCriteria->fromDate."' and ";
			if($searchCriteria->toDate != "")
				$filterQuery .= "bill_Date <= '".$searchCriteria->toDate."' and ";
			if($searchCriteria->billNo != "")
				$filterQuery .= "billNo like '".$searchCriteria->billNo."%' and ";
			if($searchCriteria->customer != "")
				$filterQuery .= "customerId like '".$searchCriteria->customer."%'";
			$isAndPresent = substr($filterQuery, strlen($filterQuery)-4, 4);
			if($isAndPresent == "and ")
				$filterQuery = substr($filterQuery, 0, -4)."  order by bill_Date asc limit $searchCriteria->bufferPageStart,$noOfRecdsToFetch;";
			else
				$filterQuery = $filterQuery."  order by bill_Date asc limit $searchCriteria->bufferPageStart,$noOfRecdsToFetch;";
		}
		
		//echo $filterQuery;

		$filteredRecords = $this->dbHandler->ExecuteQuery($filterQuery);
		echo '[';
        $i = 0;
        $no_records = mysqli_num_rows($filteredRecords);
		while ($row = mysqli_fetch_assoc($filteredRecords)) {
            echo '{';
			echo '"Id":"'.$row['id'].'",';
            echo '"BillNo":"'.$row['billNo'].'",';
            echo '"BillDate":"'.$row['bill_Date'].'",';
            echo '"Customer":"'.$row['customerId'].'",';
			
			$query = "select sum(s.mrp * p.qty) as Sales_amt from prod_stock as s,sales_data as p where p.bill_id = '".$row['id']."' and s.Pid = p.Pid and p.BatchNo = s.batchNo;";
			$SalesAmt = $this->dbHandler->ExecuteQuery($query);
			$SalesAmt = mysqli_fetch_assoc($SalesAmt);
			echo '"Sales_amt":'.$SalesAmt['Sales_amt'].',';
			
			$query = "select s.Pname as Pname from prod_stock as s, sales_data as p where p.bill_id = '".$row['id']."' and s.Pid = p.Pid and  p.BatchNo = s.batchNo limit 1;";
			$items = $this->dbHandler->ExecuteQuery($query);
			$items = mysqli_fetch_assoc($items);
			echo '"Items":"'.$items['Pname'].'..."';
		    $i++;
            echo $i <= $no_records-1 ? '},' : '}';
        }
		echo ']';
	}
	
	private function GetSalesRecordData($data){
		$no_records = 0;
		$recordData = "";
		if(isset($data['RecordId']) && $data['RecordId'] != ""){
			$query = "select s.Pid,s.Pname as Pname,s.manufacturer,s.type,s.tax_percent,p.BatchNo as batchNo,s.Exp_date,p.qty,s.mrp,s.P_rate,s.pack as pack from prod_stock as s, sales_data as p where p.bill_id = '".$data['RecordId']."' and p.pid = s.pid and p.batchNo = s.batchNo;";

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
            echo '"BatchNo":"'.$row['batchNo'].'",';
			echo '"Exp_date":"'.date('m/Y',strtotime($row['Exp_date'])).'",';
			echo '"qty":'.$row['qty'].',';
			echo '"mrp":'.$row['mrp'].',';
			echo '"pack":'.$row['pack'].',';
			echo '"P_rate":'.$row['P_rate'].'';
			
		    $i++;
            echo $i <= $no_records-1 ? '},' : '}';
        }
		echo ']';
	}
	
	private function GetSalesRecord($data){
		$no_records = 0;
		$recordData = "";
				
		if(isset($data['RecordId']) && $data['RecordId'] != ""){
			$query = "select id,billNo,bill_Date,customerId from sales where id = '".$data['RecordId']."';";
			$recordData = $this->dbHandler->ExecuteQuery($query);
			$no_records = mysqli_num_rows($recordData);
		}
		echo '{';
		if($no_records > 0)
		while ($row = mysqli_fetch_assoc($recordData)) {  
			echo '"Id":"'.$row['id'].'",';
            echo '"BillNo":"'.$row['billNo'].'",';
            echo '"BillDate":"'.$row['bill_Date'].'",';
            echo '"Customer":"'.$row['customerId'].'",';
			
			$query = "select sum(s.mrp * sd.qty) as Sales_amt from prod_stock as s,sales_data as sd where sd.bill_id = '".$data['RecordId']."' and s.pid = sd.pid and sd.BatchNo = s.batchNo";
			$SalesAmt = $this->dbHandler->ExecuteQuery($query);
			$SalesAmt = mysqli_fetch_assoc($SalesAmt);
			echo '"Sales_amt":'.$SalesAmt['Sales_amt'].',';
			
			echo '"Items":';
			if($data['forEdit'] == "1")
				$this->_GetSalesDataEdit($data['RecordId']);
			else
				$this->GetSalesRecordData($data);
		}
		echo '}';
	}
	
	private function _GetSalesDataEdit($recordId){
		$query = "select distinct(s.Pid) as Pid,s.Pname as Pname,s.manufacturer,s.type,s.tax_percent from prod_stock as s, sales_data as p where p.bill_id = '".$recordId."' and p.pid = s.pid;";
		$uniqueProducts = $this->dbHandler->ExecuteQuery($query);
		$uniqueProdCount = mysqli_num_rows($uniqueProducts);
		$unique_i = 0;
		echo '[';
		$totalValue = 0;
		while($row = mysqli_fetch_assoc($uniqueProducts)){
			$batches = array();
			$batchesQueryString = "";
			echo '{';
			echo '"Pid":"'.$row['Pid'].'",';
			echo '"Pname":"'.$row['Pname'].'",';
			echo '"manufacturer":"'.$row['manufacturer'].'",';
			echo '"type":'.($row['type'] == "1" ? "true" : "false").',';
			echo '"tax_percent":'.$row['tax_percent'].',';
			echo '"Exp_date":"",';
			echo '"mrp":0,';
			echo '"P_rate":0,';
			echo '"toggleVisible":0,';
			echo '"Batches":[';
			
			// Sends all selected batches 
			$query = "select s.batchNo,p.qty,s.Exp_date,s.mrp,s.stock,s.P_rate,s.pack from prod_stock as s, sales_data as p where p.bill_id = '".$recordId."' and p.pid = '".$row['Pid']."' and p.batchNo = s.batchNo;";
			$selBatchesQuery = $this->dbHandler->ExecuteQuery($query);
			$no_batchesSel = mysqli_num_rows($selBatchesQuery);
			$itemValue = 0;
			$i = 0;
			$itemQty = 0;
			$itemStock = 0;
			while($selBatches = mysqli_fetch_assoc($selBatchesQuery)){
				
				$batchValue = floatval($selBatches['qty']) * floatval($selBatches['mrp']);
				$itemValue += $batchValue;
				$itemQty += intval($selBatches['qty']);
				$itemStock += intval($selBatches['stock'])+intval($selBatches['qty']);
				echo '{';
				echo '"BatchNumber":"'.$selBatches['batchNo'].'",';
				echo '"batchQty":'.$selBatches['qty'].',';
				echo '"batchValue":'.$batchValue.',';
				echo '"Exp_date":"'.date('m/Y',strtotime($selBatches['Exp_date'])).'",';
				echo '"mrp":'.($selBatches['mrp'] * $selBatches['pack']).',';
				echo '"pack":'.$selBatches['pack'].',';
				echo '"stock":'.(intval($selBatches['stock'])+intval($selBatches['qty'])).',';
				echo '"P_rate":'.($selBatches['P_rate'] * $selBatches['pack']).',';
				echo '"show":true';
				
				$batches[$i] = $selBatches['batchNo'];
				$i++;
				$batchesQueryString .= "'".$selBatches['batchNo']."'".($i <= $no_batchesSel - 1 ? ',' : '');
				echo $i <= $no_batchesSel-1 ? '},' : '}';
			}
			
			// Sends all unselect batches
			$query = "select batchNo,Exp_date,mrp,stock,P_rate from prod_stock where pid = '".$row['Pid']."' and stock > 0 and batchNo NOT in ($batchesQueryString);";
			//echo "<br> <br> ".$query;
			$notSelBatchesQuery = $this->dbHandler->ExecuteQuery($query);
			$no_batchesNotSel = mysqli_num_rows($notSelBatchesQuery);
			$i = 0;
			if($no_batchesNotSel > 0){
				echo ',';
				while($NotSelBatches = mysqli_fetch_assoc($notSelBatchesQuery)){
					echo '{';
					echo '"BatchNumber":"'.$NotSelBatches['batchNo'].'",';
					echo '"batchQty":0,';
					echo '"batchValue":0,';
					echo '"Exp_date":"'.date('m/Y',strtotime($NotSelBatches['Exp_date'])).'",';
					echo '"mrp":'.$NotSelBatches['mrp'].',';
					echo '"stock":'.$NotSelBatches['stock'].',';
					echo '"P_rate":'.$NotSelBatches['P_rate'].',';
					echo '"show":false';
					
					$i++;
					echo $i <= $no_batchesNotSel-1 ? '},' : '}';
				}
			}
			
			echo "],";
			echo '"BatchNo":[';
			for($j = 0;$j < count($batches);$j++){
				echo '"'.$batches[$j].'"';
				echo $j < count($batches)-1 ? ',' : '';
			}
			echo '],';
			echo '"qty":'.$itemQty.',';
			echo '"stock":'.$itemStock.',';
			echo '"value":'.$itemValue;
			$unique_i++;
			echo $unique_i <= $uniqueProdCount-1 ? '},' : '}';
			
		}
						
		echo ']';
	}
	
	private function UpdateSalesRecord($data){
		$RecordDetail = $data['RecordDetail'];
		$query = "update sales set billNo = '$RecordDetail->BillNo',bill_Date = '".$RecordDetail->BillDate."',customerId = '$RecordDetail->Customer' where id='$RecordDetail->Id';";
		$this->dbHandler->ExecuteQuery($query);
		
		// Delete sales_data and updating the stock
		$this->_DeleteSalesRecordData($RecordDetail->Id);
		// Add the new sales_data
		$this->_AddSalesData($RecordDetail->Id, $data['Items']);
		//echo " <br> Record: ".$query;
		
		// $AddItems = $data['AddItems'];
		// $UpdateItems = $data['UpdateItems'];
		// $RemoveItems = $data['RemoveItems'];
		// $queryUpdateSales_Data = "";
		// $queryUpdateProduct_Stock = "";
		// $queryDeleteSales_Data = "";
		// $queryInsertSales_Data = "Insert into sales_data (`bill_id`,`qty`,`batchNo`,`pid`) values";

		// if(count($AddItems) > 0){
			// foreach($AddItems as $key => $i){
				// $queryInsertSales_Data .= "('$RecordDetail->Id',$i->qty,'$i->BatchNo','$i->Pid'),";
				// $queryUpdateProduct_Stock .= "Update prod_stock set stock = stock - $i->qty where Pid = '".$i->Pid."' and BatchNo = '".$i->BatchNo."';";
			// }
			// $queryInsertSales_Data = substr($queryInsertSales_Data, 0, -1).";";
			// echo "<br> Insert Queries: ".($queryInsertSales_Data.$queryUpdateProduct_Stock);
			// $this->dbHandler->ExecuteMultipleQuery($queryInsertSales_Data.$queryUpdateProduct_Stock);
		// }
		// if(count($UpdateItems) > 0){
			// $queryUpdateProduct_Stock = "";
			// foreach($UpdateItems as $key => $i){
				// $queryUpdateSales_Data .= "Update sales_data set qty = $i->qty where bill_id = '".$RecordDetail->Id."' and Pid = '".$i->Pid."' and batchNo = '".$i->BatchNo."';";
				// $queryUpdateProduct_Stock .= "Update prod_stock set stock = ".($i->stock - $i->qty)." where Pid = '".$i->Pid."' and BatchNo = '".$i->BatchNo."';";
			// }
			// echo "<br> Update Queries: ".($queryUpdateSales_Data.$queryUpdateProduct_Stock);
			// $this->dbHandler->ExecuteMultipleQuery($queryUpdateSales_Data.$queryUpdateProduct_Stock);
		// }
		// if(count($RemoveItems) > 0){
			// $queryUpdateProduct_Stock = "";
			// foreach($RemoveItems as $key => $i){
				// $queryDeleteSales_Data .= "Delete from sales_data where bill_id = '".$RecordDetail->Id."' and Pid = '".$i->Pid."' and batchNo = '".$i->BatchNo."';";
				// $queryUpdateProduct_Stock .= "Update prod_stock set stock = stock + $i->qty where Pid = '".$i->Pid."' and BatchNo = '".$i->BatchNo."';";
			// }
			// echo "<br> Remove Queries: ".($queryDeleteSales_Data.$queryUpdateProduct_Stock);
			// $this->dbHandler->ExecuteMultipleQuery($queryDeleteSales_Data.$queryUpdateProduct_Stock);
		// }
	}
	
	private function DeleteSalesRecord($data){
	
		echo "{";
		echo '"Error": false';
		
		$this->dbHandler->ExecuteQuery("Delete from Sales where id = '".$data['RecordId']."'");
		
		$this->_DeleteSalesRecordData($data['RecordId']);
		// $query = "select s.Pid as Pid,p.BatchNo as batchNo,p.qty as qty from prod_stock as s, sales_data as p where p.bill_id = '".$data['RecordId']."' and p.pid = s.pid and p.batchNo = s.batchNo;";
		// $resultSet = $this->dbHandler->ExecuteQuery($query);
		// $no_records = mysqli_num_rows($resultSet);
		// $queryUpdateProduct_Stock = "";
		// $queryDeleteSales_Data = "";
		
		// if($no_records > 0){
			// while ($row = mysqli_fetch_assoc($resultSet)) {
				// $queryUpdateProduct_Stock .= "Update prod_stock set stock = stock + ".$row['qty']." where Pid = '".$row['Pid']."' and BatchNo = '".$row['batchNo']."';";
				// $queryDeleteSales_Data .= "Delete from sales_data where Pid = '".$row['Pid']."' and BatchNo = '".$row['batchNo']."' and bill_id = '".$data['RecordId']."';";
			// }
			// $this->dbHandler->ExecuteMultipleQuery($queryUpdateProduct_Stock.$queryDeleteSales_Data);
			// echo "<br><br> Update Stock: <br> ".$queryUpdateProduct_Stock.$queryDeleteSales_Data;
		// }			
		
		echo "}";
	}
	
	private function _DeleteSalesRecordData($recordId){
		$query = "select s.Pid as Pid,p.BatchNo as batchNo,p.qty as qty from prod_stock as s, sales_data as p where p.bill_id = '$recordId' and p.pid = s.pid and p.batchNo = s.batchNo;";
		$resultSet = $this->dbHandler->ExecuteQuery($query);
		$no_records = mysqli_num_rows($resultSet);
		$queryUpdateProduct_Stock = "";
		$queryDeleteSales_Data = "";
		
		if($no_records > 0){
			while ($row = mysqli_fetch_assoc($resultSet)) {
				$queryUpdateProduct_Stock .= "Update prod_stock set stock = stock + ".$row['qty']." where Pid = '".$row['Pid']."' and BatchNo = '".$row['batchNo']."';";
				$queryDeleteSales_Data .= "Delete from sales_data where Pid = '".$row['Pid']."' and BatchNo = '".$row['batchNo']."' and bill_id = '$recordId';";
			}
			// $this->dbHandler->ExecuteMultipleQuery($queryUpdateProduct_Stock.$queryDeleteSales_Data);
			echo "<br><br> Update sales Stock: <br> ".$queryUpdateProduct_Stock.$queryDeleteSales_Data;
		}			
	}
	/**
	*  function will return no of records based on search criteria or will return the query needed to search in database based on $returnQuery
	*  @param {$data} array: standard post request data
	*  @param {$returnQuery} boolean: flag that specifies whether needed to print data or return query
	*/
	private function GetCountForFilterRecords($data,$returnQuery){
		$searchCriteria = $data['SearchCriteria'];
		$noOfRecdsToFetch = $searchCriteria->bufferPageEnd - $searchCriteria->bufferPageStart;
		if($searchCriteria->fromDate == "" && $searchCriteria->toDate == "" && $searchCriteria->billNo == "" && $searchCriteria->customer == "")
			$filterQuery = "select id as count from Sales order by bill_Date asc";
		else{
			$filterQuery = "select id as count from Sales where ";
			if($searchCriteria->fromDate != "")
				$filterQuery .= "bill_Date >= '".$searchCriteria->fromDate."' and ";
			if($searchCriteria->toDate != "")
				$filterQuery .= "bill_Date <= '".$searchCriteria->toDate."' and ";
			if($searchCriteria->billNo != "")
				$filterQuery .= "billNo like '".$searchCriteria->billNo."%' and ";
			if($searchCriteria->customer != "")
				$filterQuery .= "customerId like '".$searchCriteria->customer."%'";
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
	* This function will give the sum of all bill_amount of purchase Orders that are filtered based on the search criteria
	*/
	private function GetTotalAmtForFilterRecords($data){

		$subQuery = $this->GetCountForFilterRecords($data,true);
		$result = $this->dbHandler->ExecuteQuery("select  sum(sal.qty * stk.mrp) as total_amount from sales_data as sal join prod_stock stk on sal.bill_id in($subQuery) and sal.batchNo = stk.BatchNo and sal.Pid = stk.Pid;");
		$result = mysqli_fetch_assoc($result);
		echo ' { "total_amount":'.$result['total_amount'].",";
		$forCount = $this->dbHandler->ExecuteQuery($subQuery);
		$noOfRecords = mysqli_num_rows($forCount);
		echo ' "count":'.$noOfRecords.'}';
	}
}
// select distinct(s.Pid),s.Pname as Pname,s.manufacturer,s.type,s.tax_percent as tax_percent from prod_stock as s, sales_data as p where p.bill_id = '59f2ec4c2a4835.38291024' and p.pid = s.pid	
// select s.batchNo,p.qty,s.Exp_date,s.mrp,s.stock,s.P_rate from prod_stock as s, sales_data as p where p.bill_id = '59f2ec4c2a4835.38291024' and p.pid = 'P59d63b29125233.10662052' and p.batchNo = s.batchNo
// select batchNo,Exp_date,mrp,stock,P_rate from prod_stock where pid = 'P59d63b29125233.10662052' and batchNo NOT in ('45DFT')
?>

