package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/refazer-qualificacao")
public class APIRefazerQualificacao extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        long userId = this.getUserId();
        ResultSet rs = this.executeQuery(
            "SELECT sfid, avaliacao__c, status_ativacao__c, status__c" +
            " FROM salesforce.instalefacil_instalador__c " +
            " WHERE id = " + userId +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APISetRefazerQualificacao.execute");
        }

        String sfid = rs.getString("sfid");
        String avaliacao = rs.getString("avaliacao__c");
        String ativacao = rs.getString("status_ativacao__c");
        String status = rs.getString("status__c");

        if (avaliacao.equals("1") && ativacao.equals("2X")){
            avaliacao = "2";
            ativacao = "2A";
            this.executeSQL(
                 "UPDATE salesforce.instalefacil_instalador__c " +
                 " SET avaliacao__c = '"+this.escape(avaliacao)+"'"+
                 ", status_ativacao__c = '"+this.escape(ativacao)+"'"+
                 " WHERE id = "+userId
            );
        }
        JSONObject returnData = new JSONObject();
        returnData.put("avaliacao", avaliacao);
        returnData.put("ativacao",  ativacao);
        returnData.put("status",    status);
        return returnData;
    }

}
