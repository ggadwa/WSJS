package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.*;
import com.klinksoftware.wsjs.websockets.*;

import java.util.*;
import java.awt.*;
import java.awt.event.*;
import java.net.*;
import javax.swing.*;

public class AppWindow implements WindowListener
{
    public static final int         WINDOW_WIDTH=1000;
    public static final int         WINDOW_HEIGHT=600;
    public static final int         TOOLBAR_HEIGHT=38;
    public static final int         HEADER_HEIGHT=22;
    public static final int         USER_WIDTH=250;
    public static final int         LOG_HEIGHT=200;
    public static final int         STATUS_CANVAS_HEIGHT=USER_WIDTH;
    
    private final App       app;
    
    private JFrame          frame;
    private JToolBar        toolBar;
    private JComboBox       projectCombo;
    private JLabel          gameLabel,mapLabel,userLabel,logLabel;
    private JScrollPane     gameScrollPane,mapScrollPane,userScrollPane,logScrollPane;
    private LogPanel        logPanel;
    private GamePanel       gamePanel;
    private MapPanel        mapPanel;
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
        // toolbar
        //

    private void toolBarClick(int buttonId)
    {
        /*
        switch (buttonId) {
            case TOOL_BUTTON_ID_SETTINGS:
                (new SettingsDialog()).open(frame);
                break;
        }
*/
    }
    
    private void addToolButton(String iconName,int buttonId,String toolTipText)
    {
        URL                 iconURL;
        JButton             button;
        
        iconURL=getClass().getResource("/Graphics/"+iconName+".png");
        
        button=new JButton();
        button.setBorder(BorderFactory.createEmptyBorder());
        button.setFocusable(false);
        button.setIcon(new ImageIcon(iconURL));
        button.setToolTipText(toolTipText);
        button.addActionListener(e->toolBarClick(buttonId));
        
        toolBar.add(button);
    }
    
    private void toolBarProjectComboChange()
    {
        Project         project;
        
        project=app.getProjectList().get((String)projectCombo.getSelectedItem());
        gamePanel.update(project);
        mapPanel.update(project);
        userPanel.update(project);
    }
    
    private void addToolProjectCombo()
    {
        projectCombo=new JComboBox(app.getProjectList().getListAsStringArray());
        projectCombo.setPreferredSize(new Dimension(200,30));
        projectCombo.setMaximumSize(new Dimension(200,30));
        projectCombo.addActionListener(e->toolBarProjectComboChange());
        
        toolBar.add(projectCombo);        
    }
    
        //
        // start and stop main window
        //
    
    public void start()
    {
        URL                 iconURL;
        Image               image;
        GridBagConstraints  gbc;
        Project             project;
        
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
        
        frame.setTitle("WSJS");      
        frame.setIconImage(image);
        frame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        frame.setSize(WINDOW_WIDTH,WINDOW_HEIGHT);
        frame.setMinimumSize(new Dimension(WINDOW_WIDTH,WINDOW_HEIGHT));
        
        frame.setLayout(new GridBagLayout());
        
            // toolbar

        toolBar=new JToolBar();
        toolBar.setFloatable(false);
        toolBar.setPreferredSize(new Dimension(Integer.MAX_VALUE,TOOLBAR_HEIGHT));
        toolBar.setMinimumSize(new Dimension(Integer.MAX_VALUE,TOOLBAR_HEIGHT));
        toolBar.setMaximumSize(new Dimension(Integer.MAX_VALUE,TOOLBAR_HEIGHT));
        
        addToolProjectCombo();
        //addToolButton("tool_setup",0,"Settings");
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=0;
        gbc.gridwidth=3;
        gbc.weightx=1.0;
        gbc.weighty=0.0;
        frame.add(toolBar,gbc);
            
            // game header
            
        gameLabel=new GenericLabel("Games",false);

        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=1;
        gbc.weightx=0.0;
        gbc.weighty=0.0;
        frame.add(gameLabel,gbc);
        
            // game List
            
        gamePanel=new GamePanel();
        
        gameScrollPane=new JScrollPane(gamePanel); 
        gameScrollPane.setBorder(BorderFactory.createMatteBorder(0,0,0,0,Color.black));
        gameScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        gameScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        gameScrollPane.setPreferredSize(new Dimension(USER_WIDTH,100));
        gameScrollPane.setMinimumSize(new Dimension(USER_WIDTH,HEADER_HEIGHT));
        gameScrollPane.setMaximumSize(new Dimension(USER_WIDTH,Integer.MAX_VALUE));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=2;
        gbc.weightx=0.0;
        gbc.weighty=1.0;
        frame.add(gameScrollPane,gbc);
        
            // map header
            
        mapLabel=new GenericLabel("Maps",false);

        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=3;
        gbc.weightx=0.0;
        gbc.weighty=0.0;
        frame.add(mapLabel,gbc);
        
            // map List
            
        mapPanel=new MapPanel();
        
        mapScrollPane=new JScrollPane(mapPanel); 
        mapScrollPane.setBorder(BorderFactory.createMatteBorder(0,0,0,0,Color.black));
        mapScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        mapScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        mapScrollPane.setPreferredSize(new Dimension(USER_WIDTH,100));
        mapScrollPane.setMinimumSize(new Dimension(USER_WIDTH,HEADER_HEIGHT));
        mapScrollPane.setMaximumSize(new Dimension(USER_WIDTH,Integer.MAX_VALUE));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=4;
        gbc.weightx=0.0;
        gbc.weighty=1.0;
        frame.add(mapScrollPane,gbc);
        
            // user header
            
        userLabel=new GenericLabel("Users",true);

        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=1;
        gbc.gridy=1;
        gbc.weightx=0.0;
        gbc.weighty=0.0;
        frame.add(userLabel,gbc);
        
            // user List
            
        userPanel=new UserPanel();
        
        userScrollPane=new JScrollPane(userPanel); 
        userScrollPane.setBorder(BorderFactory.createMatteBorder(0,1,0,0,Color.black));
        userScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        userScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        userScrollPane.setPreferredSize(new Dimension(USER_WIDTH,100));
        userScrollPane.setMinimumSize(new Dimension(USER_WIDTH,HEADER_HEIGHT));
        userScrollPane.setMaximumSize(new Dimension(USER_WIDTH,Integer.MAX_VALUE));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=1;
        gbc.gridy=2;
        gbc.gridheight=3;
        gbc.weightx=0.0;
        gbc.weighty=1.0;
        frame.add(userScrollPane,gbc);
        
            // status header
            
        userLabel=new GenericLabel("Status",true);

        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=2;
        gbc.gridy=1;
        gbc.weightx=0.0;
        gbc.weighty=0.0;
        frame.add(userLabel,gbc);
        
            // status
            
        statusCanvas=new StatusCanvas();
        statusCanvas.setPreferredSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        statusCanvas.setMinimumSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        statusCanvas.setMaximumSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=2;
        gbc.gridy=2;
        gbc.gridheight=3;
        gbc.weightx=0.0;
        gbc.weighty=1.0;
        frame.add(statusCanvas,gbc);

            // log header

        logLabel=new GenericLabel("Log",true);
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=5;
        gbc.gridwidth=3;
        gbc.weightx=1.0;
        gbc.weighty=0.0;
        frame.add(logLabel,gbc);
        
            // log text
            
        logPanel=new LogPanel();
        
        logScrollPane=new JScrollPane(logPanel); 
        logScrollPane.setBorder(BorderFactory.createMatteBorder(0,0,0,0,Color.black));
        logScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        logScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        logScrollPane.setPreferredSize(new Dimension(Integer.MAX_VALUE,LOG_HEIGHT));
        logScrollPane.setMinimumSize(new Dimension(Integer.MAX_VALUE,LOG_HEIGHT));
        logScrollPane.setMaximumSize(new Dimension(Integer.MAX_VALUE,Integer.MAX_VALUE));
        
        gbc=new GridBagConstraints();
        gbc.fill=GridBagConstraints.BOTH;
        gbc.gridx=0;
        gbc.gridy=6;
        gbc.gridwidth=3;
        gbc.weightx=1.0;
        gbc.weighty=1.0;
        frame.add(logScrollPane,gbc);

            // all the event listeners
            
        frame.addWindowListener(this);
        
            // show the window
            
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
        
            // update the windows
            
        project=app.getProjectList().get((String)projectCombo.getSelectedItem());
        gamePanel.update(project);
        mapPanel.update(project);
        
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
    
    public void updateUserList(ArrayList<WebSocketClient> clients)
    {
        //userPanel.update(clients);
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
