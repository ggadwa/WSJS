package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.App;

public class StatusUpdater extends Thread
{
    private App             app;
    private boolean         shutdown;
    
    public StatusUpdater(App app)
    {
        this.app=app;
    }
    
    public void shutdown()
    {
        shutdown=true;
    }
    
    @Override
    public void run()
    {
        shutdown=false;
        
        while (!shutdown) {
            
            app.updateStatus();
            
            
                // wait for a bit
                
            if (shutdown) break;
            
            try {
                Thread.sleep(1000);
            }
            catch (InterruptedException ex) {}      // does not matter, this just makes it so this doesn't run too much
        }
    }
}
