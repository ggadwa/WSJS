package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.App;

import java.awt.*;
import java.awt.event.*;
import java.net.*;
import javax.swing.*;

public class AppWindow implements WindowListener
{
    public static final int         WINDOW_WIDTH=1000;
    public static final int         WINDOW_HEIGHT=600;
    public static final int         HEADER_HEIGHT=22;
    public static final int         USER_WIDTH=250;
    public static final int         STATUS_CANVAS_HEIGHT=USER_WIDTH;
    
    private final App       app;
    
    private JFrame          frame;
    private JToolBar        toolBar;
    private JLabel          userLabel,logLabel;
    private JScrollPane     userScrollPane,logScrollPane;
    private LogPanel        logPanel;
    private UserPanel       userPanel;
    private StatusCanvas    statusCanvas;
    private StatusUpdater   statusUpdater;
    private Thread          statusThread;
    
    public AppWindow(App app)
    {
        this.app=app;
    }
    
        //
        // window events
        //
    
    @Override
    public void windowOpened(WindowEvent e)
    { 
    }

    @Override
    public void windowClosing(WindowEvent e)
    {
        app.stop();
    }

    @Override
    public void windowClosed(WindowEvent e)
    {
    }

    @Override
    public void windowIconified(WindowEvent e)
    {
    }

    @Override
    public void windowDeiconified(WindowEvent e)
    {
    }

    @Override
    public void windowActivated(WindowEvent e)
    {
    }

    @Override
    public void windowDeactivated(WindowEvent e)
    {
    }
    
        //
        // start and stop main window
        //
    
    public void start()
    {
        URL                 iconURL;
        Image               image;
        GridBagConstraints  gbc;
        
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        }
        catch (Exception e) {}      // really nothing to do about this, you just get the default "metal" appearance
        
            // window icon
            
        iconURL=getClass().getResource("/graphics/icon.png");
        image=new ImageIcon(iconURL).getImage();
        
            // the quit menu event and doc icon
            // this is only handled on some OSes, so we just ignore if
            // it errors out
        
        try {
            Desktop.getDesktop().setQuitHandler((event,response) -> app.stop());
            Taskbar.getTaskbar().setIconImage(image);
        }
        catch (Exception e) {}
        
            // create the window
        
        frame=new JFrame();
        
        frame.setTitle("WSJS Server");      
        frame.setIconImage(image);
        frame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        frame.setSize(WINDOW_WIDTH,WINDOW_HEIGHT);
        frame.setMinimumSize(new Dimension(WINDOW_WIDTH,WINDOW_HEIGHT));
        
        frame.setLayout(new GridBagLayout());
        
            // toolbar
            /*
        toolBar=new JToolBar();
        toolBar.setFloatable(false);
        toolBar.setPreferredSize(new Dimension(Integer.MAX_VALUE,TOOLBAR_HEIGHT));
        toolBar.setMinimumSize(new Dimension(Integer.MAX_VALUE,TOOLBAR_HEIGHT));
        toolBar.setMaximumSize(new Dimension(Integer.MAX_VALUE,TOOLBAR_HEIGHT));
        
        addToolButton("tool_setup",TOOL_BUTTON_ID_SETTINGS,"Settings");
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=0;
        gbc.gridwidth=2;
        gbc.weightx=1.0;
        gbc.weighty=0.0;
        frame.add(toolBar,gbc);
        */
            // user header
            
        userLabel=new GenericLabel("Users",false);

        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=0;
        gbc.weightx=0.0;
        gbc.weighty=0.0;
        frame.add(userLabel,gbc);
        
            // user List
            
        userPanel=new UserPanel();
        
        userScrollPane=new JScrollPane(userPanel); 
        userScrollPane.setBorder(BorderFactory.createMatteBorder(0,1,1,0,Color.black));
        userScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        userScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        userScrollPane.setPreferredSize(new Dimension(USER_WIDTH,100));
        userScrollPane.setMinimumSize(new Dimension(USER_WIDTH,HEADER_HEIGHT));
        userScrollPane.setMaximumSize(new Dimension(USER_WIDTH,Integer.MAX_VALUE));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=1;
        gbc.weightx=0.0;
        gbc.weighty=1.0;
        frame.add(userScrollPane,gbc);
        
            // status
            
        statusCanvas=new StatusCanvas();
        statusCanvas.setPreferredSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        statusCanvas.setMinimumSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        statusCanvas.setMaximumSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=2;
        gbc.weightx=0.0;
        gbc.weighty=0.0;
        frame.add(statusCanvas,gbc);

            // log header

        logLabel=new GenericLabel("Log",true);
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=1;
        gbc.gridy=0;
        gbc.weightx=1.0;
        gbc.weighty=0.0;
        frame.add(logLabel,gbc);
        
            // log text
            
        logPanel=new LogPanel();
        
        logScrollPane=new JScrollPane(logPanel); 
        logScrollPane.setBorder(BorderFactory.createMatteBorder(0,1,0,0,Color.black));
        logScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        logScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        logScrollPane.setPreferredSize(new Dimension(Integer.MAX_VALUE,100));
        logScrollPane.setMinimumSize(new Dimension(Integer.MAX_VALUE,HEADER_HEIGHT));
        logScrollPane.setMaximumSize(new Dimension(Integer.MAX_VALUE,Integer.MAX_VALUE));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=1;
        gbc.gridy=1;
        gbc.gridheight=2;
        gbc.weightx=1.0;
        gbc.weighty=1.0;
        frame.add(logScrollPane,gbc);

            // all the event listeners
            
        frame.addWindowListener(this);
        
            // show the window
            
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
        
            // start the status thread
            
        statusUpdater=new StatusUpdater(app);
        statusThread=new Thread(statusUpdater,("ws_status_thread"));
        statusThread.start();
    }
    
    public void stop()
    {
            // wait for status thread to die
        
        statusUpdater.shutdown();
        
        try {
            statusUpdater.join();
        }
        catch (InterruptedException e) {}      // jvm will need to clean this up, we are exiting
        
            // dispose window
            
        frame.dispose();
    }
    
        //
        // misc update mechanisms
        //
    
    public synchronized void log(String str)
    {
        logPanel.log(str);
    }
    
    public void updateUserList()
    {
        userPanel.update();
    }
    
    public void addStatusNetworkBytes(int byteCount)
    {
        statusCanvas.addStatusNetworkBytes(byteCount);
    }
    
    public void updateStatus()
    {
        statusCanvas.repaint();
    }
}
