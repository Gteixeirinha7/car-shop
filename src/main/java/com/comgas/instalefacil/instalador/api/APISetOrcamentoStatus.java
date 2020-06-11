package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/set-orcamento-status")
public class APISetOrcamentoStatus extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id") || !inputData.containsKey("status")){
            throw new AppException("Invalid Parameters", "APISaveOrcamento.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());

        ResultSet rs = this.executeQuery(
            "SELECT status__c"+
            " FROM salesforce.instalefacil_orcamento__c"+
            " WHERE id = "+id+
            " AND instalador__c = '"+this.getUserSFId()+"'"+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load quotation", "APISaveOrcamento.execute");
        }
        String status    = rs.getString("status__c");
        String newStatus = inputData.get("status").toString();
        String motivo    = "";
        String opcaoRejeicao = "";

	if (inputData.containsKey("opcaoRejeicao")){
            opcaoRejeicao = inputData.get("opcaoRejeicao").toString();
            HashSet<String> opcaoRejeicaoList = new HashSet<>();
            rs = this.executeQuery(
                "SELECT apiname"+
                " FROM salesforce.instalefacil_picklist_table"+
                " WHERE fieldname = 'OpcaoRejeicao'"+
                " AND isdeleted = false"
            );
            while(rs.next()){
                opcaoRejeicaoList.add( rs.getString("apiname") );
            }
            if (!opcaoRejeicaoList.contains(opcaoRejeicao)){
                throw new AppException("Invalid data [opcaoRejeicao]", "APISaveOrcamento.execute");
            }
        }

	if (inputData.containsKey("motivo")){
            motivo  = inputData.get("motivo").toString();
        }

        switch (status) {
        case "0A":
            if (!newStatus.equals("1A") && !newStatus.equals("9D")) {
                newStatus = null;
            }   break;
        case "1B":
            if (!newStatus.equals("2A")) {
                newStatus = null;
            }   break;
        default:
            newStatus = null;
        }
        String sql = "UPDATE salesforce.instalefacil_orcamento__c SET ";
        if (newStatus != null){
            status = newStatus;
            sql += "status__c = '"+this.escape(status)+"'";
            if (opcaoRejeicao != null){
                sql += ", opcao_rejeicao__c = '"+this.escape(opcaoRejeicao)+"'";
            }
            if (motivo != null){
                sql += ", motivo_rejeicao__c = '"+this.escape(motivo,255)+"'";
            }
            sql += " WHERE id = "+id;
            this.executeSQL(sql);
        }

        JSONObject returnData = new JSONObject();
        returnData.put("status", status);
        return returnData;
    }

}
