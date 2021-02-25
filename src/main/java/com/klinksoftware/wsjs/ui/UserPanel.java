package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.websockets.*;

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
    
    public void update(ArrayList<WebSocketClient> clients)
    {
        int         n;
        
        listModel.removeAllElements();
        
        for (WebSocketClient client:clients) {
            listModel.addElement(client.getUserName());
        }
    }
}
