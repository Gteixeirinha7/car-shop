package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.instalador.APIHandler;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/save-orcamento-data")
public class APISaveOrcamentoData extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        if (!inputData.containsKey("id")){
            throw new AppException("Invalid Parameters", "APISaveOrcamento.execute");
        }
        Long id = Long.valueOf(inputData.get("id").toString());

        ResultSet rs = this.executeQuery(
            "SELECT sfid, valor_servico__c, valor_material__c,"+
                  " desconto__c, material_incluso__c, status__c"+
            " FROM salesforce.instalefacil_orcamento__c"+
            " WHERE id = "+id+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load quotation", "APISaveOrcamento.execute");
        }
        String orcamentoSFId = rs.getString("sfid");
        Double valorServico = rs.getDouble("valor_servico__c");
        Double valorMaterial = rs.getDouble("valor_material__c");
        Double desconto = rs.getDouble("desconto__c");
        Boolean materialIncluso = rs.getBoolean("material_incluso__c");
        String status = rs.getString("status__c");
        if (status.compareTo("2A") > 0){
            throw new AppException(602, "Orcamento bloqueado para alteração");                
        }
        if (inputData.containsKey("valorServico")){
            valorServico = AppUtils.round(Double.valueOf(inputData.get("valorServico").toString()),2);
            if (valorServico > 9999999999.99){
                throw new AppException(603, "Valor excedeu limite [valorServico]");
            }
        }
        if (inputData.containsKey("valorMaterial")){
            valorMaterial = AppUtils.round(Double.valueOf(inputData.get("valorMaterial").toString()),2);
            if (valorMaterial > 9999999999.99){
                throw new AppException(603, "Valor excedeu limite [valorMaterial]");
            }
        }
        if (inputData.containsKey("desconto")){
            desconto = AppUtils.round(Double.valueOf(inputData.get("desconto").toString()),2);
            if (desconto > 9999999999.99){
                throw new AppException(603, "Valor excedeu limite [desconto]");
            }
        }
        if (inputData.containsKey("materialIncluso")){
            materialIncluso = Boolean.valueOf(inputData.get("materialIncluso").toString());
        }
        if (status.equals("1A")){
            status = "1B";
        }
        this.executeSQL(
            "UPDATE salesforce.instalefacil_orcamento__c"+
            " SET valor_servico__c = "+valorServico+
            ", valor_material__c = "+valorMaterial+
            ", desconto__c = "+desconto+
            ", material_incluso__c = "+materialIncluso+
            ", status__c = '"+this.escape(status)+"'"+
            " WHERE id = "+id
        );
        this.executeSQL(
            "DELETE FROM salesforce.instalefacil_orcamento_servico__c"+
            " WHERE orcamento__c = '"+orcamentoSFId+"'"
        );
        this.executeSQL(
            "DELETE FROM salesforce.instalefacil_orcamento_material__c"+
            " WHERE orcamento__c = '"+orcamentoSFId+"'"
        );

        if(inputData.containsKey("servicos")){
            JSONArray s = (JSONArray) inputData.get("servicos");
            HashMap<String,Integer> servicoMap = new HashMap<>();
            for(int i=0; i < s.size(); i++){
                JSONObject o = (JSONObject) s.get(i);
                if(o.containsKey("sfid") && o.containsKey("quantidade")){
                    String servicoSFId = this.escape(o.get("sfid").toString());
                    servicoMap.put(servicoSFId,i);
                }
            }
            if (servicoMap.size() > 0){
                rs = this.executeQuery(
                    "SELECT sfid" +
                    " FROM salesforce.instalefacil_servico__c " +
                    " WHERE sfid IN ('"+AppUtils.implode("','",servicoMap.keySet())+"')"+
                    " AND isdeleted = false"
                );
                while(rs.next()){
                    String servicoSFId = this.escape(rs.getString("sfid"));
                    if (servicoMap.containsKey(servicoSFId)){
                        servicoMap.remove(servicoSFId);
                    }
                }
            }
            PreparedStatement insertServicos = this.getInsertStatement(
                "salesforce.instalefacil_orcamento_servico__c",
                "orcamento__c,servico__c,outros_servico__c,"+
                    "preco_unitario__c,quantidade__c,isdeleted=false"
            );
            int n=0;
            for(int i=0; i < s.size(); i++){
                JSONObject o = (JSONObject) s.get(i);
                if(o.containsKey("sfid")
                        && o.containsKey("precoUnitario")
                            && o.containsKey("quantidade"))
                {
                    String servicoSFId = o.get("sfid").toString();
                    if (!servicoMap.containsKey(this.escape(servicoSFId))){
                        String descricao = (o.containsKey("descricao")
                            ? (String) o.get("descricao") : null);
                        Long quantidade = AppUtils.round(Double.valueOf(o.get("quantidade").toString()));
                        Double precoUnitario = AppUtils.round(Double.valueOf(o.get("precoUnitario").toString()),2);
                        if (precoUnitario > 9999999999.99){
                            throw new AppException(603, "Valor excedeu limite [precoUnitario]");
                        }
                        insertServicos.setString(1, orcamentoSFId);
                        insertServicos.setString(2, servicoSFId);
                        insertServicos.setString(3, descricao);
                        insertServicos.setDouble(4, precoUnitario);
                        insertServicos.setLong(5, quantidade);
                        insertServicos.addBatch();
                        n++;
                    }
                }
            }
            if (n>0){
                insertServicos.executeBatch();
            }
        }
        if(!materialIncluso && inputData.containsKey("materiais")){
            JSONArray m = (JSONArray) inputData.get("materiais");
            HashMap<String,Integer> materialMap = new HashMap<>();
            for(int i=0; i < m.size(); i++){
                JSONObject o = (JSONObject) m.get(i);
                if(o.containsKey("sfid") && o.containsKey("quantidade")){
                    String materialSFId = this.escape(o.get("sfid").toString());
                    materialMap.put(materialSFId,i);
                }
            }
            if (materialMap.size() > 0){
                rs = this.executeQuery(
                    "SELECT sfid" +
                    " FROM salesforce.instalefacil_material__c " +
                    " WHERE sfid IN ('"+AppUtils.implode("','",materialMap.keySet())+"')"+
                    " AND isdeleted = false"
                );
                while(rs.next()){
                    String materialSFId = this.escape(rs.getString("sfid"));
                    if (materialMap.containsKey(materialSFId)){
                        materialMap.remove(materialSFId);
                    }
                }
            }
            PreparedStatement insertMateriais = this.getInsertStatement(
                "salesforce.instalefacil_orcamento_material__c",
                "orcamento__c,material__c,outros_material__c,"+
                    "quantidade__c,isdeleted=false"
            );
            int n=0;
            for(int i=0; i < m.size(); i++){
                JSONObject o = (JSONObject) m.get(i);
                if(o.containsKey("sfid") && o.containsKey("quantidade")){
                    String materialSFId = o.get("sfid").toString();
                    if (!materialMap.containsKey(this.escape(materialSFId))){
                        String descricao = (o.containsKey("descricao")
                            ? (String) o.get("descricao") : null);
                        insertMateriais.setString(1, orcamentoSFId);
                        insertMateriais.setString(2, materialSFId);
                        insertMateriais.setString(3, descricao);
                        insertMateriais.setDouble(4, Double.valueOf(o.get("quantidade").toString()));
                        insertMateriais.addBatch();
                        n++;
                    }
                }
            }
            if (n>0){
                insertMateriais.executeBatch();
            }
        }

        rs = this.executeQuery(
            "SELECT sfid, projeto__c, valor_servico__c, valor_material__c,"+
                  " desconto__c, material_incluso__c, status__c"+
            " FROM salesforce.instalefacil_orcamento__c"+
            " WHERE id = "+id+
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load quotation", "APISaveOrcamento.execute");
        }

        valorServico = rs.getDouble("valor_servico__c");
        valorMaterial = rs.getDouble("valor_material__c");
        desconto = rs.getDouble("desconto__c");
        Double valorTotal = valorServico + valorMaterial - desconto;

        JSONObject orcamento = new JSONObject();
        orcamento.put("id", id);
        orcamento.put("valorServico", valorServico);
        orcamento.put("valorMaterial", valorMaterial);
        orcamento.put("desconto", desconto);
        orcamento.put("valorTotal", valorTotal);
        orcamento.put("materialIncluso", rs.getBoolean("material_incluso__c"));
        orcamento.put("status",   rs.getString("status__c"));

        JSONArray servicos = new JSONArray();
        JSONArray materiais = new JSONArray();

        rs = this.executeQuery(
            "SELECT A.servico__c, A.outros_servico__c,"+
                  " A.preco_unitario__c, A.quantidade__c"+
            " FROM salesforce.instalefacil_orcamento_servico__c A"+
            " WHERE A.orcamento__c = '"+orcamentoSFId+"'"+
            " AND A.isdeleted = false"+
            " ORDER BY A.id ASC"
        );
        while(rs.next()){
            JSONObject servico = new JSONObject();
            servico.put("sfid", rs.getString("servico__c"));
            servico.put("descricao", rs.getString("outros_servico__c"));
            servico.put("precoUnitario", rs.getDouble("preco_unitario__c"));
            servico.put("quantidade", rs.getDouble("quantidade__c"));
            servicos.add(servico);
        }
        orcamento.put("servicos", servicos);

        rs = this.executeQuery(
            "SELECT A.material__c, A.outros_material__c, A.quantidade__c"+
            " FROM salesforce.instalefacil_orcamento_material__c A"+
            " WHERE A.orcamento__c = '"+orcamentoSFId+"'"+
            " AND A.isdeleted = false"+
            " ORDER BY A.id ASC"
        );
        while(rs.next()){
            JSONObject material = new JSONObject();
            material.put("sfid", rs.getString("material__c"));
            material.put("descricao", rs.getString("outros_material__c"));
            material.put("quantidade", rs.getDouble("quantidade__c"));
            materiais.add(material);
        }
        orcamento.put("materiais", materiais);

        JSONObject returnData = new JSONObject();
        returnData.put("orcamento", orcamento);
        return returnData;
    }

}
