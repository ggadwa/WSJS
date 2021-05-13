package com.klinksoftware.wsjs.websockets;

import com.klinksoftware.wsjs.application.*;
        
import java.io.*;
import java.net.*;

public class WebSocketListener implements Runnable
{
    private static final String IP="0.0.0.0";
    private static final int PORT=52418;
    private static final int CONCURRENT_REQUEST=15;
    
    private final App                   app;

    private int                         nextId;
    private boolean                     running,inShutdown;
    private ServerSocket                serverSocket;
    
    public WebSocketListener(App app)
    {
        this.app=app;
    }
    
    public void shutdown()
    {
        if (!running) return;   // never started up
        
        inShutdown=true;
        try { serverSocket.close(); } catch(Exception e) {}     // force the server socket to cancel out
    }
    
    
        //
        // run the listener, this waits for connections and
        // passes them off to the client threads
        //
    
    @Override
    public void run()
    {
        boolean             shutdownOK;
        InetAddress         bindAddr;
        Socket              clientSocket;
        WebSocketClient     client;
        Thread              clientThread;
        
        running=false;
        inShutdown=false;
        
        app.log("WS listener starting on port: "+Integer.toString(PORT));
        
            // start the server socket

        try {
            bindAddr=InetAddress.getByName(IP);
            serverSocket=new ServerSocket(PORT,CONCURRENT_REQUEST,bindAddr);
        }
        catch (IOException e) {
            app.log("Unable to create WS listener socket: "+e.getMessage());
            app.triggerWebSocketStartUpFinished();
            return;
        }
        
        running=true;
        app.log("WS listener is running");
        app.triggerWebSocketStartUpFinished();
        
            // accept client connections
            // the threads themselves add to the right
            // project if they succeed in logging on
            // (otherwise they just return and fail)
            
        while (!inShutdown) {
            try {
                clientSocket=serverSocket.accept();
                
                client=new WebSocketClient(app,this,nextId,clientSocket);
                clientThread=new Thread(client,("ws_client_thread"));
                clientThread.start();
                
                nextId=(nextId+1)&0x7FFF;       // these are shorts, yes, this wraps and it's a TODO here
            }
            catch (Exception e)
            {
                if (!inShutdown) {
                    app.log("Error in WS listener accept: "+e.getMessage());
                }
                break;
            }
        }
        
        app.log("WS listener shutting down");
        
            // shutdown the server
  
        try {
            serverSocket.close();
        }
        catch (Exception e)
        {
            app.log("Unable to properly shutdown WS listener socket: "+e.getMessage());
        }
         
            // shutdown any client threads and
            // wait for them to have cleared the list
            
        while (true) {
            shutdownOK=true;
            
            for (Project project:app.getProjectList().getProjects()) {
                shutdownOK=shutdownOK&&project.shutdownAllClients();
            }
            
            if (shutdownOK) break;
            
            try { Thread.sleep(100); } catch (InterruptedException e) { break; }
        }
        
        running=false;
    }
}
