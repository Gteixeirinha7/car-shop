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
import java.util.List;

import org.eclipse.jdt.internal.compiler.ast.ForeachStatement;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet(
        name = "ServletCar", 
        urlPatterns = {"/Car"}
    )
public class ServletCar extends APIHandler {

    public List<String> requiredFields;

    public void initParams(){
        this.requiredFields = new ArrayList<String>(); 
        requiredFields.add("Name");
        requiredFields.add("Color");
        requiredFields.add("Exchange");
        requiredFields.add("Fuel");
        requiredFields.add("Price");
        requiredFields.add("Year");
        requiredFields.add("BrandName");
        requiredFields.add("ModelName");
    }

    @Override
    public JSONObject executeDELETE(JSONObject inputData) throws AppException, SQLException {
        initParams();
        JSONObject returnData = new JSONObject();
        String sfid = null;
        if (inputData.containsKey("ExternalId")) {
            System.out.println("Delete Call");
            sfid = inputData.get("ExternalId").toString();
            ResultSet rs = this.executeQuery("SELECT externalid__c " + 
                    " FROM salesforce.Car__C"
                    + " WHERE externalid__c = '" + sfid + "' AND isdeleted = false");
            if (!rs.next()) {
                throw new AppException("Fail to load Car, Car doesn't exists or is allready Deleted", "APICar.executePOST");
            }
            this.executeSQL("DELETE FROM salesforce.Car__C" + " WHERE externalid__c = '"+ sfid + "'");
            returnData.put("statusCode", "200");
            returnData.put("message", "Success");
            return returnData;
        } else {
            throw new AppException("Fail to load Car, specify a 'ExternalId'", "APICar.executeGET");
        }
    }
    @Override
    public JSONObject executeGET(JSONObject inputData) throws AppException, SQLException {
        initParams();
        JSONObject returnData = new JSONObject();
        JSONObject returnInternalData = new JSONObject();
        String sfid = null;
        if (inputData.containsKey("ExternalId")) {
            System.out.println("Read Call");
            sfid = inputData.get("ExternalId").toString();
            
            ResultSet rs = this.executeQuery("SELECT C.sfid, C.externalid__c, C.Armored__c, C.Color__c, C.Exchange__c, C.Fuel__c, C.Price__c, C.UsedCar__c, C.Year__c, C.Name " +
                    " , B.Name AS BrandName, B.ExternalId__c AS BrandExternal"+ 
                    " , M.Name AS ModelName, M.ExternalId__c AS ModelExternal "+ 
                    " FROM salesforce.Car__C C"+
                    " LEFT JOIN salesforce.Car_Brand__c B ON B.sfid = C.Brand__c"+
                    " LEFT JOIN salesforce.Car_Model__c M ON M.sfid = C.Model__c"+
                    " WHERE C.externalid__c = '" + sfid + "' AND C.isdeleted = false");
            if (!rs.next()) {
                throw new AppException("Fail to load Car, Car doesn't exists", "APICar.executePOST");
            }
            returnInternalData.put("SalesforceId", rs.getString("sfid"));
            returnInternalData.put("ExternalId", rs.getString("externalid__c"));
            returnInternalData.put("Armored", rs.getBoolean("Armored__c"));
            returnInternalData.put("Color", rs.getString("Color__c"));
            returnInternalData.put("Exchange", rs.getString("Exchange__c"));
            returnInternalData.put("Fuel", rs.getString("Fuel__c"));
            returnInternalData.put("Price", rs.getDouble("Price__c"));
            returnInternalData.put("UsedCar", rs.getBoolean("UsedCar__c"));
            returnInternalData.put("Year", rs.getInt("Year__c"));
            returnInternalData.put("Name", rs.getString("Name"));
            try{
                if(rs.findColumn("ModelName") > 0 && rs.getString("ModelName") != null && !rs.getString("ModelName").isEmpty()){
                    JSONObject AdditionalData = new JSONObject();
                    AdditionalData.put("Name", rs.getString("ModelName"));
                    AdditionalData.put("ExternalId", rs.getString("ModelExternal"));
                    returnInternalData.put("ModelData", AdditionalData);
                }
            }catch(SQLException e){

            }
            try {
                if (rs.findColumn("BrandName") > 0 && rs.getString("BrandName") != null && !rs.getString("BrandName").isEmpty()) {
                    JSONObject AdditionalData = new JSONObject();
                    AdditionalData.put("Name", rs.getString("BrandName"));
                    AdditionalData.put("ExternalId", rs.getString("BrandExternal"));
                    returnInternalData.put("BrandData", AdditionalData);
                }
            } catch (SQLException e) {

            }
        }else{
            throw new AppException("Fail to load Car, specify a 'ExternalId'", "APICar.executeGET");
        }
        returnData.put("statusCode", "200");
        returnData.put("objectData", returnInternalData);
        return returnData;
    }
    @Override
    public JSONObject executePOST(JSONObject inputData) throws AppException, SQLException {
        initParams();
        JSONObject returnData = new JSONObject();
        String sfid = null;
        if (inputData.containsKey("ExternalId")) {
            AppUtils.checkRequiredFields(inputData, requiredFields);
            System.out.println("Update Call");
            sfid = inputData.get("ExternalId").toString();

            ResultSet rsBrand = this.getLookupVal(inputData.get("BrandName").toString(), "Car_Brand__C");
            ResultSet rsModel = this.getLookupVal(inputData.get("ModelName").toString(), "Car_Model__C");

            this.executeSQL("UPDATE salesforce.Car__c " +
                    " SET Armored__c = " + AppUtils.boolVal(inputData.get("Armored").toString()) + ", " + 
                    " Name = '" + this.escape(inputData.get("Name").toString()) + "'," + 
                    " Color__c = '" + this.escape(inputData.get("Color").toString()) + "'," + 
                    " Exchange__c = '" + this.escape(inputData.get("Exchange").toString()) + "'," + 
                    " Fuel__c = '" + this.escape(inputData.get("Fuel").toString()) + "'," + 
                    " Price__c = " + Double.valueOf(inputData.get("Price").toString()) + "," + 
                    " UsedCar__c = " + AppUtils.boolVal(inputData.get("UsedCar").toString()) + "," + 
                    " Year__c = " + Integer.valueOf(inputData.get("Year").toString()) + 
                    " Brand__c = '" + rsBrand.getString("sfid") + "'," + 
                    " Model__c = '" + rsModel.getString("sfid") + "'," + 
                     " WHERE externalid__c = '" + sfid + "'");
            returnData.put("ExternalId", sfid);
        
        }else{
            System.out.println("Insert Call");
            AppUtils.checkRequiredFields(inputData, requiredFields);

            String externalId = AppUtils.toUUID("Car");

            ResultSet rsBrand = this.getLookupVal(inputData.get("BrandName").toString(), "Car_Brand__C");
            ResultSet rsModel = this.getLookupVal(inputData.get("ModelName").toString(), "Car_Model__C");

            this.executeSQL("INSERT INTO salesforce.Car__c"
                    + " (externalid__c, Car_Brand__c, Car_Model__c, Armored__c, Name, Color__c, Exchange__c, Fuel__c, Price__c, UsedCar__c, Year__c, isdeleted)" + 
                    " VALUES ('" + externalId + "'," + 
                    AppUtils.boolVal(inputData.get("Armored").toString()) + ",'" + 
                    this.escape(inputData.get("Name").toString()) + "','" + 
                    rsBrand.getString("sfid") + "','" + 
                    rsModel.getString("sfid") + "','" + 
                    this.escape(inputData.get("Color").toString()) + "','" + 
                    this.escape(inputData.get("Exchange").toString()) + "','" + 
                    this.escape(inputData.get("Fuel").toString()) + "'," + 
                    Integer.valueOf(inputData.get("Price").toString()) + "," + 
                    AppUtils.boolVal(inputData.get("UsedCar").toString()) + "," + 
                    Double.valueOf(inputData.get("Year").toString()) + "," + 
                    "false)");
                    
            returnData.put("ExternalId", externalId);
        }
        returnData.put("statusCode", "200");
        return returnData;
    }
}
