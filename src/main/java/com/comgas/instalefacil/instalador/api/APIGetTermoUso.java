package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/get-termo-uso")
public class APIGetTermoUso extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        ResultSet rs = this.executeQuery(
            "SELECT termo_aceite__c" +
            " FROM salesforce.instalefacil_parametros__c " +
            " WHERE type__c = 'Instalador'" +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Missing parameters","APIGetTermoUso.execute");
        }
        String termo = rs.getString("termo_aceite__c");
        Pattern p = Pattern.compile("<p.*>", Pattern.DOTALL);
        Matcher m = p.matcher(termo);
        if (!m.find()){
            ArrayList<String> lines = AppUtils.explode("(\r?\n)+", termo);
            termo = "<p>"+AppUtils.implode("</p><p>", lines)+"</p>";
        }
        JSONObject returnData = new JSONObject();
        returnData.put("termo", termo);
        return returnData;
    }

}
