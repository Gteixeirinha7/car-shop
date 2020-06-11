package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppRepository;
import com.comgas.instalefacil.instalador.APIFileHandler;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.codec.binary.Base64;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/upload-profile-foto")
public class APIUploadProfileFoto extends APIFileHandler {

    @Override
    public JSONObject execute(HttpServletRequest request) throws AppException, SQLException {

        ResultSet rs = this.executeQuery(
            "SELECT A.imageid__c, A.status__c"+
            " FROM salesforce.instalefacil_instalador__c A"+
            " WHERE A.id = "+this.getUserId()+
            " AND A.isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load user data", "APIUploadProfileFoto.execute");
        }

        String oldImageId = rs.getString("imageid__c");
        String status = rs.getString("status__c");
        StringBuffer jb = new StringBuffer();
        String line = null;
        try {
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null){
                jb.append(line);
            }
        } catch (IOException e) {
            throw new AppException("Invalid Data", "APIUploadProfileFoto.execute");
        }
        byte[] imageData = Base64.decodeBase64(jb.toString());
        InputStream inputStream = new ByteArrayInputStream(imageData);
        AppRepository repository = AppRepository.getInstance();
        String imageId = repository.createImageFrom(inputStream);
        String imageURL = repository.getImageURL(imageId);
        this.ping();
        if (oldImageId != null && oldImageId.compareTo(" ") > 0){
            repository.deleteImage(oldImageId);
        }
        this.executeSQL(
            "UPDATE salesforce.instalefacil_instalador__c"+
            " SET imageid__c = '"+this.escape(imageId)+"'"+
               ", imageurl__c = '"+this.escape(imageURL)+"'"+
            " WHERE id = "+this.getUserId()
        );
        JSONObject returnData = new JSONObject();
        returnData.put("imageURL", imageURL);
        returnData.put("status", status);
        return returnData;
    }

}
