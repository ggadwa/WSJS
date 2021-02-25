package com.klinksoftware.wsjs.http;

import com.klinksoftware.wsjs.application.*;

import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class HTTPListener implements Runnable
{
    private static final String BIND_IP="0.0.0.0";
    private static final int PORT=80;
    private static final int CONCURRENT_REQUEST=50;

    private final App              app;
    private boolean                running,inShutdown;
    private ServerSocket           serverSocket;
    
    public HTTPListener(App app)
    {
        this.app=app;
    }
    
        //
        // shutdown the http listener
        //
    
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
        InetAddress     bindAddr;
        Socket          clientSocket;
        ExecutorService threadPool;
        
            // not running yet
        
        running=false;
        inShutdown=false;
        
        app.log("HTTP listener starting on port: "+Integer.toString(PORT));
        
            // start the server socket

        try {
            bindAddr=InetAddress.getByName(BIND_IP);
            serverSocket=new ServerSocket(PORT,CONCURRENT_REQUEST,bindAddr);
        }
        catch (IOException e) {
            app.log("Unable to create http server socket: "+e.getMessage());
            app.triggerHTTPStartUpFinished();
            return;
        }
        
            // start the pool
            
        threadPool=Executors.newFixedThreadPool(CONCURRENT_REQUEST);
        
            // running
            
        running=true;
        app.triggerHTTPStartUpFinished();
        
        app.log("HTTP listener is running");
            
        while (!inShutdown) {
            try {
                clientSocket=serverSocket.accept();
                threadPool.execute(new HTTPClient(app,clientSocket));
            }
            catch (Exception e)
            {
                if (!inShutdown) {
                    app.log("Error in HTTP listener accept: "+e.getMessage());
                }
                break;
            }
        }
        
        app.log("HTTP listener shutting down");
        
            // shut the pool
            
        threadPool.shutdown();
        try {
            threadPool.awaitTermination(5000,TimeUnit.MILLISECONDS);
        }
        catch (InterruptedException e) {
            app.log("Unable to properly shutdown thread pool: "+e.getMessage());
        }
        
            // shutdown the socket
  
        try {
            serverSocket.close();
        }
        catch (Exception e)
        {
            app.log("Unable to properly shutdown HTTP listener socket: "+e.getMessage());
        }
        
        running=false;
    }
}
