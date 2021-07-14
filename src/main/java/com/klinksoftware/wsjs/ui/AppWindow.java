package com.klinksoftware.wsjs.ui;

import com.klinksoftware.wsjs.application.*;

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
    public static final int         LOG_HEIGHT=500;
    public static final int         STATUS_CANVAS_HEIGHT=100;
    
    private final App       app;
    
    private JFrame          frame;
    private JToolBar        toolBar;
    private JComboBox       projectCombo;
    private JLabel          gameLabel,userLabel,statusLabel,logLabel;
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
        addToolProjectCombo();
        //addToolButton("tool_setup",0,"Settings");
        frame.add(toolBar,new GridBagConstraints(0,0,2,1,1.0,0.0,GridBagConstraints.CENTER,GridBagConstraints.HORIZONTAL,new Insets(0,0,0,0),0,0));

            // game header
            
        gameLabel=new GradientLabel("No game/map has been set yet",new Color(255,196,255),new Color(255,128,255),false);
        frame.add(gameLabel,new GridBagConstraints(0,1,2,1,1.0,0.0,GridBagConstraints.CENTER,GridBagConstraints.HORIZONTAL,new Insets(0,0,0,0),0,0));
        
            // user header
            
        userLabel=new GradientLabel("Users",new Color(196,196,255),new Color(128,128,255),false);
        frame.add(userLabel,new GridBagConstraints(0,2,1,1,0.0,0.0,GridBagConstraints.CENTER,GridBagConstraints.HORIZONTAL,new Insets(0,0,0,0),0,0));
        
            // user List
            
        userPanel=new UserPanel();
        
        userScrollPane=new JScrollPane(userPanel); 
        userScrollPane.setBorder(BorderFactory.createMatteBorder(0,0,0,0,Color.black));
        userScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        userScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        userScrollPane.setPreferredSize(new Dimension(USER_WIDTH,Integer.MAX_VALUE));
        userScrollPane.setMinimumSize(new Dimension(USER_WIDTH,Integer.MAX_VALUE));
        userScrollPane.setMaximumSize(new Dimension(USER_WIDTH,Integer.MAX_VALUE));
        frame.add(userScrollPane,new GridBagConstraints(0,3,1,1,0.0,1.0,GridBagConstraints.CENTER,GridBagConstraints.VERTICAL,new Insets(0,0,0,0),0,0));
        
            // status header
            
        statusLabel=new GradientLabel("Status",new Color(196,196,255),new Color(128,128,255),false);
        frame.add(statusLabel,new GridBagConstraints(0,4,1,1,0.0,0.0,GridBagConstraints.CENTER,GridBagConstraints.HORIZONTAL,new Insets(0,0,0,0),0,0));
        
            // status
            
        statusCanvas=new StatusCanvas();
        statusCanvas.setPreferredSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        statusCanvas.setMinimumSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        statusCanvas.setMaximumSize(new Dimension(USER_WIDTH,STATUS_CANVAS_HEIGHT));
        frame.add(statusCanvas,new GridBagConstraints(0,5,1,1,0.0,0.0,GridBagConstraints.CENTER,GridBagConstraints.VERTICAL,new Insets(0,0,0,0),0,0));

            // log header

        logLabel=new GradientLabel("Log",new Color(196,196,255),new Color(128,128,255),true);
        frame.add(logLabel,new GridBagConstraints(1,2,1,1,0.0,0.0,GridBagConstraints.CENTER,GridBagConstraints.HORIZONTAL,new Insets(0,0,0,0),0,0));
        
            // log text
            
        logPanel=new LogPanel();
        
        logScrollPane=new JScrollPane(logPanel);
        logScrollPane.setBorder(BorderFactory.createMatteBorder(0,1,0,0,Color.black));
        logScrollPane.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS);
        logScrollPane.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        logScrollPane.setPreferredSize(new Dimension(Integer.MAX_VALUE,LOG_HEIGHT));
        logScrollPane.setMinimumSize(new Dimension(Integer.MAX_VALUE,LOG_HEIGHT));
        logScrollPane.setMaximumSize(new Dimension(Integer.MAX_VALUE,Integer.MAX_VALUE));
        frame.add(logScrollPane,new GridBagConstraints(1,3,1,3,0.0,1.0,GridBagConstraints.CENTER,GridBagConstraints.BOTH,new Insets(0,0,0,0),0,0));

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
    
    public void updateGame()
    {
        Project         project;
        
        project=app.getProjectList().get((String)projectCombo.getSelectedItem());
        gameLabel.setText(project.getGameName()+"/"+project.getMapName());
    }
    
    public void updateUsers()
    {
        userPanel.update(app.getProjectList().get((String)projectCombo.getSelectedItem()));
    }
    
    public void updateStatus()
    {
        statusCanvas.repaint();
    }
    
    public void addStatusNetworkBytes(int byteCount)
    {
        statusCanvas.addStatusNetworkBytes(byteCount);
    }
}
