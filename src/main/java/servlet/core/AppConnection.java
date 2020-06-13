package servlet.core;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.DriverManager;
import java.sql.PreparedStatement;


public class AppConnection {

    private Connection conn;
    private Statement stmt;

    public AppConnection() throws AppException {
        this.connect();
    }

    private void connect() throws AppException {
        String dbUrl = System.getenv("JDBC_DATABASE_URL");
        try {
            Class.forName("org.postgresql.Driver");
            this.conn = DriverManager.getConnection(dbUrl);
            this.stmt = this.conn.createStatement();
        } catch (ClassNotFoundException | SQLException e) {
            throw new AppException(e.getMessage(), "AppConnection.getConnection");
        }
    }

    public void ping() throws AppException {
        try {
            this.conn.createStatement().executeQuery("SELECT 1");
            return;
        }catch  (SQLException e){ }
        this.connect();
    }

    public void close() {
        try {
            this.conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public ResultSet executeQuery(String query) throws AppException {
        try {
            return this.conn.createStatement().executeQuery(query);
        }catch  (SQLException e){
            throw new AppException(query+" => "+e.getMessage(),"AppConnection.executeQuery");
        }
    }

    public int executeSQL(String query) throws AppException {
        Integer updatedRows = null;
        try {
            updatedRows = this.stmt.executeUpdate(query);
        }catch  (SQLException e){
            throw new AppException(query+" => "+e.getMessage(),"AppConnection.executeSQL");
        }
        return updatedRows;
    }

    public PreparedStatement prepareStatement(String query) throws AppException {
        try {
            return this.conn.prepareStatement(query);
        }catch (SQLException e) {
            throw new AppException(query+" => "+e.getMessage(),"JQConnection.prepareStatement");
        }
    }

    public long getNextId(String seqName) throws AppException {
        ResultSet rs = this.executeQuery("SELECT nextval('"+seqName+"'::regclass);");
        try {
            if (rs.next()){
                return rs.getLong(1);
            }
        } catch (SQLException e) {}
        throw new AppException("Fail to get next sequence id","JAppConnection.getNextId");
    }

    public String getNextIdClause(String seqName) {
        return "nextval('"+seqName+"'::regclass)";
    }

    public String getUUIDClause(long id) {
        return "uuid_in(md5("+id+"::text || random()::text || now()::text)::cstring)";
    }
    
    public String escape(String value, int maxLength) {
        if (value == null) return "";
        if (maxLength > 0 && value.length() > maxLength){
                return value.substring(0,maxLength).replace("'","''").replace("\"", "\"\""); 
        }
        return value.replace("'","''").replace("\"", "\"\""); 
    }

    public String escape(String value) { 
        return this.escape(value, 0);
    }

    public PreparedStatement getInsertStatement(String tableName, String fieldList) throws AppException {
        String[] fields = fieldList.split(",");
        String[] values = new String[fields.length];
        for(int i=0; i<fields.length; i++){
            int assignOperator = fields[i].indexOf("=");
            if (assignOperator > 0){
                values[i] = fields[i].substring(assignOperator+1);
                fields[i] = fields[i].substring(0, assignOperator);  
            }else{
                values[i] = "?";
            }
        }
        return this.prepareStatement(
            "INSERT INTO "+tableName+
            " ("+AppUtils.implode(", ",fields)+") VALUES ("+AppUtils.implode(", ",values)+")"
        );
    }

}
