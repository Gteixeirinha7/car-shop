package servlet.core;

public class AppException extends Exception{
    
    private String category;
    private int errorCode;
    
    public AppException(int errorCode, String message) {
            super(message);
        this.errorCode = errorCode;
    }
    
    public AppException(String message, String category) {
  	super(message);
  	this.category = category;
        this.errorCode = 999;
    }

    public String getCategory(){
	return this.category;
    }
    
    public int getErrorCode(){
        return this.errorCode;
    }
    
}
