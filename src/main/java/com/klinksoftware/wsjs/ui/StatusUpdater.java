package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.main.*;

public class StatusUpdater extends Thread
{
    private boolean         shutdown;
    
    public void shutdown()
    {
        shutdown=true;
    }
    
    @Override
    public void run()
    {
        shutdown=false;
        
        while (!shutdown) {
            
            WSServer.getAppWindow().updateStatus();
            
            
                // wait for a bit
                
            if (shutdown) break;
            
            try {
                Thread.sleep(1000);
            }
            catch (InterruptedException ex) {}      // does not matter, this just makes it so this doesn't run too much
        }
    }
}
