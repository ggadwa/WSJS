package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.*;

import javax.swing.*;

public class MapPanel extends JList
{
    private final DefaultListModel      listModel;
    
    public MapPanel()
    {
        listModel=new DefaultListModel();
        super.setModel(listModel);
        
        super.setLayoutOrientation(JList.VERTICAL);
        super.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        super.setVisibleRowCount(-1);
    }
    
    public void update(Project project)
    {
        listModel.removeAllElements();
        if (project.getMultiplayerMaps()==null) return;
        
        for (String name:project.getMultiplayerMaps()) {
            listModel.addElement(name);
        }
        
        this.setSelectedIndex(project.getMapIndex());
    }
}
