export class GlobalConstants {
    public static viewRecordsBufferSize = 50; // needs to be multiple of 10
    public static host = "http://localhost:7070";    // this will be use in the services
    // public static host = "https://flight21.000webhostapp.com";
    public static expiryDatePattern = /^([0-9]{2})\/([0-9]{4})$/;
    public static searchProducts = '/medical/main.php/Components/SearchProducts';
}
