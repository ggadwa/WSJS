package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.*;

import javax.swing.*;

public class GamePanel extends JList
{
    private final DefaultListModel      listModel;
    
    public GamePanel()
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
        if (project.getMultiplayerGames()==null) return;
        
        for (String name:project.getMultiplayerGames()) {
            listModel.addElement(name);
        }
        
        this.setSelectedIndex(project.getGameIndex());
    }
}
