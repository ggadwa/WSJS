package com.klinksoftware.wsjs.application;

import com.klinksoftware.wsjs.websockets.*;

import java.util.*;
import java.io.*;
import java.nio.*;
import com.fasterxml.jackson.core.type.*;
import com.fasterxml.jackson.databind.*;

public class Project
{
    private int                         gameIndex,mapIndex;
    private String                      name,path;
    private List<String>                multiplayerGames;
    private List<String>                multiplayerMaps;
    private Storage                     storage;
    private ArrayList<WebSocketClient>  clients;
    private final App                   app;
    
    private static final ObjectMapper objectMapper=new ObjectMapper();
    
    public Project(App app,String name,String path)
    {
        this.app=app;
        
        this.name=name;
        this.path=path;
        
        gameIndex=0;
        mapIndex=0;
                
            // the multiplayer clients
            
        clients=new ArrayList<>();
       
            // persistent data storage
           
        storage=new Storage(app,this);
    }
    
        //
        // load project information from json
        //
    
    public boolean start()
    {
        File                    coreJson;
        Map<String,Object>      coreMap;
        
        app.log("Starting project: "+name);
        
            // translate the core json
        
        try {
            coreJson=new File(path+File.separator+"html"+File.separator+"core.json");
            coreMap=objectMapper.readValue(coreJson,new TypeReference<Map<String,Object>>(){});
        }
        catch (IOException e)
        {
            app.log("Unable to read html/core.json: "+e.getMessage());
            return(false);
        }
        
            // get multiplayer games and maps
            
        multiplayerGames=(List<String>)coreMap.get("multiplayerGames");
        multiplayerMaps=(List<String>)coreMap.get("multiplayerMaps");
        
            // start storage
            
        storage.start();
        
        return(true);
    }
    
    public void stop()
    {
        storage.stop();
    }
    
        //
        // getters
        //
    
    public String getName()
    {
        return(name);
    }
    
    public Storage getStorage()
    {
        return(storage);
    }
    
    public ArrayList<WebSocketClient> getClientList()
    {
        return(clients);
    }

    public List<String> getMultiplayerGames()
    {
        return(multiplayerGames);
    }
    
    public int getGameIndex()
    {
        return(gameIndex);
    }
    
    public List<String> getMultiplayerMaps()
    {
        return(multiplayerMaps);
    }
    
    public int getMapIndex()
    {
        return(mapIndex);
    }
    
        //
        // clients
        //
    
    public void addClient(WebSocketClient client)
    {
        synchronized (clients) {
            clients.add(client);
        }
        
        storage.addUser(client.getUserName());
    }
    
    public void removeClient(WebSocketClient client)
    {
        synchronized (clients) {
            clients.remove(client);
        }
    }
    
    public boolean shutdownAllClients()
    {
        if (clients.isEmpty()) return(true);
            
        for (WebSocketClient shutdownClient:clients) {
            shutdownClient.shutdown();
        }
        
        return(false);
    }
    
        //
        // message distribution
        //
    
    public void distributeMessageToOtherClients(WebSocketClient sourceClient,byte[] msg)
    {
        int         sourceId;
        
        sourceId=sourceClient.getId();
        
        synchronized (clients) {
            for (WebSocketClient client:clients) {
                if (client.getId()!=sourceId) client.sendMessage(msg);
            }
        }
    }
    
    public void distributeMessageToAllClients(byte[] msg)
    {
        synchronized (clients) {
            for (WebSocketClient client:clients) {
                client.sendMessage(msg);
            }
        }
    }
    
    public void sendCurrentPlayerListToSelf(WebSocketClient sourceClient)
    {
        int             sourceId;
        ByteBuffer      byteBuf;
        
        sourceId=sourceClient.getId();
           
        byteBuf=ByteBuffer.allocate(WebSocketClient.USER_NAME_LENGTH+4);
        byteBuf.putShort(0,WebSocketClient.MESSAGE_TYPE_ENTITY_ENTER);
        
        synchronized (clients) {
            for (WebSocketClient client:clients) {
                if (client.getId()==sourceId) continue;
                
                byteBuf.putShort(2,(short)client.getId());
                sourceClient.putStringInByteBuffer(byteBuf,4,client.getUserName(),WebSocketClient.USER_NAME_LENGTH);
                
                try {
                    sourceClient.sendMessage(byteBuf.array());
                }
                catch (Exception e)
                {
                    app.log("Unable to send enter message");
                }
            }
        }
    }


}
