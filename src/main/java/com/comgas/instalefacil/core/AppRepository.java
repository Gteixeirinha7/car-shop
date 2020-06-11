package com.comgas.instalefacil.core;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import net.coobird.thumbnailator.Thumbnails;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.ClientConfiguration;
import com.amazonaws.Protocol;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;

public class AppRepository {

    private static AppRepository instance = null;
    private AmazonS3 s3Client;
    private final String bucketName;
    private final String publicFolder;
    private final String baseURL;

    protected AppRepository() {
        ClientConfiguration config = new ClientConfiguration();
        config.setProtocol(Protocol.HTTP);
        String awsAccessKey = System.getenv("BUCKETEER_AWS_ACCESS_KEY_ID");
        String awsSecretAccess = System.getenv("BUCKETEER_AWS_SECRET_ACCESS_KEY");         
        String awsRegion = System.getenv("BUCKETEER_AWS_REGION");
        this.s3Client = new AmazonS3Client(new BasicAWSCredentials(awsAccessKey, awsSecretAccess), config);
        Regions region = Regions.US_EAST_1;
        switch(awsRegion){
            case "us-west-1": region = Regions.US_WEST_1; break;
            case "us-west-2": region = Regions.US_WEST_2; break;
        }
        this.s3Client.setRegion(Region.getRegion(region));
        this.bucketName = System.getenv("BUCKETEER_BUCKET_NAME");
        this.baseURL = "https://" + this.bucketName + ".s3.amazonaws.com/";
        this.publicFolder = "public/";
    }

    public static AppRepository getInstance() throws AppException {
        if(instance == null) instance = new AppRepository();
        return instance;
    }


    public byte[] readFile(String filePath) throws AppException {
        try {
            S3Object s3Object = this.s3Client.getObject(this.bucketName, filePath);
            S3ObjectInputStream s3InputStream = s3Object.getObjectContent();
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] readBuffer = new byte[1024];
            int readLength = 0;
            while ((readLength = s3InputStream.read(readBuffer)) > 0) {
                    buffer.write(readBuffer, 0, readLength);
            }
            s3InputStream.close();
            buffer.flush();
            return buffer.toByteArray();
        }catch (AmazonServiceException | IOException e) {
            System.out.print(e.getMessage());
            throw new AppException("<"+filePath+"> Error reading file","AppRepository.readFile");
        }
    }


    public String readTextFile(String filePath) throws AppException {
        try {
            S3Object s3Object = this.s3Client.getObject(this.bucketName, filePath);
            S3ObjectInputStream s3InputStream = s3Object.getObjectContent();
            String data = new String();
            byte[] buffer = new byte[1024];
            while(s3InputStream.read(buffer) != -1) {
                    data = data.concat( new String(buffer) );
            }
            s3InputStream.close();
            return data;
        }catch (AmazonServiceException | IOException e) {
            System.out.print(e.getMessage());
            throw new AppException("<"+filePath+"> Error reading file","AppRepository.readTextFile");
        }
    }

    public String createImageFrom(InputStream inputStream) throws AppException {
        BufferedImage sourceImage;
        try{
            sourceImage = ImageIO.read(inputStream);
        }catch(IOException e){
            throw new AppException("Image Data Not Valid","AppRepository.createImageFrom"); 
        }
        if (sourceImage == null){
            throw new AppException("Image Data Not Valid","AppRepository.createImageFrom"); 
        }
        String imageId = AppUtils.toUUID(0);
        Float imageQuality = 0.85F;
        int imageWidth  = sourceImage.getWidth();
        int imageHeight = sourceImage.getHeight();
        int thumbnailWidth = 200;
        int thumbnailHeight = 200;
        float widthReductionRate = ((float) thumbnailWidth) / ((float) imageWidth);
        float heightReductionRate = ((float) thumbnailHeight) / ((float) imageHeight);
        if (widthReductionRate  > 1.0000000000F) widthReductionRate  = 1.0000000000F;
        if (heightReductionRate > 1.0000000000F) heightReductionRate = 1.0000000000F;
        float imageReductionRate = Math.max(widthReductionRate, heightReductionRate);
        int targetWidth  = (int) Math.ceil(imageWidth  * imageReductionRate);
        int targetHeight = (int) Math.ceil(imageHeight * imageReductionRate);
        if (targetWidth  > thumbnailWidth)  targetWidth  = thumbnailWidth;
        if (targetHeight > thumbnailHeight) targetHeight = thumbnailHeight;
        int sourceWidth  = (int) Math.ceil(targetWidth  / imageReductionRate);
        int sourceHeight = (int) Math.ceil(targetHeight / imageReductionRate);
        int sourceX = 
                (int) (sourceWidth  < imageWidth  ? Math.floor((imageWidth  - sourceWidth)  / 2) : 0); 
        int sourceY = (int) (sourceHeight < imageHeight ? Math.floor((imageHeight - sourceHeight) / 2) : 0); 
        this.saveFileFromImage(this.publicFolder+imageId+"-0.jpg", sourceImage, imageQuality);
        BufferedImage targetImage;
        try {
            targetImage = Thumbnails.of(sourceImage)
                            .sourceRegion(sourceX, sourceY, sourceWidth, sourceHeight)
                            .forceSize(targetWidth, targetHeight)
                            .asBufferedImage();
            this.saveFileFromImage(this.publicFolder+imageId+"-1.jpg", targetImage, imageQuality);
            targetImage.flush();
        } catch (IOException e) {
                throw new AppException("Fail to Create Image","AppRepository.createImageFrom"); 
        }
        sourceImage.flush();
        return imageId;
    }

    public String getImageURL(String imageId) {
        return this.baseURL+this.publicFolder+imageId+"-0.jpg";
    }

    public String getThumbnailURL(String imageId) {
        return this.baseURL+this.publicFolder+imageId+"-1.jpg";
    }

    public boolean deleteImage(String imageId) throws AppException {
        return (this.deleteFile("public/"+imageId+"-0.jpg")
                    && this.deleteFile("public/"+imageId+"-1.jpg"));
    }

    public void saveFileFromImage(String filePath, BufferedImage bufferedImage, Float quality) throws AppException {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            if (quality != null && quality > 0 && quality <= 1)  param.setCompressionQuality(quality);
            writer.setOutput(ImageIO.createImageOutputStream(outputStream));
            writer.write(null, new IIOImage(bufferedImage, null, null), param);
            writer.dispose();	
            byte[] data = outputStream.toByteArray();
            InputStream inputStream = new ByteArrayInputStream(data);
            ObjectMetadata info = new ObjectMetadata();
            info.setContentLength(data.length);
            this.s3Client.putObject(new PutObjectRequest(this.bucketName, filePath, inputStream, info));
        }catch (AmazonServiceException | IOException e) {
            System.out.print(e.getMessage());
            throw new AppException("<"+filePath+"> Error saving image","AppRepository.saveImage");
        }
    }

    private byte[] streamToBytes(InputStream inputStream) throws IOException {	
        ByteArrayOutputStream baos = new ByteArrayOutputStream();				
        byte[] buffer = new byte[1024];
        int read = 0;
        while ((read = inputStream.read(buffer, 0, buffer.length)) != -1) {
            baos.write(buffer, 0, read);
        }
        baos.flush();
        return baos.toByteArray();
    }

    public void saveFile(String filePath, InputStream inputStream) throws AppException {
        try {
            byte[] data = streamToBytes(inputStream);
            ByteArrayInputStream iStream = new ByteArrayInputStream(data);
            ObjectMetadata info = new ObjectMetadata();
            info.setContentLength(data.length);
            this.s3Client.putObject(new PutObjectRequest(this.bucketName, filePath, iStream, info));
        }catch (AmazonServiceException | IOException e) {
            System.out.print(e.getMessage());
            throw new AppException("<"+filePath+"> Error saving file","AppRepository.saveFile");
        }
    }

    public void saveFile(String filePath, byte[] data) throws AppException {
        try {
            InputStream inputStream = new ByteArrayInputStream(data);
            ObjectMetadata info = new ObjectMetadata();
            info.setContentLength(data.length);
            this.s3Client.putObject(new PutObjectRequest(this.bucketName, filePath, inputStream, info));
        }catch (AmazonServiceException e) {
            System.out.print(e.getMessage());
            throw new AppException("<"+filePath+"> Error saving file","AppRepository.saveFile");
        }
    }

    public void saveFile(String filePath, String string) throws AppException {
        try {
            byte[] data = string.getBytes();
            InputStream inputStream = new ByteArrayInputStream(data);
            ObjectMetadata info = new ObjectMetadata();
            info.setContentLength(data.length);
            this.s3Client.putObject(new PutObjectRequest(this.bucketName, filePath, inputStream, info));
        }catch (AmazonServiceException e) {
            System.out.print(e.getMessage());
            throw new AppException("<"+filePath+"> Error saving file","AppRepository.saveFile");
        }
    }

    public boolean deleteFile(String filePath) throws AppException {
        if (!this.isFile(filePath)) return false;
        try {
            this.s3Client.deleteObject(new DeleteObjectRequest(this.bucketName, filePath));
            return true;
        }catch (AmazonServiceException e) {
            System.out.print(e.getMessage());
            throw new AppException("<"+filePath+"> Error saving file","AppRepository.saveFile");
        }
    }

    private ObjectMetadata getObjectMetadata(String filePath) throws AppException {
        try{
            ObjectMetadata info = this.s3Client.getObjectMetadata(this.bucketName, filePath);
            return info;
        }catch(AmazonServiceException e){
            switch(e.getErrorMessage()){
            case "NoSuchKey":
            case "Forbidden":
            case "Not Found":
                return null;
            }
            throw new AppException(e.getErrorMessage(),"AppRepository");
        }
    }

    public boolean isFile(String filePath) throws AppException {
        return (this.getObjectMetadata(filePath) != null);
    }

    public long fileSize(String filePath) throws AppException {
        ObjectMetadata info = this.getObjectMetadata(filePath);
        return info.getContentLength();
    }

}
