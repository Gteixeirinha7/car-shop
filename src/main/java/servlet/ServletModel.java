package servlet;

import javax.servlet.annotation.WebServlet;

import servlet.system.APIHandler;
import servlet.core.AppException;
import servlet.core.AppUtils;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.json.simple.JSONObject;

@WebServlet(
        name = "ServletModel", 
        urlPatterns = {"/Model"}
    )
public class ServletModel extends APIHandler {

    public List<String> requiredFields;

    public void initParams() {
        this.requiredFields = new ArrayList<String>();
        requiredFields.add("Name");
        requiredFields.add("BrandName");
    }

    @Override
    public JSONObject executeDELETE(JSONObject inputData) throws AppException, SQLException {
        initParams();
        return deleteSingleRecord(inputData, "Car_Model__c");
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

            ResultSet rs = this.executeQuery(
                    "SELECT M.sfid, M.Name, M.Car_Brand__c, M.externalid__c "    
                            + " , B.Name AS BrandName, B.ExternalId__c AS BrandExternal " + " FROM salesforce.Car_Model__C M"
                            + " LEFT JOIN salesforce.Car_Brand__c B ON B.sfid = M.Car_Brand__c"
                            + " WHERE M.externalid__c = '" + sfid + "' AND M.isdeleted = false");
            if (!rs.next()) {
                throw new AppException("Fail to load Car Model, Car Model doesn't exists", "APICarModel.executeGET");
            }
            returnInternalData.put("SalesforceId", rs.getString("sfid"));
            returnInternalData.put("Name", rs.getString("Name"));
            returnInternalData.put("ExternalId", rs.getString("externalid__c"));
            try {
                if (rs.findColumn("BrandName") > 0 && rs.getString("BrandName") != null
                        && !rs.getString("BrandName").isEmpty()) {
                    JSONObject AdditionalData = new JSONObject();
                    AdditionalData.put("Name", rs.getString("BrandName"));
                    AdditionalData.put("ExternalId", rs.getString("BrandExternal"));
                    returnInternalData.put("BrandData", AdditionalData);
                }
            } catch (SQLException e) {

            }
        } else {
            throw new AppException("Fail to load Model, specify a 'ExternalId'", "APICarModel.executeGET");
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
            System.out.println("Update Call");
            AppUtils.checkRequiredFields(inputData, requiredFields);
            sfid = inputData.get("ExternalId").toString();

            ResultSet rsBrand = this.getLookupVal(inputData.get("BrandName").toString(), "Car_Brand__C");

            this.executeSQL("UPDATE salesforce.Car_Model__c " + 
                    " SET Name = '"+ this.escape(inputData.get("Name").toString()) + "'," + 
                    " Car_Brand__C = '"+ rsBrand.getString("sfid") + "',"
                    + " WHERE externalid__c = '" + sfid + "'");
            returnData.put("ExternalId", sfid);

        } else {
            System.out.println("Insert Call");
            AppUtils.checkRequiredFields(inputData, requiredFields);

            String externalId = AppUtils.toUUID("Car_Model");

            ResultSet rsBrand = this.getLookupVal(inputData.get("BrandName").toString(), "Car_Brand__C");

            this.executeSQL("INSERT INTO salesforce.Car_Model__c"
                    + " (externalid__c, Car_Brand__c, Name, isdeleted)"
                    + " VALUES ('" + externalId + "','" + rsBrand.getString("sfid") + "','" 
                    + this.escape(inputData.get("Name").toString()) + "', false)");

            returnData.put("ExternalId", externalId);
        }
        returnData.put("statusCode", "200");
        return returnData;
    }
}
