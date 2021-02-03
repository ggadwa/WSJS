package com.klinksoftware.wsjs.ui;

import java.awt.*;
import javax.swing.*;

public class GenericLabel extends JLabel
{
    public GenericLabel(String title,boolean leftBorder)
    {
        super(" "+title);
        
        super.setFont(new Font("Arial",Font.BOLD,14));
        super.setBackground(Color.LIGHT_GRAY);
        super.setBorder(BorderFactory.createMatteBorder(1,(leftBorder?1:0),1,0,Color.black));
        super.setVerticalTextPosition(JLabel.CENTER);
        super.setOpaque(true);
        super.setPreferredSize(new Dimension(AppWindow.USER_WIDTH,AppWindow.HEADER_HEIGHT));
        super.setMinimumSize(new Dimension(AppWindow.USER_WIDTH,AppWindow.HEADER_HEIGHT));
        super.setMaximumSize(new Dimension(AppWindow.USER_WIDTH,AppWindow.HEADER_HEIGHT));
        
    }
}
