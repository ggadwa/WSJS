package com.klinksoftware.wsjs.websockets;

import com.klinksoftware.wsjs.application.*;
        
import java.io.*;
import java.net.*;
import java.util.*;

public class WebSocketListener implements Runnable
{
    private static final String IP="0.0.0.0";
    private static final int PORT=52419;
    private static final int CONCURRENT_REQUEST=15;
    
    private final App                   app;

    private boolean                     running,inShutdown;
    private ServerSocket                serverSocket;
    
    public WebSocketListener(App app)
    {
        this.app=app;
    }

        //
        // misc listener data
        //
    
    public synchronized int getNextId()
    {
        int                         id;
        boolean                     hit;
        ArrayList<WebSocketClient>  clients=app.getClientList();
        
        id=1;
        
        while (true) {
            hit=false;

            for (WebSocketClient client:clients) {
                if (id==client.getId()) {
                    hit=true;
                    break;
                }
            }
            
            if (!hit) return(id);
            
            id++;
        }
    }
    
    public void shutdown()
    {
        if (!running) return;   // never started up
        
        inShutdown=true;
        try { serverSocket.close(); } catch(Exception e) {}     // force the server socket to cancel out
    }
    
    public void removeClient(WebSocketClient client)
    {
        ArrayList<WebSocketClient>  clients=app.getClientList();
        
        synchronized (clients) {
            clients.remove(client);
        }
    }
    
        //
        // distribute a message to clients
        //
    
    public void distributeMessageToOtherClients(WebSocketClient sourceClient,byte[] msg)
    {
        int                         sourceId;
        ArrayList<WebSocketClient>  clients=app.getClientList();
        
        sourceId=sourceClient.getId();
        
        synchronized (clients) {
            for (WebSocketClient client:clients) {
                if (client.getId()!=sourceId) client.sendMessage(msg);
            }
        }
    }
    
    public void distributeMessageToAllClients(byte[] msg)
    {
        ArrayList<WebSocketClient>  clients=app.getClientList();
        
        synchronized (clients) {
            for (WebSocketClient client:clients) {
                client.sendMessage(msg);
            }
        }
    }
    
        //
        // run the listener, this waits for connections and
        // passes them off to the client threads
        //
    
    @Override
    public void run()
    {
        int                         n;
        InetAddress                 bindAddr;
        Socket                      clientSocket;
        WebSocketClient             client;
        Thread                      clientThread;
        ArrayList<WebSocketClient>  clients=app.getClientList();
        
        running=false;
        inShutdown=false;
        
        app.log("WSListener starting on port: "+Integer.toString(PORT));
        
            // start the server socket

        try {
            bindAddr=InetAddress.getByName(IP);
            serverSocket=new ServerSocket(PORT,CONCURRENT_REQUEST,bindAddr);
        }
        catch (IOException e) {
            app.log("Unable to create WS server socket: "+e.getMessage());
            app.triggerWebSocketStartUpFinished();
            return;
        }
        
        running=true;
        app.log("WSListener is running");
        app.triggerWebSocketStartUpFinished();
        
            // accept client connections
            
        while (!inShutdown) {
            try {
                clientSocket=serverSocket.accept();
                
                client=new WebSocketClient(app,this,getNextId(),clientSocket);
                synchronized (clients) {
                    clients.add(client);
                }
                
                clientThread=new Thread(client,("ws_client_thread"));
                clientThread.start();

            }
            catch (Exception e)
            {
                if (!inShutdown) {
                    app.log("Error in WSListener accept: "+e.getMessage());
                }
                break;
            }
        }
        
        app.log("WSListener shutting down");
        
            // shutdown the server
  
        try {
            serverSocket.close();
        }
        catch (Exception e)
        {
            app.log("Unable to properly shutdown WSListener socket: "+e.getMessage());
        }
         
            // shutdown any client threads and
            // wait for them to have cleared the list
            
        while (true) {
            if (clients.isEmpty()) break;
            
            for (WebSocketClient shutdownClient:clients) {
                shutdownClient.shutdown();
            }
            
            try { Thread.sleep(100); } catch (InterruptedException e) { break; }
        }
        
        running=false;
    }
}
