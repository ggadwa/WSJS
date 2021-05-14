package com.klinksoftware.wsjs.application;

import com.klinksoftware.wsjs.websockets.*;

import java.util.*;
import java.nio.*;

public class Project
{
    private float                       version;
    private String                      name,path,
                                        gameName,mapName,mapFileName;
    private Storage                     storage;
    private ArrayList<WebSocketClient>  clients;
    private final App                   app;
    
    public Project(App app,String name,String path)
    {
        this.app=app;
        
        this.name=name;
        this.path=path;
        
        version=0.0f;
        gameName=null;
        mapName=null;
        mapFileName=null;
                
            // the multiplayer clients
            
        clients=new ArrayList<>();
       
            // persistent data storage
           
        storage=new Storage(app,this);
    }
    
        //
        // load project
        //
    
    public boolean start()
    {
        app.log("Starting project: "+name);
        
        storage.start();
        
        return(true);
    }
    
    public void stop()
    {
        storage.stop();
    }
    
        //
        // getters and setters
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
    
    public void setup(float version,String gameName,String mapName,String mapFileName)
    {
        this.version=version;
        this.gameName=gameName;
        this.mapName=mapName;
        this.mapFileName=mapFileName;
    }
    
    public float getVersion()
    {
        return(version);
    }
    
    public String getGameName()
    {
        return(gameName);
    }
    
    public String getMapName()
    {
        return(mapName);
    }
    
    public String getMapFileName()
    {
        return(mapFileName);
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
    
    public boolean hasClient(String userName)
    {
        synchronized (clients) {
            for (WebSocketClient client:clients) {
                if (client.getUserName().equalsIgnoreCase(userName)) return(true);
            }
        }
        
        return(false);
    }
    
    public boolean isFirstClient()
    {
        synchronized (clients) {
            return(clients.isEmpty());
        }
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
           
        byteBuf=ByteBuffer.allocate(WebSocketClient.GENERAL_STR_LENGTH+4);
        byteBuf.putShort(0,WebSocketClient.MESSAGE_TYPE_ENTITY_ENTER);
        
        synchronized (clients) {
            for (WebSocketClient client:clients) {
                if (client.getId()==sourceId) continue;
                
                byteBuf.putShort(2,(short)client.getId());
                sourceClient.putStringInByteBuffer(byteBuf,4,client.getUserName(),WebSocketClient.GENERAL_STR_LENGTH);
                
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
