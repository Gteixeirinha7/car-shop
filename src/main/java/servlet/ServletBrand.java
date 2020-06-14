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
        name = "ServletBrand", 
        urlPatterns = {"/Brand"}
    )
public class ServletBrand extends APIHandler {

    public List<String> requiredFields;

    public void initParams() {
        this.requiredFields = new ArrayList<String>();
        requiredFields.add("Name");
    }

    @Override
    public JSONObject executeDELETE(JSONObject inputData) throws AppException, SQLException {
        initParams();
        return deleteSingleRecord(inputData, "Car_Brand__c");
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

            ResultSet rs = this.executeQuery("SELECT sfid, Name, externalid__c " + " FROM salesforce.Car_Brand__c " + 
                    " WHERE externalid__c = '"+ sfid + "' AND isdeleted = false");
            if (!rs.next()) {
                throw new AppException("Fail to load Car Brand, Car Brand doesn't exists", "APICarBrand.executePOST");
            }
            returnInternalData.put("SalesforceId", rs.getString("sfid"));
            returnInternalData.put("Name", rs.getString("Name"));
            returnInternalData.put("ExternalId", rs.getString("externalid__c"));
        } else {
            throw new AppException("Fail to load Model, specify a 'ExternalId'", "APICar.executeGET");
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

            this.executeSQL("UPDATE salesforce.Car_Brand__c " + 
                    " SET Name = '"+ this.escape(inputData.get("Name").toString()) + "'" + 
                    " WHERE externalid__c = '" + sfid + "'");

        } else {
            System.out.println("Insert Call");
            AppUtils.checkRequiredFields(inputData, requiredFields);
            sfid = AppUtils.toUUID("Car_Brand");

            this.executeSQL("INSERT INTO salesforce.Car_Brand__c" + " (externalid__c, Name, isdeleted)"
                    + " VALUES ('" + sfid + "','" + this.escape(inputData.get("Name").toString()) + "', false)");

        }
        returnData.put("ExternalId", sfid);
        returnData.put("statusCode", "200");
        return returnData;
    }
}
