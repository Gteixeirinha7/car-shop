package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.instalador.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/update-profile")
public class APIUpdateProfile extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        long userId = this.getUserId();
        ResultSet rs = this.executeQuery(
            "SELECT id, sfid, email__c, cnpj__c, razao_social__c,"+
            " name, descricao_empresa__c, celular__c, telefone__c,"+
            " cep__c, status_ativacao__c, status__c, receber_pedidos__c" +
            " FROM salesforce.instalefacil_instalador__c " +
            " WHERE id = " + userId +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APIUpdateProfile.execute");
        }

        String sfid = rs.getString("sfid");
        String email = rs.getString("email__c");
        String cnpj = rs.getString("cnpj__c");
        String razao = rs.getString("razao_social__c");
        String nome = rs.getString("name");
        String descricao = rs.getString("descricao_empresa__c");
        String celular = rs.getString("celular__c");
        String telefone = rs.getString("telefone__c");
        String cep = rs.getString("cep__c");
        String ativacao = rs.getString("status_ativacao__c");
        String status = rs.getString("status__c");
        Boolean receberPedidos = rs.getBoolean("receber_pedidos__c");
        Boolean aceitaTermo = (ativacao.compareTo("1A") > 0);

        if (!aceitaTermo){
            if(inputData.containsKey("aceitaTermo")){
                aceitaTermo = (inputData.get("aceitaTermo").toString().equals("true"));
            }
        }
        if(inputData.containsKey("receberPedidos")){
            receberPedidos = Boolean.valueOf(inputData.get("receberPedidos").toString());
        }
        if(inputData.containsKey("cnpj")){
            String str = inputData.get("cnpj").toString();
            if (str != null && str.length() > 0){
                str = AppUtils.toCNPJ(str);
                if (str == null){
                    throw new AppException(571, "CNPJ inválido");
                }
                cnpj = str;
                rs = this.executeQuery(
                    "SELECT id" +
                    " FROM salesforce.instalefacil_instalador__c " +
                    " WHERE cnpj__c = '" + this.escape(cnpj)+ "'" +
                    " AND id <> " + userId +
                    " AND isdeleted = false"
                );
                if(rs.next()){
                    throw new AppException(575, "CNPJ duplicado");
                }
            }
        }
        if(inputData.containsKey("razao")){
            String str = inputData.get("razao").toString();
            if (str != null && str.length() > 0){
                razao = str;
            }
        }
        if(inputData.containsKey("nome")){
            String str = inputData.get("nome").toString();
            if (str != null && str.length() > 0){
                nome = str;
            }
        }
        if(inputData.containsKey("descricao")){
            descricao = inputData.get("descricao").toString();
        }
        if(inputData.containsKey("celular")){
            String phone = inputData.get("celular").toString();
            if (phone != null && phone.length() > 0){
                phone = AppUtils.toPhoneNumber(phone);
                if (phone == null){
                    throw new AppException(573, "Celular inválido");
                }
            }
            celular = phone;
        }
        if(inputData.containsKey("telefone")){
            String phone = inputData.get("telefone").toString();
            if (phone != null && phone.length() > 0){
                phone = AppUtils.toPhoneNumber(phone);
                if (phone == null){
                    throw new AppException(572, "Telefone inválido");
                }
            }
            telefone = phone;
        }
        if(inputData.containsKey("cep")){
            String str = inputData.get("cep").toString();
            if (str != null && str.length() > 0){
                str = AppUtils.toCEP(str);
                if (str == null){
                    throw new AppException(574, "CEP inválido");
                }
            }
            cep = str;
        }

        boolean incomplete = false;
        boolean noqualinstal = false;
        //boolean invalidregion = false;

        switch (ativacao) {
        case "1A":
            if (aceitaTermo){
                ativacao = "1B";
            }
            break;
        case "1B":
            if (cnpj != null && cnpj.compareTo(" ") > 0
                    && razao != null && razao.compareTo(" ") > 0
                    && nome != null && nome.compareTo(" ") > 0
                    && cep != null && cep.compareTo(" ") > 0
                    && ((celular != null && celular.compareTo(" ") > 0)
                    || (telefone != null && telefone.compareTo(" ") > 0)))
            {
                rs = this.executeQuery(
                    "SELECT id" +
                    " FROM salesforce.instalefacil_qualinstal__c " +
                    " WHERE cnpj__c = '" + this.escape(cnpj) + "'" +
                            " AND isdeleted = false"
                );
                if(!rs.next()){
                    noqualinstal = true;
                }
                //rs = this.executeQuery(
                //    "SELECT id" +
                //    " FROM salesforce.instalefacil_regiao_cep__c " +
                //    " WHERE cep__c = '" + this.escape(cep) + "'" +
                //    " AND isdeleted = false"
                //);
                //if(!rs.next()){
                //    invalidregion = true;
                //}
                if (!noqualinstal){
                    ativacao = "1C";
                }
            }else{
                incomplete = true;
            }
            break;
        case "1C":
            if (descricao != null && descricao.compareTo(" ") > 0){
                ativacao = "1D";
            }else{
                incomplete = true;
            }
            break;
        }

        if (cnpj == null) cnpj = "";
        if (razao == null) razao = "";
        if (nome == null) nome = "";
        if (descricao == null) descricao = "";
        if (celular == null) celular = "";
        if (telefone == null) telefone = "";
        if (cep == null) cep = "";

        this.executeSQL(
             "UPDATE salesforce.instalefacil_instalador__c " +
             " SET cnpj__c = '"+this.escape(cnpj)+"'"+
             ", razao_social__c = '"+this.escape(razao)+"'"+
             ", name = '"+this.escape(nome)+"'"+
             ", descricao_empresa__c = '"+this.escape(descricao)+"'"+
             ", celular__c = '"+this.escape(celular)+"'"+
             ", telefone__c = '"+this.escape(telefone)+"'"+
             ", cep__c = '"+this.escape(cep)+"'"+
             ", status_ativacao__c = '"+this.escape(ativacao)+"'"+
             ", receber_pedidos__c = "+receberPedidos+
             " WHERE id = " + userId
        );

        if (incomplete){
            throw new AppException(500, "Dados incompletos");
        }else if (noqualinstal){
            throw new AppException(501, "O CNPJ não está cadastrado na lista de empresas certificadas pela Qualinstal");
        }
        //else if (invalidregion){
        //    throw new AppException(502, "Região não atendida");
        //}

        if (nome.length() > 14 && sfid != null && sfid.length() > 14
                && nome.substring(0,15).equals(sfid.substring(0,15)))
        {
            nome = null;
        }

        JSONObject returnData = new JSONObject();
        returnData.put("email",     email);
        returnData.put("cnpj",      cnpj);
        returnData.put("razao",     razao);
        returnData.put("nome",      nome);
        returnData.put("descricao", descricao);
        returnData.put("celular",   celular);
        returnData.put("telefone",  telefone);
        returnData.put("cep",       cep);
        returnData.put("receberPedidos",receberPedidos);
        returnData.put("ativacao",  ativacao);
        returnData.put("status",    status);
        return returnData;
    }

}
