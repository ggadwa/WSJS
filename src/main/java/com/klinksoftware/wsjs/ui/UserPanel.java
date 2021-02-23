package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.websockets.*;

import java.awt.*;
import java.util.*;
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
    
    public void update()
    {
        /*
        int         n;
        ArrayList<WebSocketClient>  clients;
        
        clients=App.getClientList();
        
        listModel.removeAllElements();
        
        for (n=0;n!=clients.size();n++) {
            listModel.addElement(clients.get(n).getUserName());
        }
*/
    }
}
