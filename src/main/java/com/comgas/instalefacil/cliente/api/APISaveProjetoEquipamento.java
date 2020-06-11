package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/save-projeto-equipamentos")
public class APISaveProjetoEquipamento extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APISaveProjetoEquipamento.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());

        ResultSet rs = this.executeQuery(
            "SELECT sfid, status__c"+
            " FROM salesforce.instalefacil_projeto__c"+
            " WHERE id = "+id+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APISaveProjetoEquipamento.execute");
        }
        String sfid = rs.getString("sfid");
        String status = rs.getString("status__c");

        JSONArray equipamentos = new JSONArray();        
        HashSet<String> equipamentoTipos = new HashSet<>();
        HashMap<String,Integer> equipamentoMap = new HashMap<>();
        ArrayList<Double> equipamentoQtdList = new ArrayList<>();
        rs = this.executeQuery(
            "SELECT apiname"+
            " FROM salesforce.instalefacil_picklist_table"+
            " WHERE fieldname = 'Equipamento'"+
            " AND isdeleted = false"
        );
        while(rs.next()){
            equipamentoTipos.add( rs.getString("apiname") );
        }        
        if(inputData.containsKey("equipamentos")){
            JSONArray e = (JSONArray) inputData.get("equipamentos");
            for(int i=0; i < e.size(); i++){
                JSONObject o = (JSONObject) e.get(i);
                if(o.containsKey("tipo") && o.containsKey("quantidade")){
                    String tipo = this.escape(o.get("tipo").toString());
                    if (!equipamentoTipos.contains(tipo)){
                        throw new AppException("Invalid data [tipo]", "APISaveProjetoEquipamento.execute");
                    }
                    Double quantidade = Double.valueOf(o.get("quantidade").toString());
                    equipamentoMap.put(tipo,equipamentoQtdList.size());
                    equipamentoQtdList.add(quantidade);
                }
            }
        }
        if (equipamentoMap.size() > 0){
            PreparedStatement updateEquipamentos = this.prepareStatement(
                "UPDATE salesforce.instalefacil_projeto_equipamento__c"+
                " SET quantidade_informada__c = ?"+
                " WHERE id = ? AND projeto__c = ?"
            );
            rs = this.executeQuery(
                "SELECT id, equipamento__c" +
                " FROM salesforce.instalefacil_projeto_equipamento__c " +
                " WHERE projeto__c = '"+this.escape(sfid)+"'"+
                " AND equipamento__c IN ('"+AppUtils.implode("','",equipamentoMap.keySet())+"')"+
                " AND isdeleted = false"
            );
            int n=0;
            while(rs.next()){
                Long recordId = rs.getLong("id");
                String tipo = this.escape(rs.getString("equipamento__c"));
                if (equipamentoMap.containsKey(tipo)){
                    Double quantidade = equipamentoQtdList.get(equipamentoMap.get(tipo));
                    updateEquipamentos.setDouble(1, quantidade);
                    updateEquipamentos.setLong(2, recordId);
                    updateEquipamentos.setString(3, sfid);
                    updateEquipamentos.addBatch();
                    equipamentoMap.remove(tipo);
                    n++;
                }
            }
            if (n>0){
                updateEquipamentos.executeBatch();
            }
        }
        if (equipamentoMap.size() > 0){
            PreparedStatement insertEquipamentos = this.getInsertStatement(
                "salesforce.instalefacil_projeto_equipamento__c",
                "projeto__c, equipamento__c,quantidade_informada__c,"+
                    "isdeleted=false"
            );
            int n=0;
            for (String tipo : equipamentoMap.keySet()) {
                Double quantidade = equipamentoQtdList.get(equipamentoMap.get(tipo));
                insertEquipamentos.setString(1, sfid);
                insertEquipamentos.setString(2, tipo);
                insertEquipamentos.setDouble(3, quantidade);
                insertEquipamentos.addBatch();
                n++;
            }            
            if (n>0){
                insertEquipamentos.executeBatch();
            }
        }

        rs = this.executeQuery(
            "SELECT A.apiname, A.label, B.quantidade_contratada__c,"+
                    " B.quantidade_informada__c"+
            " FROM salesforce.instalefacil_picklist_table A"+
                    " LEFT JOIN salesforce.instalefacil_projeto_equipamento__c B"+
                    " ON B.projeto__c = '"+this.escape(sfid)+"'"+
                    " AND B.equipamento__c = A.apiname"+
                    " AND B.isdeleted = false"+
            " WHERE A.fieldname = 'Equipamento'"+
            " AND A.isdeleted = false"+
            " ORDER BY A.apiname ASC"
        );
        while(rs.next()){
            JSONObject equipamento = new JSONObject();
            equipamento.put("tipo",      rs.getString("apiname"));
            equipamento.put("descricao", rs.getString("label"));
            equipamento.put("contratado",rs.getDouble("quantidade_contratada__c"));
            equipamento.put("informado", rs.getDouble("quantidade_informada__c"));
            equipamentos.add(equipamento);
        }

        if (status.equals("1A")){
            status = "1B";
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c " +
                " SET status__c = '"+status+"'"+
                " WHERE id = "+id+" AND status__c = '1A'"
            );
        }

        JSONObject returnData = new JSONObject();
        returnData.put("equipamentos", equipamentos);
        returnData.put("status", status);
        return returnData;
    }

}
