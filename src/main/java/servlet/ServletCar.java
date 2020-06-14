package servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import servlet.system.APIHandler;
import servlet.core.AppException;
import servlet.core.AppUtils;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet(
        name = "ServletCar", 
        urlPatterns = {"/Car"}
    )
public class ServletCar extends APIHandler {

    @Override
    public JSONObject executePOST(JSONObject inputData) throws AppException, SQLException {
       String sfid = null;
        if (inputData.containsKey("id")) {
            System.out.println("Update Call");
            sfid = inputData.get("id").toString();
            ResultSet rs = this.executeQuery(
                    "SELECT sfid" + " FROM salesforce.Car__C" + " WHERE sfid = " + sfid + " AND isdeleted = false");
            if (!rs.next()) {
                throw new AppException("Fail to load Car, Car doesn't exists", "APICar.executePOST");
            }
            this.executeSQL("UPDATE salesforce.Car__c " +
                    " SET Armored__c = " + AppUtils.boolVal(inputData.get("Armored").toString()) + ", " + 
                    " Name = '" + this.escape(inputData.get("Name").toString()) + "'," + 
                    " Color__c = '" + this.escape(inputData.get("Color").toString()) + "'," + 
                    " Exchange__c = '" + this.escape(inputData.get("Exchange").toString()) + "'," + 
                    " Fuel__c = '" + this.escape(inputData.get("Fuel").toString()) + "'," + 
                    " Price__c = " + Double.valueOf(inputData.get("Price").toString()) + "," + 
                    " UsedCar__c = " + AppUtils.boolVal(inputData.get("UsedCar").toString()) + "," + 
                    " Year__c = " + Double.valueOf(inputData.get("Year").toString()) + "," + 
                     " WHERE sfid = '" + sfid.toString() + "'");
        
        }else{
            System.out.println("Insert Call");

            String externalId = AppUtils.toUUID("Car");

            this.executeSQL("INSERT INTO salesforce.Car__c"
                    + " (externalid__c, Armored__c, Name, Color__c, Exchange__c, Fuel__c, Price__c, UsedCar__c, Year__c, isdeleted)" + 
                    " VALUES ('" + externalId + "'," + 
                    AppUtils.boolVal(inputData.get("Armored").toString()) + ",'" + 
                    this.escape(inputData.get("Name").toString()) + "','" + 
                    this.escape(inputData.get("Color").toString()) + "','" + 
                    this.escape(inputData.get("Exchange").toString()) + "','" + 
                    this.escape(inputData.get("Fuel").toString()) + "'," + 
                    Integer.valueOf(inputData.get("Price").toString()) + "," + 
                    AppUtils.boolVal(inputData.get("UsedCar").toString()) + "," + 
                    Double.valueOf(inputData.get("Year").toString()) + "," + 
                    "false)");
                    
            ResultSet rs = this.executeQuery(
                    "SELECT sfid FROM salesforce.Car__C WHERE externalid__c = '" + externalId + "' AND isdeleted = false");
                    
            if (!rs.next()) {
                throw new AppException("Fail to load data", "CarAPI.execute");
            }
            sfid = rs.getString("sfid");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("statusCode", "200");
        returnData.put("internalCode", sfid);
        return returnData;
    }
    
}
