package com.klinksoftware.wsjs.ui;

import java.awt.*;
import javax.swing.*;

public class GradientLabel extends JLabel
{
    private Color topColor,botColor;
    
    public GradientLabel(String title,Color topColor,Color botColor,boolean leftBorder)
    {
        super(" "+title);
        
        this.topColor=topColor;
        this.botColor=botColor;
        
        super.setFont(new Font("Arial",Font.BOLD,14));
        super.setBorder(BorderFactory.createMatteBorder(0,(leftBorder?1:0),1,0,botColor));
        super.setVerticalTextPosition(JLabel.CENTER);
        super.setMaximumSize(new Dimension(Integer.MAX_VALUE,AppWindow.HEADER_HEIGHT));
    }
    
    @Override
    public void paint(Graphics g)
    {
        int x,wid,high;
        Graphics2D g2d;
        Paint origPaint;
        GradientPaint gPaint;
        
        wid=getWidth();
        high=getHeight();
        
        x=wid/2;
        gPaint=new GradientPaint(x,0,topColor,x,getHeight(),botColor,true);
        
        g2d=(Graphics2D)g;
        origPaint=g2d.getPaint();
        g2d.setPaint(gPaint);
        g2d.fillRect(0,0,wid,high);
        g2d.setPaint(origPaint);
        
        super.paint(g);
    }
}
