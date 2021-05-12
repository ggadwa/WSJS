package com.klinksoftware.wsjs.ui;

import java.util.*;
import java.awt.*;

public class StatusCanvas extends Canvas
{
    private static final int        FONT_SIZE=14;
    
    private int                 valueLen,
                                networkByteCount,maxNetworkByteCount;
    private float[]             memValues,netValues;
    private Image               drawBuffer;
    
    public StatusCanvas()
    {
        memValues=null;
        netValues=null;
        
        networkByteCount=0;
        maxNetworkByteCount=1;
        
        drawBuffer=null;
    }
    
    public void addStatusNetworkBytes(int byteCount)
    {
        networkByteCount+=byteCount;     // this isn't meant to be super accurate but an estimate, but will be close to K per second, there will be drift in timers
    }
    
    private void drawChart(Graphics2D g2D,Color color,String title,int wid,int top,int bot,float maxValue,float[] data)
    {
        int         x,y,fontWid;
        float       fHigh;
        String      str;
        
            // the chart
            
        g2D.setColor(color);
        
        fHigh=(float)(bot-top);
        
        for (x=0;x!=valueLen;x++) {
            if (data[x]==0) {
                y=bot-1;
            }
            else {
                y=bot-(int)(fHigh*(data[x]/maxValue));
                if (y==bot) y=bot-1;
            }
            
            g2D.drawLine(x,y,x,bot);
        }
        
            // the label
        
        g2D.setColor(Color.BLACK);
            
        str=String.format(title,maxValue);
        
        fontWid=g2D.getFontMetrics().stringWidth(str);
        g2D.drawString(str,((wid-fontWid)/2),(bot-10));
    }
    
    @Override
    public void paint(Graphics g)
    {
        int             wid,high,mid;
        float           maxValue;
        Graphics2D      g2D;
        Runtime         rt;
        
            // draw to back image
            
        wid=this.getWidth();
        high=this.getHeight();
        mid=high/2;
            
        if (drawBuffer==null) {
            drawBuffer=createImage(wid,high);
            drawBuffer.getGraphics().setFont(new Font("Arial",Font.PLAIN,FONT_SIZE));
        }
            
        g2D=(Graphics2D)drawBuffer.getGraphics();
        g2D.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,RenderingHints.VALUE_TEXT_ANTIALIAS_LCD_HRGB);
        
            // if this is the first paint, we need
            // to initialize the items
            
        if (memValues==null) {
            valueLen=super.getBounds().width;
            memValues=new float[valueLen];
            netValues=new float[valueLen];
        }
        
            // clear
            
        g2D.setColor(Color.white);
        g2D.fillRect(0,0,wid,high);
        
            // draw memory
            
        rt=Runtime.getRuntime();
        
        System.arraycopy(memValues,1,memValues,0,(valueLen-1));
        memValues[valueLen-1]=(float)(rt.totalMemory()-rt.freeMemory())/(1024.0f*1024.0f);
        
        maxValue=(float)(rt.maxMemory()/(1024.0f*1024.0f));
        
        drawChart(g2D,Color.green,"Memory %,.1fM",wid,0,mid,maxValue,memValues);
        
            // draw network
            // we depend on this to be drawn every second, so we use that
            // to move the byte count forward, as this is an estimate and
            // writing to a variable is atomic we don't block
            
        System.arraycopy(netValues,1,netValues,0,(valueLen-1));
        netValues[valueLen-1]=((float)networkByteCount)/1024.0f;
        if (networkByteCount>maxNetworkByteCount) maxNetworkByteCount=networkByteCount;
        
        networkByteCount=0;
        
        drawChart(g2D,Color.red,"Network %,.1fK",wid,mid,high,(((float)maxNetworkByteCount)/1024.0f),netValues);
        
            // the line
            
        g2D.setColor(Color.black);
        g2D.drawLine(0,mid,wid,mid);
        
            // flip the buffer
            
        g.drawImage(drawBuffer,0,0,this);
    }
    
}
