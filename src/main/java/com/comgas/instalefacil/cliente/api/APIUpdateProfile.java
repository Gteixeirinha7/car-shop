package com.comgas.instalefacil.cliente.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import com.comgas.instalefacil.cliente.APIHandler;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import org.json.simple.JSONObject;

@WebServlet("/cliente/api/update-profile")
public class APIUpdateProfile extends APIHandler{

    @Override
    public JSONObject execute(JSONObject inputData) throws AppException, SQLException {
        long userId = this.getUserId();
        ResultSet rs = this.executeQuery(
            "SELECT id, sfid, email__c, name, cpf__c,"+
            " celular__c, telefone__c, receber_notificacao__c,"+
            " status_ativacao__c, status__c" +
            " FROM salesforce.instalefacil_cliente__c " +
            " WHERE id = " + userId +
            " AND isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APIUpdateProfile.execute");
        }

        String sfid = rs.getString("sfid");
        String email = rs.getString("email__c");
        String nome = rs.getString("name");
        String cpf = rs.getString("cpf__c");
        String celular = rs.getString("celular__c");
        String telefone = rs.getString("telefone__c");
        String ativacao = rs.getString("status_ativacao__c");
        String status = rs.getString("status__c");
        boolean aceitaTermo = (ativacao.compareTo("1A") > 0);
        boolean notificacao = rs.getBoolean("receber_notificacao__c");

        if (!aceitaTermo){
            if(inputData.containsKey("aceitaTermo")){
                aceitaTermo = (inputData.get("aceitaTermo").toString().equals("true"));
            }
        }
        if(inputData.containsKey("receberNotificacao")){
            notificacao = (inputData.get("receberNotificacao").toString().equals("true"));
        }
        if(inputData.containsKey("nome")){
            String str = inputData.get("nome").toString();
            if (str != null && str.length() > 0){
                nome = str;
            }
        }
        if(inputData.containsKey("cpf")){
            String str = inputData.get("cpf").toString();
            if (str != null && str.length() > 0){
                str = AppUtils.toCPF(str);
                if (str == null){
                    throw new AppException(571, "CPF inválido");
                }
                cpf = str;
            }
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

        boolean incomplete = false;

        switch(ativacao){
        case "1A":
            if (aceitaTermo){
                ativacao = "1B";
            }
            break;
        case "1B":
            if (nome != null && nome.compareTo(" ") > 0
               && ((celular != null && celular.compareTo(" ") > 0)
                   || (telefone != null && telefone.compareTo(" ") > 0)))
            {
                ativacao = "9X";
                if (status.equals("Inativo")) {
                    status = "Ativo";
                }
            }else{
                incomplete = true;
            }
            break;
        }

        if (nome == null) nome = "";
        if (cpf == null) cpf = "";
        if (celular == null) celular = "";
        if (telefone == null) telefone = "";

        this.executeSQL(
             "UPDATE salesforce.instalefacil_cliente__c " +
             " SET name = '"+this.escape(nome)+"'"+
             ", cpf__c = '"+this.escape(cpf)+"'"+
             ", celular__c = '"+this.escape(celular)+"'"+
             ", telefone__c = '"+this.escape(telefone)+"'"+
             ", receber_notificacao__c = "+notificacao+
             ", status_ativacao__c = '"+this.escape(ativacao)+"'"+
             ", status__c = '"+this.escape(status)+"'"+
             " WHERE id = " + userId
        );

        if (incomplete){
            throw new AppException(500, "Dados incompletos");
        }

        JSONObject returnData = new JSONObject();
        returnData.put("email",      email);
        returnData.put("cpf",        cpf);
        returnData.put("nome",       nome);
        returnData.put("celular",    celular);
        returnData.put("telefone",   telefone);
        returnData.put("notificacao",notificacao);
        returnData.put("ativacao",   ativacao);
        returnData.put("status",     status);
        return returnData;
    }

}
