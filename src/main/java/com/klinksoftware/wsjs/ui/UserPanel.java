package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.*;
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
    
    public void update(Project project)
    {
        /*
        ArrayList<WebSocketClient> clients

        int         n;
        
        listModel.removeAllElements();
        
        for (WebSocketClient client:clients) {
            if (client.isSynched()) {
                listModel.addElement(client.getUserName());
            }
            else {
                listModel.addElement(client.getUserName()+" (waiting)");
            }
        }
*/
    }
}