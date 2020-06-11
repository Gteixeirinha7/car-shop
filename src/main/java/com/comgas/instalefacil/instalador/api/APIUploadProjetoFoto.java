package com.comgas.instalefacil.instalador.api;

import com.comgas.instalefacil.core.AppException;
import com.comgas.instalefacil.core.AppRepository;
import com.comgas.instalefacil.instalador.APIFileHandler;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.codec.binary.Base64;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@WebServlet("/instalador/api/upload-projeto-foto")
public class APIUploadProjetoFoto extends APIFileHandler {

    @Override
    public JSONObject execute(HttpServletRequest request) throws AppException, SQLException {

        String sProjetoId = request.getHeader("Data-id");
        String fotoTipo = request.getHeader("Data-tipo");
        String sOldFotoId = request.getHeader("Data-foto-id");

        if (sProjetoId == null || fotoTipo == null){
            throw new AppException("Invalid Parameters", "APIUploadProjetoFoto.execute");
        }

        HashSet<String> photoTypes = new HashSet<>();
        photoTypes.add("Abrigo");
        photoTypes.add("Equipamento");
        photoTypes.add("Frente do comércio");
        photoTypes.add("Interna");
        photoTypes.add("Porta do abrigo");
        if (!photoTypes.contains(fotoTipo)){
            throw new AppException("Invalid Parameters [fotoTipo]", "APIUploadProjetoFoto.execute");
        }

        Long projetoId = Long.valueOf(sProjetoId);
        Long oldFotoId = (sOldFotoId != null ? Long.valueOf(sOldFotoId) : 0);
        String oldImageId = null;

        ResultSet rs = this.executeQuery(
            "SELECT A.sfid, A.status__c"+
            " FROM salesforce.instalefacil_projeto__c A"+
            " WHERE A.id = "+projetoId+
            " AND A.instalador__c = '"+this.escape(this.getUserSFId())+"'"+
            " AND A.isdeleted = false"
        );
        if(!rs.next()){
            throw new AppException("Fail to load project", "APIUploadProjetoFoto.execute");
        }
        String projetoSFId = rs.getString("sfid");
        String projetoStatus = rs.getString("status__c");
        if (projetoStatus.compareTo("2A") <= 0){
            throw new AppException("Invalid project status", "APIUploadProjetoFoto.execute");
        }
        if (oldFotoId > 0){
            rs = this.executeQuery(
                "SELECT A.tipo__c, A.imageid__c"+
                " FROM salesforce.instalefacil_projeto_foto__c A"+
                " WHERE A.id = "+oldFotoId+
                " AND A.projeto__c = '"+this.escape(projetoSFId)+"'"+
                " AND A.isdeleted = false"
            );
            if(rs.next()){
                oldImageId = rs.getString("imageid__c");
                fotoTipo = rs.getString("tipo__c");
            }else{
                oldFotoId = 0L;
            }
        }
        StringBuffer jb = new StringBuffer();
        String line = null;
        try {
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null){
                jb.append(line);
            }
        } catch (IOException e) {
            throw new AppException("Invalid Data", "APIUploadProjetoFoto.execute");
        }
        byte[] imageData = Base64.decodeBase64(jb.toString());
        InputStream inputStream = new ByteArrayInputStream(imageData);
        AppRepository repository = AppRepository.getInstance();
        String imageId = repository.createImageFrom(inputStream);
        String imageURL = repository.getImageURL(imageId);
        this.ping();
        if (oldFotoId > 0){
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto_foto__c"+
                " SET imageid__c = '"+this.escape(imageId)+"'"+
                ", imageurl__c = '"+this.escape(imageURL)+"'"+
                ", motivo_rejeicao__c = ''"+
                ", status__c = '1A'"+
                " WHERE id = "+oldFotoId
            );
            if (oldImageId != null){
                repository.deleteImage(oldImageId);
            }
        }else{
            PreparedStatement insertFoto = this.getInsertStatement(
                "salesforce.instalefacil_projeto_foto__c",
                "projeto__c,tipo__c,imageid__c,imageurl__c,"+
                    "status__c='1A',isdeleted=false"
            );
            insertFoto.setString(1, projetoSFId);
            insertFoto.setString(2, fotoTipo);
            insertFoto.setString(3, imageId);
            insertFoto.setString(4, imageURL);
            insertFoto.executeUpdate();
        }

        JSONArray fotos = new JSONArray();
        rs = this.executeQuery(
            "SELECT A.id, A.tipo__c, A.status__c,"+
                  " A.motivo_rejeicao__c, A.imageid__c, A.imageurl__c" +
            " FROM salesforce.instalefacil_projeto_foto__c A" +
            " WHERE A.projeto__c = '"+this.escape(projetoSFId)+"'" +
            " AND A.isdeleted = false"+
            " ORDER BY A.tipo__c ASC, A.id ASC"
        );
        boolean anyRejected = false;
        while(rs.next()){
            String fotoStatus = rs.getString("status__c");
            JSONObject foto = new JSONObject();
            foto.put("id", rs.getLong("id"));
            foto.put("tipo", rs.getString("tipo__c"));
            foto.put("imageURL", rs.getString("imageurl__c"));
            foto.put("motivo", rs.getString("motivo_rejeicao__c"));
            foto.put("status", fotoStatus);
            fotos.add(foto);
            if (fotoStatus.equals("9D")){
                anyRejected = true;
            }
        }
        if (projetoStatus.equals("3D") && !anyRejected){
            projetoStatus = "3A";
            this.executeSQL(
                "UPDATE salesforce.instalefacil_projeto__c"+
                " SET status__c = '"+this.escape(projetoStatus)+"'"+
                " WHERE id = "+projetoId
            );
        }
        JSONObject returnData = new JSONObject();
        returnData.put("fotos", fotos);
        returnData.put("status", projetoStatus);
        return returnData;
    }

}
