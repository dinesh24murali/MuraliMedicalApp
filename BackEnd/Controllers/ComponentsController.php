<?php

class ComponentsController{
	
	private $postRequest;
	private $dbHandler;
	
	function __construct() {
        $this->dbHandler = new DataBaseHandler();
    }
	
	public function main($method){
		$this->postRequest=(array) json_decode($_POST['data']);
		switch($method){
			case "GetFilteredProducts":
				$this->GetProductsAndBatches($this->postRequest);
				break;
			case "GetFilteredBatches":
				$this->GetFilteredBatches($this->postRequest);
				break;
		}		
	}
	
	function GetProductsAndBatches($data){
		if(!isset($data['RecordId'])){
			if($data['recordType'] == "Purchase")
			if($data['queryString'] != "null")
				$query = "SELECT Pname,Pid,manufacturer,type,tax_percent FROM `prod_stock` WHERE Pname like '".$data['queryString']."%' group by Pid";
			else
				$query = "SELECT Pname,Pid,manufacturer,type,tax_percent FROM `prod_stock` group by Pid limit 15";
			else
			if($data['queryString'] != "null")
				$query = "SELECT ps.Pname,ps.Pid,ps.manufacturer,ps.type,ps.tax_percent,ps.pack FROM `prod_stock` as ps where (select sum(stock) from `prod_stock` where Pid = ps.Pid) > 0 and ps.Pname like '".$data['queryString']."%' group by Pid limit 15";
			else
				$query = "SELECT ps.Pname,ps.Pid,ps.manufacturer,ps.type,ps.tax_percent FROM `prod_stock` as ps where (select sum(stock) from `prod_stock` where Pid = ps.Pid) > 0 group by Pid limit 15";
		}else{
			$query = "select s.Pid,s.Pname as Pname,s.manufacturer,s.type,s.tax_percent,s.stock as stock,s.batchNo,p.qty as qty,s.pack as pack from prod_stock as s, purchase_data as p where p.bill_id = '".$data['RecordId']."' and p.pid = s.pid and p.batchNo = s.batchNo;";
		}
		// echo $query;
		$filteredProducts = $this->dbHandler->ExecuteQuery($query);
		echo '[';
        $i=0;
        $no_records = mysqli_num_rows($filteredProducts);
		while ($row = mysqli_fetch_assoc($filteredProducts)) {
            echo '{';
            echo '"Pid":"'.$row['Pid'].'",';
            echo '"Pname":"'.$row['Pname'].'",';
            echo '"manufacturer":"'.$row['manufacturer'].'",';
            echo '"type":'.($row['type'] == "1" ? "true" : "false").',';
            echo '"tax_percent":"'.$row['tax_percent'].'",';
            echo '"BatchNo":"'.(isset($data['RecordId']) ? $row['batchNo'] : "").'",';
            echo '"qty":'.(isset($data['RecordId']) ? $row['qty'] : 0).',';
			if(isset($data['RecordId'])) 	// This is used when fetching batches for Editing Purchase record
				echo '"newBatchFlag":false,';
            echo '"Batches":';
			$this->_getBatchs($row['Pid'],(isset($data['RecordId']) ? $row['batchNo'] : ""),(isset($data['RecordId']) ? $row['qty'] : ""));
            $i++;
            echo $i <= $no_records-1 ? '},' : '}';
        }
		echo ']';
	}
	/**
	*	method used to print batches for a particular product
	*	@param ProductId contains the product for wich we need to fetch the batches for
	*	@param SelectedBatchNo this value will be present if batches are being fetched for updating the purchase record. It will contain the selected batches id
	*   @param SelQty will have the number of tables selected in the specified batch
	*/
	private function _getBatchs($ProductId,$SelectedBatchNo,$SelQty){
		$query = "SELECT BatchNo,Exp_date,mrp,P_rate,stock,pack FROM `prod_stock` WHERE Pid = '$ProductId' order by Exp_date asc;";
		$result = $this->dbHandler->ExecuteQuery($query);
		$Exp_date = "";
		$mrp = 0;
		$pack = 0;
		$P_rate = 0;
		$stock = 0;
		echo '[';
        $i=0;
        $no_records = mysqli_num_rows($result);
		while ($row = mysqli_fetch_assoc($result)) {
            echo '{';
            echo '"BatchNumber":"'.$row['BatchNo'].'",';
			if($SelectedBatchNo != "" && $SelectedBatchNo == $row['BatchNo']){
				$Exp_date = date('m/Y',strtotime($row['Exp_date']));
				$mrp = $row['mrp'];
				$P_rate = $row['P_rate'];
				$stock = $row['stock'];
				$pack = $row['pack'];
				$mrp = $mrp;
				$P_rate = $P_rate;
			}
            echo '"Exp_date":"'.date('m/Y',strtotime($row['Exp_date'])).'",';
            echo '"mrp":'.$row['mrp'].',';
			echo '"stock":'.$row['stock'].',';
			echo '"pack":'.$row['pack'].',';
            echo '"P_rate":'.$row['P_rate'].'';
            $i++;
            echo $i <= $no_records-1 ? '},' : '}';
        }
		echo '],';
		echo '"Exp_date":"'.$Exp_date.'",';
		echo '"mrp":'.$mrp.',';
		echo '"pack":'.$pack.',';
		echo '"P_rate":'.$P_rate.',';
		echo '"stock":'.$stock;
	}
	
	private function GetFilteredBatches($data){
		if($data['queryString'] != "")
			$query = "SELECT BatchNo,Exp_date,mrp,P_rate,stock,pack FROM `prod_stock` WHERE Pid = '".$data['Pid']."' and BatchNo like '".$data['queryString']."%' order by Exp_date asc;";
		else
			$query = "SELECT BatchNo,Exp_date,mrp,P_rate,stock,pack FROM `prod_stock` WHERE Pid = '".$data['Pid']."' and stock > 0 order by Exp_date asc;";
		
		$result = $this->dbHandler->ExecuteQuery($query);
		echo '[';
        $i=0;
        $no_records = mysqli_num_rows($result);
		while ($row = mysqli_fetch_assoc($result)) {
            echo '{';
            echo '"BatchNumber":"'.$row['BatchNo'].'",';
            echo '"Exp_date":"'.date('m/Y',strtotime($row['Exp_date'])).'",';
            echo '"mrp":'.$row['mrp'].',';
			echo '"stock":'.$row['stock'].',';
			echo '"pack":'.$row['pack'].',';
            echo '"P_rate":'.$row['P_rate'].'';
            $i++;
            echo $i <= $no_records-1 ? '},' : '}';
        }
		echo ']';
	}
}

 // [{ name: "Calpal", manufacturer: "merck", type: "Gen", tax_percent: 1, BatchNo: "", Batchs: [{BatchNumber: "210", Exp_date: "2018", qty: 10, mrp: 25, P_rate: 23 }, {BatchNumber: "234", Exp_date: "2018", qty: 10, mrp: 25, P_rate: 23 }]},
 // { name: "Rantac", manufacturer: "merck", type: "Gen", tax_percent: 1, BatchNo: "", Batchs: ["101", "102", "103"], Exp_date: "2017", qty: 10, mrp: 25, P_rate: 23 }];

?>