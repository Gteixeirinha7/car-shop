package com.comgas.instalefacil.cliente;

import com.comgas.instalefacil.core.AppConnection;
import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppUtils;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class AccessControl {

    private AppConnection conn = null;
    private Long sessionId = null;
    private String accessToken = null;
    private Long clientId = null;
    private String refreshToken = null;
    private Long userId = null;
    private String userSFId = null;
    private boolean isActive = false;

    public AccessControl(AppConnection conn){
        this.conn = conn;
    }

    private boolean isPasswordValid(String password) {
        return (
            password.length() > 9
            && password.matches(".*[A-Z].*")
            && password.matches(".*[a-z].*")
            && password.matches(".*[0-9].*")
            && password.matches(".*[^A-Za-z0-9].*")
        );
    }

    public JSONObject login(String email, String password) throws AppException {
        if(!AppUtils.isEmailValid(email)){
            throw new AppException(402, "Email Inválido");
        }
        //if(!this.isPasswordValid(password)){
        //    throw new AppException(403, "Senha Inválida");
        //}
        String status = null;
        String ativacao = null;
        try{
            ResultSet rs = this.conn.executeQuery(
                "SELECT id, sfid, email__c, senha__c,"+
                      " status_ativacao__c, status__c" +
                " FROM salesforce.instalefacil_cliente__c " +
                " WHERE email__c = '" + this.conn.escape(email) + "'" +
                " AND isdeleted = false"
            );
            if(rs.next()){
                String encodedPassword = AppUtils.md5(email+password);
                if(encodedPassword.equals(rs.getString("senha__c"))){
                    this.userId = rs.getLong("id");
                    this.userSFId = rs.getString("sfid");
                    status = rs.getString("status__c");
                    ativacao = rs.getString("status_ativacao__c");
                }else{
                    throw new AppException(404, "Email ou Senha inválidos");
                }
            }else{
                throw new AppException(404, "Email ou Senha inválidos");
            }
        }catch (SQLException e){
            throw new AppException(e.getMessage(), "AccessControl.signIn");
        }
        this.createLogin();
        this.createSession();
        JSONObject returnData = new JSONObject();
        returnData.put("error", 0);
        returnData.put("message", "");
        returnData.put("clientId", this.clientId);
        returnData.put("refreshToken", this.refreshToken);
        returnData.put("sessionId", this.sessionId);
        returnData.put("accessToken", this.accessToken);
        returnData.put("ativacao", ativacao);
        returnData.put("status", status);
        return returnData;
    }

    private void createLogin() throws AppException {
        this.clientId = this.conn.getNextId("salesforce.instalefacil_cliente_login_id_seq");
        this.refreshToken = AppUtils.md5(this.userSFId+this.clientId+this.userId+AppUtils.time());
        Long lastUseStamp = AppUtils.time();
        this.conn.executeSQL(
            "INSERT INTO salesforce.instalefacil_cliente_login" +
            " (id, token, userid, lastusestamp, createddate, status)" +
            " VALUES ("+ this.clientId +
                    ",'"+ this.refreshToken +
                    "',"+ this.userId +
                    ","+ lastUseStamp +
                    ",now()" +
                    ",'A')"
        );
        this.conn.executeSQL(
             "UPDATE salesforce.instalefacil_cliente__c " +
             " SET ultimo_login__c = now()"+
             " WHERE id = " + this.userId
        );
    }

    public JSONObject refreshLogin(String clientId, String refreshToken) throws AppException {
        this.clientId = Long.parseLong(clientId);
        this.refreshToken = refreshToken.replaceAll("[^0-9a-f]", "");
        if(this.refreshToken.length() != 32 || this.clientId <= 0L){
            throw new AppException(591, "Token Inválido");
        }
        String status = null;
        String ativacao = null;
        try{
            ResultSet rs = this.conn.executeQuery(
                "SELECT A.token, A.userid, A.lastusestamp,"+
                      " A.status, B.sfid, C.tempo_sessao__c,"+
                      " B.status_ativacao__c, B.status__c" +
                " FROM salesforce.instalefacil_cliente_login A"+
                    ", salesforce.instalefacil_cliente__c B"+
                        " LEFT JOIN salesforce.instalefacil_parametros__c C"+
                            " ON C.name = 'Parâmetros Cliente'"+
                " WHERE A.id = "+this.clientId+
                " AND B.id = A.userid"+
                " AND B.isdeleted = false"
            );
            if(rs.next()){
                if(this.refreshToken.equals(rs.getString("token"))){
                    String sTimeout = rs.getString("tempo_sessao__c");
                    Long refreshTimeout;
                    if (sTimeout != null && sTimeout.compareTo(" ") > 0){
                        refreshTimeout = Long.parseLong(sTimeout);
                    }else{
                        refreshTimeout = Long.parseLong(System.getenv("REFRESH_TIMEOUT"));
                    }
                    Long lastUseStamp = AppUtils.time();
                    if(!rs.getString("status").equals("A")
                        || lastUseStamp - refreshTimeout > rs.getLong("lastusestamp")){
                        throw new AppException(592, "Login expirado");
                    }
                    this.userId = rs.getLong("userid");
                    this.userSFId = rs.getString("sfid");
                    status = rs.getString("status__c");
                    ativacao = rs.getString("status_ativacao__c");
                    this.conn.executeSQL(
                        "UPDATE salesforce.instalefacil_cliente_login " +
                        " SET lastusestamp = " + lastUseStamp +
                        " WHERE id = " + this.clientId
                    );
                    this.conn.executeSQL(
                        "UPDATE salesforce.instalefacil_cliente__c " +
                        " SET ultimo_login__c = now()"+
                        " WHERE id = " + this.userId
                    );
                }else{
                    throw new AppException(591, "Login Inválido");
                }
            }else{
                throw new AppException(591, "Login Inválido");
            }
        }catch (SQLException e) {
            throw new AppException(e.getMessage(), "AccessControl.refreshLogin");
        }
        this.createSession();
        JSONObject returnData = new JSONObject();
        returnData.put("error", 0);
        returnData.put("message", "");
        returnData.put("clientId", this.clientId);
        returnData.put("refreshToken", this.refreshToken);
        returnData.put("sessionId", this.sessionId);
        returnData.put("accessToken", this.accessToken);
        returnData.put("ativacao", ativacao);
        returnData.put("status", status);
        return returnData;
    }

    private void createSession() throws AppException {
        this.sessionId = this.conn.getNextId("salesforce.instalefacil_cliente_session_id_seq");
        this.accessToken = AppUtils.md5(this.userSFId+this.sessionId+this.userId+AppUtils.time());
        Long lastUseStamp = AppUtils.time();
        this.conn.executeSQL(
            "INSERT INTO salesforce.instalefacil_cliente_session" +
            " (id, token, userid, lastusestamp, createddate, status)" +
            " VALUES ("+ this.sessionId +
                    ",'"+ this.accessToken +
                    "',"+ this.userId +
                    ","+ lastUseStamp +
                    ",now()" +
                    ",'A')"
        );
        this.isActive = true;
    }

    public void refreshSession(String sessionId, String accessToken) throws AppException {
        this.sessionId = Long.parseLong(sessionId);
        this.accessToken = accessToken.replaceAll("[^0-9a-f]", "");
        if(this.accessToken.length() != 32 || this.sessionId <= 0L){
            throw new AppException(591, "Sessão Inválida");
        }
        try{
            ResultSet rs = this.conn.executeQuery(
                "SELECT A.token, A.userid, A.lastusestamp, A.status, B.sfid " +
                " FROM salesforce.instalefacil_cliente_session A" +
                ", salesforce.instalefacil_cliente__c B"+
                " WHERE A.id = " + this.sessionId +
                " AND B.id = A.userid"+
                " AND B.isdeleted = false"
            );
            if(rs.next()){
                if(this.accessToken.equals(rs.getString("token"))){
                    Long sessionTimeout = Long.parseLong(System.getenv("SESSION_TIMEOUT"));
                    Long lastUseStamp = AppUtils.time();
                    if(!rs.getString("status").equals("A")
                    || lastUseStamp - sessionTimeout > rs.getLong("lastusestamp")){
                        throw new AppException(592, "Sessão Encerrada");
                    }
                    this.userId = rs.getLong("userid");
                    this.userSFId = rs.getString("sfid");
                    this.isActive = true;
                    this.conn.executeSQL(
                        "UPDATE salesforce.instalefacil_cliente_session " +
                        " SET lastusestamp = " + lastUseStamp +
                        " WHERE id = " + this.sessionId
                    );
                    return;
                }
            }
            throw new AppException(591, "Sessão Inválida");
        }catch (SQLException e) {
            throw new AppException(e.getMessage(), "AccessControl.refresh");
        }
    }

    public JSONObject logout(String sessionId, String accessToken) throws AppException {
        this.sessionId = Long.parseLong(sessionId);
        this.accessToken = accessToken.replaceAll("[^0-9a-f]", "");
        if(this.accessToken.length() == 32 && this.sessionId > 0L){
            try{
                ResultSet rs = this.conn.executeQuery(
                    "SELECT token, userid, lastusestamp, status " +
                    " FROM salesforce.instalefacil_cliente_session " +
                    " WHERE id = " + this.sessionId
                );
                if(rs.next()){
                    if(this.accessToken.equals(rs.getString("token"))){
                        this.conn.executeSQL(
                            "UPDATE salesforce.instalefacil_cliente_session " +
                            " SET status = 'X'"+
                            " WHERE userid = " + rs.getLong("userid")+
                            " AND status = 'A'"
                        );
                        this.conn.executeSQL(
                            "UPDATE salesforce.instalefacil_cliente_login " +
                            " SET status = 'X'"+
                            " WHERE userid = " + rs.getLong("userid")+
                            " AND status = 'A'"
                        );
                    }
                }
            }catch (SQLException e) {
                throw new AppException(e.getMessage(), "AccessControl.logout");
            }
        }
        JSONObject returnData = new JSONObject();
        returnData.put("error", 0);
        returnData.put("message", "");
        return returnData;
    }

    public JSONObject sendPassword(String email) throws AppException {
        if(!AppUtils.isEmailValid(email)){
            throw new AppException(402, "Email Inválido");
        }
        try{
            ResultSet rs = this.conn.executeQuery(
                "SELECT id, sfid, email__c, status__c" +
                " FROM salesforce.instalefacil_cliente__c" +
                " WHERE email__c = '" + this.conn.escape(email) + "'" +
                " AND isdeleted = false"
            );
            if(rs.next() && !rs.getString("status__c").equals("X") ){
                this.userId = rs.getLong("id");
                this.userSFId = rs.getString("sfid");
                this.createAction(
                    //"ResetPassword","/cliente/criar-senha.html",
                    "ResetPassword","/#/login/nova-senha",
                    null, this.userSFId, null
                );
            }else{
                throw new AppException(404, "Email não Cadastrado");
            }
        }catch (SQLException e){
            throw new AppException(e.getMessage(), "AccessControl.sendPassword");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("error", 0);
        returnData.put("message", "");
        return returnData;
    }

    public JSONObject resetPassword(String actionId, String actionToken, String password)
            throws AppException {

        if(actionId.length() != 36 || actionToken.length() != 32){
            throw new AppException(999, "Parâmetros inválidos");
        }
        if(!this.isPasswordValid(password)){
            throw new AppException(403, "Senha Inválida");
        }
        String ativacao = null;
        String status = null;
        try{
            ResultSet rs = this.conn.executeQuery(
                "SELECT A.timestamp__c, B.id AS userid, B.sfid,"+
                      " B.email__c, B.status_ativacao__c, B.status__c," +
                      " A.status__c action_status" +
                " FROM salesforce.instalefacil_action__c A" +
                    ", salesforce.instalefacil_cliente__c B"+
                " WHERE A.externalid__c = '" + this.conn.escape(actionId) + "'" +
                " AND A.token__c = '" + this.conn.escape(actionToken) + "'" +
                " AND A.action__c IN ('ResetPassword','CreatePassword')" +
                " AND A.isdeleted = false"+
                " AND B.sfid = A.cliente__c"+
                " AND B.isdeleted = false"
            );
            if(rs.next()){
                String actionStatus = rs.getString("action_status");
                Long resetPasswordTimeout = Long.parseLong(System.getenv("RESET_PASSWORD_TIMEOUT"));
                Long timestamp = AppUtils.time();
                if (!actionStatus.equals("Pendente") || (timestamp - resetPasswordTimeout) > rs.getLong("timestamp__c")){
                    throw new AppException(593, "Link expirado ou inválido");
                }
                this.userId = rs.getLong("userid");
                this.userSFId = rs.getString("sfid");
                String email = rs.getString("email__c");
                ativacao = rs.getString("status_ativacao__c");
                status = rs.getString("status__c");
                String encodedPassword = AppUtils.md5(email+password);
                this.conn.executeSQL(
                     "UPDATE salesforce.instalefacil_cliente__c " +
                     " SET senha__c = '" + this.conn.escape(encodedPassword) + "'"+
                     " WHERE id = " + this.userId
                );
                this.removeAction(actionId);
            }else{
                throw new AppException(999, "Parâmetros inválidos");
            }
        }catch (SQLException e) {
            throw new AppException(e.getMessage(), "AccessControl.resetPassword");
        }
        this.createLogin();
        this.createSession();
        JSONObject returnData = new JSONObject();
        returnData.put("error", 0);
        returnData.put("message", "");
        returnData.put("clientId", this.clientId);
        returnData.put("refreshToken", this.refreshToken);
        returnData.put("sessionId", this.sessionId);
        returnData.put("accessToken", this.accessToken);
        returnData.put("ativacao", ativacao);
        returnData.put("status", status);
        return returnData;
    }

    public JSONObject changePassword(String oldPassword, String newPassword)
            throws AppException {

        if(!this.isPasswordValid(newPassword)){
            throw new AppException(403, "Senha Inválida");
        }
        try{
            ResultSet rs = this.conn.executeQuery(
                "SELECT email__c, senha__c" +
                " FROM salesforce.instalefacil_cliente__c " +
                " WHERE id = " + this.userId +
                " AND isdeleted = false"
            );
            if(rs.next()){
                String email = rs.getString("email__c");
                String encodedPassword = AppUtils.md5(email+oldPassword);
                if(encodedPassword.equals(rs.getString("senha__c"))){
                    encodedPassword = AppUtils.md5(email+newPassword);
                    this.conn.executeSQL(
                         "UPDATE salesforce.instalefacil_cliente__c " +
                         " SET senha__c = '"+this.conn.escape(encodedPassword)+"'"+
                         " WHERE id = " + this.userId
                    );
                }else{
                    throw new AppException(404, "Senha inválida");
                }
            }else{
                throw new AppException(404, "Usuário não cadastrado");
            }
        }catch (SQLException e){
            throw new AppException(e.getMessage(), "AccessControl.signIn");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("error", 0);
        returnData.put("message", "");
        return returnData;
    }

    private void createAction(ArrayList<Action> actions) throws AppException, SQLException {
        if (actions.size() < 1) return;
        PreparedStatement insertActions = this.conn.getInsertStatement(
            "salesforce.instalefacil_action__c",
            "id,externalid__c,token__c,action__c,actionuri__c,"+
            "instalador__c,cliente__c,projeto__c,timestamp__c,"+
            "status__c='Pendente',createddate=now(),isdeleted=false"
        );
        for(int i=0; i<actions.size(); i++){
            Action action = actions.get(i);
            long actionId = this.conn.getNextId("salesforce.instalefacil_action__c_id_seq");
            String externalId = AppUtils.toUUID(actionId);
            String actionToken = AppUtils.md5(
                    action.tag+action.instalador+action.cliente+
                    action.projeto+actionId+this.userId+AppUtils.time()
            );
            String url = System.getenv("BASE_URL")+action.uri
                            + (action.uri.matches("[?]") ? "&" : "?")
                            + "id="+externalId+"&token="+actionToken;
            Long timestamp = AppUtils.time();
            insertActions.setLong(1, actionId);
            insertActions.setString(2, externalId);
            insertActions.setString(3, actionToken);
            insertActions.setString(4, action.tag);
            insertActions.setString(5, url);
            insertActions.setString(6, action.instalador);
            insertActions.setString(7, action.cliente);
            insertActions.setString(8, action.projeto);
            insertActions.setLong(9, timestamp);
            insertActions.addBatch();
        }
        insertActions.executeBatch();
    }

    private void createAction(String actionTag, String actionURI,
                              String instalador, String cliente, String projeto)
            throws AppException, SQLException {

        ArrayList<Action> actions = new ArrayList<>();
        actions.add(
            new Action(actionTag,actionURI,instalador,cliente,projeto)
        );
        this.createAction(actions);
    }

    public JSONObject createActionFromAPI(JSONObject inputData) throws AppException, SQLException {
        if(!inputData.containsKey("key") || !inputData.containsKey("actions")) {
            throw new AppException(400, "Parâmetros Inválidos");
        }
        String secretKey = inputData.get("key").toString();
        if (!secretKey.equals(System.getenv("API_SECRET_KEY"))){
            throw new AppException(401, "Parâmetros Inválidos");
        }
        JSONArray a = (JSONArray) inputData.get("actions");
        ArrayList<Action> actions = new ArrayList<>();
        for(int i=0; i<a.size(); i++){
            JSONObject action = (JSONObject) a.get(i);
            if(action.containsKey("action")
                && action.containsKey("uri")
                    && (action.containsKey("instalador")
                            || action.containsKey("cliente")
                                || action.containsKey("projeto")) )
            {
                actions.add(
                    new Action(
                        action.get("action").toString(),
                        action.get("uri").toString(),
                        (action.containsKey("instalador") ? (String) action.get("instalador") : null),
                        (action.containsKey("cliente") ? (String) action.get("cliente") : null),
                        (action.containsKey("projeto") ? (String) action.get("projeto") : null)
                    )
                );
            }
        }
        if (actions.size() > 0){
            this.createAction(actions);
        }
        JSONObject returnData = new JSONObject();
        returnData.put("error", 0);
        returnData.put("message", "Success");
        return returnData;
    }

    private void removeAction(String actionId) throws AppException {
        this.conn.executeSQL(
             "UPDATE salesforce.instalefacil_action__c " +
             " SET status__c = 'Concluido'"+
             " WHERE externalid__c = '"+this.conn.escape(actionId)+"'"
        );
    }

    public JSONObject isActionValid(String actionId, String actionToken) throws AppException{
        if(actionId.length() != 36 || actionToken.length() != 32){
            throw new AppException(999, "Parâmetros inválidos");
        }
        String status = null;
        try{
            ResultSet rs = this.conn.executeQuery(
                "SELECT A.status__c"+
                " FROM salesforce.instalefacil_action__c A"+
                    ", salesforce.instalefacil_cliente__c B"+
                " WHERE A.externalid__c = '" + this.conn.escape(actionId) + "'" +
                " AND A.token__c = '" + this.conn.escape(actionToken) + "'" +
                " AND A.isdeleted = false"+
                " AND B.sfid = A.cliente__c"+
                " AND B.isdeleted = false"
            );
            if(rs.next()){
                status = rs.getString("status__c");
                if (!status.equals("Pendente")){
                    throw new AppException(593, "Link expirado ou inválido");
                }
            }else{
                throw new AppException(999, "Parâmetros inválidos");
            }
        }catch (SQLException e) {
            throw new AppException(e.getMessage(), "AccessControl.isActionValid");
        }
        JSONObject returnData = new JSONObject();
        returnData.put("status", status);
        return returnData;
    }

    public Long getSessionId(){
        return this.sessionId;
    }

    public String getAccessToken(){
        return this.accessToken;
    }

    public Long getUserId(){
        return this.userId;
    }

    public String getUserSFId(){
        return this.userSFId;
    }

    private class Action {
        public String tag;
        public String uri;
        public String instalador;
        public String cliente;
        public String projeto;

        public Action(String tag, String uri, String instalador,
                String cliente, String projeto)
        {
            this.tag = tag;
            this.uri = uri;
            this.instalador = instalador;
            this.cliente = cliente;
            this.projeto = projeto;
        }
    }

}