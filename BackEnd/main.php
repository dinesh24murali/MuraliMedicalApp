<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token");

include_once "Shared/DataBaseHandler.php";
include_once "Controllers/ComponentsController.php";
include_once "Controllers/PurchaseController.php";
include_once "Controllers/SupplierController.php";
include_once "Controllers/SalesController.php";

// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
// header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token");

//Constants
define("CONTROLLER", 3);
define("METHOD", 4);

$Components = new ComponentsController();
$Purchase = new PurchaseController();
$Supplier = new SupplierController();
$Sales = new SalesController();

$requestURL = explode('/',$_SERVER['REQUEST_URI']);

switch($requestURL[CONTROLLER]){
	case 'Components':
		$Components->main($requestURL[METHOD]);
		break;
	case 'Purchase':
		$Purchase->main($requestURL[METHOD]);
		break;
	case 'Sales':
		$Sales->main($requestURL[METHOD]);
		break;
	case 'Supplier':
		$Supplier->main($requestURL[METHOD]);
		break;
	default:
		echo "Exception in Main.php: Route invalied ".$requestURL[CONTROLLER];
}

?>