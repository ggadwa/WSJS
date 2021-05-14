package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.*;
import com.klinksoftware.wsjs.websockets.*;

import javax.swing.*;

public class UserPanel extends JList
{
    private final DefaultListModel      listModel;
    
    public UserPanel()
    {
        super();
        
        listModel=new DefaultListModel();
        super.setModel(listModel);
        
        super.setLayoutOrientation(JList.VERTICAL);
        super.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        super.setVisibleRowCount(-1);
    }
    
    public void update(Project project)
    {
        listModel.removeAllElements();
        
        for (WebSocketClient client:project.getClientList()) {
            listModel.addElement(client.getUserName());
        }
    }
}
