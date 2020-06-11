package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.cliente.APIHandler;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/get-instalador")
public class APIGetInstalador extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {

        String whereClause = null;
        if(inputData.containsKey("id")){
            long id = Long.valueOf(inputData.get("id").toString());
            whereClause = "id = "+id;
        }else if(inputData.containsKey("sfid")){
            String sfid = inputData.get("sfid").toString();
            whereClause = "sfid = '"+this.escape(sfid)+"'";
        }else if(inputData.containsKey("externalid")){
            String externalid = inputData.get("externalid").toString();
            whereClause = "externalid__c = '"+this.escape(externalid)+"'";
        }else{
            throw new AppException(400, "Parâmetros Inválidos");
        }
        ResultSet rs = this.executeQuery(
            "SELECT id, sfid, email__c, cnpj__c, razao_social__c,"+
            " name, descricao_empresa__c, celular__c, telefone__c,"+
            " status__c, imageurl__c, pontuacao_media__c,"+
            " elogio_transparencia_qtd__c, elogio_pontualidade_qtd__c,"+
            " elogio_organizacao_qtd__c, elogio_conhecimento_qtd__c,"+
            " elogio_atendimento_qtd__c"+
            " FROM salesforce.instalefacil_instalador__c " +
            " WHERE " + whereClause +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException(404, "Instalador não encontrado");
        }
        String descricao = rs.getString("descricao_empresa__c");
        Pattern p = Pattern.compile("<p.*>", Pattern.DOTALL);
        Matcher m = p.matcher(descricao);
        if (!m.find()){
            ArrayList<String> lines = AppUtils.explode("(\r?\n)+", descricao);
            descricao = "<p>"+AppUtils.implode("</p><p>", lines)+"</p>";
        }
        JSONObject returnData = new JSONObject();
        returnData.put("email", rs.getString("email__c"));
        returnData.put("cnpj", rs.getString("cnpj__c"));
        returnData.put("razao", rs.getString("razao_social__c"));
        returnData.put("nome", rs.getString("name"));
        returnData.put("descricao", descricao);
        returnData.put("image", rs.getString("imageurl__c"));
        returnData.put("pontuacao", rs.getDouble("pontuacao_media__c"));
        returnData.put("elogioTransparencia", (int) rs.getDouble("elogio_transparencia_qtd__c") );
        returnData.put("elogioPontualidade", (int) rs.getDouble("elogio_pontualidade_qtd__c") );
        returnData.put("elogioOrganizacao", (int) rs.getDouble("elogio_organizacao_qtd__c") );
        returnData.put("elogioConhecimento", (int) rs.getDouble("elogio_conhecimento_qtd__c") );
        returnData.put("elogioAtendimento", (int) rs.getDouble("elogio_atendimento_qtd__c") );
        returnData.put("celular", rs.getString("celular__c"));
        returnData.put("telefone", rs.getString("telefone__c"));
        returnData.put("status", rs.getString("status__c"));
        return returnData;
    }

}
