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
//Tema: Car Shop
// Gabriel Teixeira 081170023
// Igor Cruz 081170008
// Joao Marcos 081170036
@WebServlet(
        name = "ServletSalesMan", 
        urlPatterns = {"/SalesMan"}
    )
public class ServletSalesMan extends APIHandler {

    public List<String> requiredFields;

    public void initParams() {
        this.requiredFields = new ArrayList<String>();
        requiredFields.add("Name");
        // requiredFields.add("ExperienceYears");
        requiredFields.add("CNH");
        // requiredFields.add("Experience");
        requiredFields.add("CPF");
        requiredFields.add("Email");
        requiredFields.add("Age");
        // requiredFields.add("Goal");
        requiredFields.add("Phone");
    }

    @Override
    public JSONObject executeDELETE(JSONObject inputData) throws AppException, SQLException {
        initParams();
        return deleteSingleRecord(inputData, "SalesMan__c");
    }

    @Override
    public JSONObject executeGET(JSONObject inputData) throws AppException, SQLException {
        initParams();
        JSONObject returnData = new JSONObject();
        List<JSONObject> returnInternalDataList = new ArrayList<JSONObject>();
            System.out.println("Read Call");

            ResultSet rs = this.executeQuery("SELECT sfid, Name, externalid__c, ExperienceYears__c, CNH__c, Experience__c, CPF__c, Email__c, Age__c, Goal__c, Phone__c " + " FROM salesforce.SalesMan__c "
                    + " WHERE  " +(inputData.containsKey("ExternalId") ? (" externalid__c = '" + inputData.get("ExternalId").toString() +"' AND " ): "") + " isdeleted = false");
        while(rs.next()) {
            JSONObject returnInternalData = new JSONObject();
            returnInternalData.put("SalesforceId", rs.getString("sfid"));
            returnInternalData.put("Name", rs.getString("Name"));
            returnInternalData.put("ExternalId", rs.getString("externalid__c"));
            returnInternalData.put("ExperienceYears", rs.getInt("ExperienceYears__c"));
            returnInternalData.put("CNH", rs.getString("CNH__c"));
            returnInternalData.put("Experience", rs.getString("Experience__c"));
            returnInternalData.put("CPF", AppUtils.toCPF(rs.getString("CPF__c")));
            returnInternalData.put("Email", rs.getString("Email__c"));
            returnInternalData.put("Age", rs.getInt("Age__c"));
            returnInternalData.put("Goal", rs.getDouble("Goal__c"));
            returnInternalData.put("Phone", rs.getString("Phone__c"));
            returnInternalDataList.add(returnInternalData);
        }
        returnData.put("statusCode", "200");
        returnData.put("objectData", returnInternalDataList);
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

            if(!AppUtils.isEmailValid(this.escape(inputData.get("Email").toString()))){
                throw new AppException("Email Field Not Valid", "APISalesMan.executePOST");
            }

            if (AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) == null) {
                throw new AppException("Phone Field Not Valid", "APISalesMan.executePOST");
            }
            if (AppUtils.toCPF(this.escape(inputData.get("CPF").toString())) == null) {
                throw new AppException("CPF Field Not Valid", "APISalesMan.executePOST");
            }

            this.executeSQL("UPDATE salesforce.SalesMan__c " + 
                    " SET Name = '"+ this.escape(inputData.get("Name").toString()) + "'" +
                    ", CNH__c = '"+ this.escape(inputData.get("CNH").toString()) + "'" +
                    ", CPF__c = '"+ AppUtils.toCPF(this.escape(inputData.get("CPF").toString())) + "'" +
                    ", Email__c = '"+ this.escape(inputData.get("Email").toString()) + "'" +
                    ", Age__c = '"+ Integer.valueOf(inputData.get("Age").toString()) + "'" +
                    ", Phone__c = '"+ AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) + "'" +
                    (inputData.containsKey("ExperienceYears") ? ", ExperienceYears__c = "+ Integer.valueOf(inputData.get("ExperienceYears").toString()) + "" :"") +
                    (inputData.containsKey("Experience") ? ", Experience__c = '"+ this.escape(inputData.get("Experience").toString()) + "'" :"") +
                    (inputData.containsKey("Goal") ? ", Goal__c = "+ Double.valueOf(inputData.get("Goal").toString()) + "" :"") +
                     " WHERE externalid__c = '" + sfid + "'");

        } else {
            System.out.println("Insert Call");
            AppUtils.checkRequiredFields(inputData, requiredFields);
            sfid = AppUtils.toUUID("SalesMan");

            if (!AppUtils.isEmailValid(this.escape(inputData.get("Email").toString()))) {
                throw new AppException("Email Field Not Valid", "APISalesMan.executePOST");
            }

            if (AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) == null) {
                throw new AppException("Phone Field Not Valid", "APISalesMan.executePOST");
            }
            if (AppUtils.toCPF(this.escape(inputData.get("CPF").toString())) == null) {
                throw new AppException("CPF Field Not Valid", "APISalesMan.executePOST");
            }

            this.executeSQL("INSERT INTO salesforce.SalesMan__c" +
                    " (externalid__c, Name, CNH__c, CPF__c, Email__c, Age__c, Phone__c,"+
                    (inputData.containsKey("ExperienceYears") ? "ExperienceYears__c, ":"")+
                    (inputData.containsKey("Experience") ? "Experience__c, ":"")+
                    (inputData.containsKey("Goal") ? "Goal__c, ":"")+
                    "isdeleted)" + " VALUES ('"
                    + sfid + "','" + 
                    this.escape(inputData.get("Name").toString()) + "','" + 
                    this.escape(inputData.get("CNH").toString())+ "','" + 
                    AppUtils.toCPF(this.escape(inputData.get("CPF").toString())) + "','" + 
                    this.escape(inputData.get("Email").toString())+ "'," +                     
                    Integer.valueOf(inputData.get("Age").toString()) + ",'" + 
                    AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) + "'," + 
                    (inputData.containsKey("ExperienceYears") ? " "+ Integer.valueOf(inputData.get("ExperienceYears").toString()) + ", " :" ") +
                    (inputData.containsKey("Experience") ? " '"+ this.escape(inputData.get("Experience").toString()) + "', " :" ") +
                    (inputData.containsKey("Goal") ? " "+ Double.valueOf(inputData.get("Goal").toString()) + ", " :" ") +
                     
                    " false)");

        }
        returnData.put("ExternalId", sfid);
        returnData.put("statusCode", "200");
        return returnData;
    }    
}
