package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/solicita-ligacao")
public class APISolicitaLigacao extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")
                    || !inputData.containsKey("semana")
                            || !inputData.containsKey("periodo"))
        {
            throw new AppException("Invalid Parameters", "APISolicitaLigacao.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());
        ResultSet rs = this.executeQuery(
            "SELECT status__c"+
            " FROM salesforce.instalefacil_projeto__c"+
            " WHERE id = "+id+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APISolicitaLigacao.execute");
        }
        String status = rs.getString("status__c");
        if (status.equals("4A")){
            status = "4B";
            String semana = inputData.get("semana").toString();
            String periodo = inputData.get("periodo").toString();
            String comentario = (inputData.containsKey("comentario")
                                    ? inputData.get("comentario").toString() : null);

            HashSet<String> weekdays = new HashSet<>();
            weekdays.add("Segunda");
            weekdays.add("Terça");
            weekdays.add("Quarta");
            weekdays.add("Quinta");
            weekdays.add("Sexta");
            weekdays.add("Sábado");
            ArrayList<String> semanaOptions = AppUtils.explode(";", semana);
            for(int i=0; i < semanaOptions.size(); i++){
                if (!weekdays.contains(semanaOptions.get(i))){
                    throw new AppException("Invalid Parameters [semana]", "APISolicitaLigacao.execute");
                }
            }
            HashSet<String> periods = new HashSet<>();
            periods.add("Manhã");
            periods.add("Tarde");
            ArrayList<String> periodoOptions = AppUtils.explode(";", periodo);
            for(int i=0; i < periodoOptions.size(); i++){
                if (!periods.contains(periodoOptions.get(i))){
                    throw new AppException("Invalid Parameters [periodo]", "APISolicitaLigacao.execute");
                }
            }

            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c "+
                " SET ligacao_agendamento_dia_semana__c = '"+this.escape(semana)+"'"+
                   ", ligacao_agendamento_periodo__c = '"+this.escape(periodo)+"'"+
                   ", ligacao_agendamento_comentario__c = '"+this.escape(comentario)+"'"+
                   ", status__c = '"+status+"'"+
                " WHERE id = "+id+
                " AND status__c = '4A'"
            );
        }
        JSONObject returnData = new JSONObject();
        returnData.put("status", status);
        return returnData;
    }

}
