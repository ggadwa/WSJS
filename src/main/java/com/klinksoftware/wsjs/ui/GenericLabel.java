package com.klinksoftware.wsjs.ui;

import java.awt.*;
import javax.swing.*;

public class GenericLabel extends JLabel
{
    public GenericLabel(String title,boolean gameHeader,boolean leftBorder)
    {
        super(" "+title);
        
        super.setFont(new Font("Arial",(gameHeader?Font.PLAIN:Font.BOLD),14));
        super.setBackground(gameHeader?new Color(0.8f,0.2f,1.0f):new Color(0.7f,0.7f,1.0f));
        super.setBorder(BorderFactory.createMatteBorder(1,(leftBorder?1:0),(gameHeader?0:1),0,Color.black));
        super.setVerticalTextPosition(JLabel.CENTER);
        super.setOpaque(true);
        super.setPreferredSize(new Dimension(AppWindow.USER_WIDTH,AppWindow.HEADER_HEIGHT));
        super.setMinimumSize(new Dimension(AppWindow.USER_WIDTH,AppWindow.HEADER_HEIGHT));
        super.setMaximumSize(new Dimension(AppWindow.USER_WIDTH,AppWindow.HEADER_HEIGHT));
    }
}
