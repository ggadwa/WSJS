package com.klinksoftware.wsjs.main;

import org.springframework.boot.*;
import org.springframework.stereotype.*;

@Component
public class ApplicationStart implements ApplicationRunner
{
    @Override
    public void run(ApplicationArguments args) throws Exception
    {
        WSServer.start();
    }
    
}
    
    
    
    
