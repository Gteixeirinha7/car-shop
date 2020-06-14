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
        name = "ServletClient", 
        urlPatterns = {"/Client"}
    )
public class ServletClient extends APIHandler {

    public List<String> requiredFields;

    public void initParams() {
        this.requiredFields = new ArrayList<String>();
        requiredFields.add("Name");
        requiredFields.add("Type");
        requiredFields.add("Phone");
        requiredFields.add("Email");
        // requiredFields.add("CPF");
        // requiredFields.add("CNPJ");
        requiredFields.add("Active");
        requiredFields.add("City");
        requiredFields.add("Country");
        requiredFields.add("PostalCode");
        requiredFields.add("State");
        requiredFields.add("Street");
    }

    @Override
    public JSONObject executeDELETE(JSONObject inputData) throws AppException, SQLException {
        initParams();
        return deleteSingleRecord(inputData, "Account");
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
                    "SELECT sfid, Name, externalid__c,  "
                            + " FROM salesforce.Account " + " WHERE externalid__c = '" + sfid
                            + "' AND isdeleted = false");
            if (!rs.next()) {
                throw new AppException("Fail to load Client, Client doesn't exists", "APIClient.executeGET");
            }
            returnInternalData.put("SalesforceId", rs.getString("sfid"));
            returnInternalData.put("Name", rs.getString("Name"));
            returnInternalData.put("ExternalId", rs.getString("externalid__c"));
            returnInternalData.put("Type", rs.getString("Type__c"));
            returnInternalData.put("Phone", rs.getString("Phone"));
            returnInternalData.put("Email", rs.getString("Email__c"));
            returnInternalData.put("Active", rs.getBoolean("Active__c"));
            if(rs.getString("Type__c") == "Pessoa Física"){
                returnInternalData.put("CPF", rs.getString("CPF__c"));
            }else if(rs.getString("Type__c") == "Pessoa Jurídica"){
                returnInternalData.put("CPF", rs.getString("CNPJ"));
            }
            returnInternalData.put("City", rs.getString("BillingCity"));
            returnInternalData.put("Country", rs.getString("BillingCountry"));
            returnInternalData.put("PostalCode", rs.getString("BillingPostalCode"));
            returnInternalData.put("State", rs.getString("BillingState"));
            returnInternalData.put("Street", rs.getString("BillingStreet"));

        } else {
            throw new AppException("Fail to load Client, specify a 'ExternalId'", "APIClient.executeGET");
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

            if (!AppUtils.isEmailValid(this.escape(inputData.get("Email").toString()))) {
                throw new AppException("Email Field Not Valid", "APIClient.executePOST");
            }

            if (AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) == null) {
                throw new AppException("Phone Field Not Valid", "APIClient.executePOST");
            }
            
            if (inputData.get("Type__c").toString() == "Pessoa Física"){
                if(AppUtils.toCPF(this.escape(inputData.get("CPF").toString())) == null) {
                    throw new AppException("CPF Field Not Valid", "APIClient.executePOST");
                }
                if (!inputData.containsKey("CPF")) {
                    throw new AppException("CPF Field Not Specified", "APIClient.executePOST");
                }
                if (inputData.containsKey("CNPJ")) {
                    throw new AppException("CNPJ Field Not Valid, because type is 'Pessoa Física'", "APIClient.executePOST");
                }
            }
            
            if (inputData.get("Type__c").toString() == "Pessoa Jurídica"){
                if(AppUtils.toCNPJ(this.escape(inputData.get("CNPJ").toString())) == null) {
                    throw new AppException("CNPJ Field Not Valid", "APIClient.executePOST");
                }
                if (!inputData.containsKey("CNPJ")) {
                    throw new AppException("CNPJ Field Not Specified", "APIClient.executePOST");
                }
                if (inputData.containsKey("CPF")) {
                    throw new AppException("CPF Field Not Valid, because type is 'Pessoa Jurídica'", "APIClient.executePOST");
                }
            }
            this.executeSQL("UPDATE salesforce.Account " + 
                    " SET  Name = '"+ this.escape(inputData.get("Name").toString()) + "'" +
                    ", Type__c = '"+ this.escape(inputData.get("Type").toString()) + "'" +
                    ", Phone = '"+  AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) + "'" +
                    ", Email__c = '"+ this.escape(inputData.get("Email").toString()) + "'" +
                    ", Active__c = '"+  AppUtils.boolVal(inputData.get("Active__c").toString()) + "'" +
                    ", BillingCity = '"+ this.escape(inputData.get("City").toString()) + "'" +
                    ", BillingCountry = '"+ this.escape(inputData.get("Country").toString()) + "'" +
                    ", BillingPostalCode = '"+ this.escape(inputData.get("PostalCode").toString()) + "'" +
                    ", BillingState = '"+ this.escape(inputData.get("State").toString()) + "'" +
                    ", BillingStreet = '"+ this.escape(inputData.get("Street").toString()) + "'" +
                    (inputData.containsKey("CPF") ? ", CPF__c = "+ this.escape(inputData.get("CPF").toString()) + "" :"") +
                    (inputData.containsKey("CNPJ") ? ", CNPJ__c = '"+ this.escape(inputData.get("CNPJ").toString()) + "'" :"") +
                    " WHERE externalid__c = '" + sfid + "'");

        } else {
            System.out.println("Insert Call");
            AppUtils.checkRequiredFields(inputData, requiredFields);
            sfid = AppUtils.toUUID("Account");

            if (!AppUtils.isEmailValid(this.escape(inputData.get("Email").toString()))) {
                throw new AppException("Email Field Not Valid", "APIClient.executePOST");
            }

            if (AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) == null) {
                throw new AppException("Phone Field Not Valid", "APIClient.executePOST");
            }
            
            if (inputData.get("Type__c").toString() == "Pessoa Física"){
                if(AppUtils.toCPF(this.escape(inputData.get("CPF").toString())) == null) {
                    throw new AppException("CPF Field Not Valid", "APIClient.executePOST");
                }
                if (!inputData.containsKey("CPF")) {
                    throw new AppException("CPF Field Not Specified", "APIClient.executePOST");
                }
                if (inputData.containsKey("CNPJ")) {
                    throw new AppException("CNPJ Field Not Valid, because type is 'Pessoa Física'", "APIClient.executePOST");
                }
            }
            
            if (inputData.get("Type__c").toString() == "Pessoa Jurídica"){
                if(AppUtils.toCNPJ(this.escape(inputData.get("CNPJ").toString())) == null) {
                    throw new AppException("CNPJ Field Not Valid", "APIClient.executePOST");
                }
                if (!inputData.containsKey("CNPJ")) {
                    throw new AppException("CNPJ Field Not Specified", "APIClient.executePOST");
                }
                if (inputData.containsKey("CPF")) {
                    throw new AppException("CPF Field Not Valid, because type is 'Pessoa Jurídica'", "APIClient.executePOST");
                }
            }

            this.executeSQL("INSERT INTO salesforce.Account" +
                    " (externalid__c, Name, Type__c, Phone, Email__c, Active__c, BillingCity, BillingCountry, BillingPostalCode, BillingState, BillingStreet,"+
                    (inputData.containsKey("CPF") ? "CPF__C, ":"")+
                    (inputData.containsKey("CNPJ") ? "CNPJ__c, ":"")+
                    "isdeleted)" + " VALUES ('"
                    + sfid + "','" + 
                    this.escape(inputData.get("Name").toString()) + "','" + 
                    this.escape(inputData.get("Type").toString())+ "','" + 
                    AppUtils.toPhoneNumber(this.escape(inputData.get("Phone").toString())) + "','" + 
                    this.escape(inputData.get("Email").toString()) + "'," + 
                    AppUtils.boolVal(inputData.get("Active__c").toString()) + ",'" + 
                    this.escape(inputData.get("City").toString()) + "','" + 
                    this.escape(inputData.get("Country").toString()) + "','" + 
                    this.escape(inputData.get("PostalCode").toString()) + "','" + 
                    this.escape(inputData.get("State").toString()) + "','" + 
                    this.escape(inputData.get("Street").toString()) + "'," + 
                    (inputData.containsKey("CPF") ? " '"+  AppUtils.toCPF(this.escape(inputData.get("CPF").toString())) + "', " :" ") +
                    (inputData.containsKey("CNPJ") ? " '"+ AppUtils.toCNPJ(this.escape(inputData.get("CNPJ").toString())) + "', " :" ") +
                     
                    " false)");

        }
        returnData.put("ExternalId", sfid);
        returnData.put("statusCode", "200");
        return returnData;
    }
}
