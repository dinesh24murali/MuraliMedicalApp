<?php


class DataBaseHandler{
    
    private $conn;
	private $config;
    
    function __construct() {
		$str = file_get_contents('./config.json');
        $this->config = json_decode($str, true);
    }


    function GetConnection(){
        $this->conn=mysqli_connect("localhost:3306",$this->config['UserName'],$this->config['Password']) or die("Connection failed");
        
        mysqli_select_db($this->conn,$this->config['DataBase']);

        if(mysqli_error($this->conn)){
            echo mysqli_error($this->conn);
        }
    }
    
    function HasError(){
        if(mysqli_error($this->conn)){
			echo '{"Error":true,"Message":"'.mysqli_error($this->conn).'"}';
			return true;
        }else{
            return false;
        }
    }
    
    function CloseConnection(){
        mysqli_close($this->conn);
    }
    
    function ExecuteQuery($query){
        $this->GetConnection();
        $result = mysqli_query($this->conn,$query);     
        		
		if($this->HasError()){
			$this->CloseConnection();
			return false;
        }else{
			$this->CloseConnection();
			return $result;
		}
    }
    
    function ExecuteInsert($query){
        $this->GetConnection();
        $result = mysqli_query($this->conn,$query);
				
        if($this->HasError()){
			$this->CloseConnection();
			return true;
        }else{
			$this->CloseConnection();
			return false;
		}
    }
    
    function ExecuteMultipleQuery($queries){
        $this->GetConnection();
        $result = mysqli_multi_query($this->conn, $queries);
		if($this->HasError()){
            $this->CloseConnection();
			return true;
        }
        
        $this->CloseConnection();
        return $result;
    }
}

?>

