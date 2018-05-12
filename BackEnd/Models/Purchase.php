<?php

class Purchase{
	
	var $billNumber,
    $billDate,
    $supplier_id,
    $sales_0,
    $sales_5, 
    $sales_12,
    $sales_18, 
    $sales_28,
	$id;
	
	public function __construct($array){
		$this->billNumber = isset($array['billNumber']) ? $array['billNumber'] : "";
		$this->billDate = isset($array['billDate']) ? $array['billDate'] : "";
		$this->supplier_id = isset($array['supplier_id']) ? $array['supplier_id'] : "";
		$this->id = isset($array['id']) ? $array['id'] : "";
		$this->sales_0 = isset($array['sales_0']) ? $array['sales_0'] : "";
		$this->sales_5 = isset($array['sales_5']) ? $array['sales_5'] : "";
		$this->sales_12 = isset($array['sales_12']) ? $array['sales_12'] : "";
		$this->sales_18 = isset($array['sales_18']) ? $array['sales_18'] : "";
		$this->sales_28 = isset($array['sales_28']) ? $array['sales_28'] : "";
	}
}
?>