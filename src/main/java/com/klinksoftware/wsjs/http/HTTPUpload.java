package com.klinksoftware.wsjs.http;

import com.klinksoftware.wsjs.application.*;

import java.io.*;
import java.util.*;

public class HTTPUpload
{
    private final App       app;
    
    private String          filePath;
    private byte[]          data;
    
    public HTTPUpload(App app,String filePath,byte[] data)
    {
        this.app=app;
        this.filePath=filePath;
        this.data=data;
    }
    
    public void run() throws Exception
    {
        int                 uploadIndex;
        String              projectName,mapName,uploadName,fileName,
                            mapDirPath,mainFolderName,writePath;
        boolean             requiresFolder;
        String[]            tokens;
        File                file,dirFile;
        FileOutputStream    outStream;
        
            // break into pieces
            
        tokens=filePath.substring(1).split("/");
        
        projectName=tokens[0];
        mapName=tokens[1];
        uploadName=tokens[2];
        uploadIndex=Integer.parseInt(tokens[3]);
        
            // decode the upload name to figure
            // out where and how to place output
         
        mainFolderName=null;
        fileName=null;
        requiresFolder=false;
        
        if (uploadName.equals("SMP")) {
            requiresFolder=true;
            mainFolderName="shadowmaps";
            fileName="shadowmap_"+Integer.toString(uploadIndex)+".png";
        }
        
        if (uploadName.equals("SBN")) {
            requiresFolder=true;
            mainFolderName="shadowmaps";
            fileName="shadowmap.bin";
        }
        
        if (uploadName.equals("PTH")) {
            requiresFolder=false;
            mainFolderName="paths";
            fileName=mapName+".json";
        }
        
        if (mainFolderName==null) throw new Exception("Unable to upload file: "+filePath);
        
            // create directory if it doesn't exist
            
        mapDirPath=app.getWorkingPath()+File.separator+"projects"+File.separator+projectName+File.separator+mainFolderName;
        
        if (requiresFolder) {
            mapDirPath+=(File.separator+mapName);
            file=new File(mapDirPath);
            if (!file.exists()) file.mkdir();
        }
        
        System.out.println(mapDirPath);
        
            // if this is a SBN, then we need to clear
            // the folder because a new set of shadowmaps
            // is coming in
            
        if (uploadName.equals("SBN")) {
            dirFile=new File(mapDirPath);
            for (File delFile:dirFile.listFiles()) {
                if (!delFile.isDirectory()) {
                    if ((delFile.getName().endsWith(".png")) || (delFile.getName().endsWith(".bin"))) delFile.delete();
                }
            }
        }    
        
            // write the file to disk
            
        outStream=null;
        writePath=mapDirPath+File.separator+fileName;

        try {
            file=new File(writePath);
            if (!file.exists()) file.createNewFile();
            outStream=new FileOutputStream(file);
            outStream.write(Base64.getDecoder().decode(data));
        }
        catch(Exception e)
        {
            throw new Exception(("Unable to upload file: "+writePath),e);
        }
        finally {
            if (outStream!=null) outStream.close();
        }


    }
    
}
