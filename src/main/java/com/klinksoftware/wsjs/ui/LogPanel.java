package com.klinksoftware.wsjs.ui;

import java.awt.*;
import javax.swing.*;
import javax.swing.text.*;

public class LogPanel extends JTextArea
{
    public static final int         MAX_LOG_LINE=500;
    
    public LogPanel()
    {
        super(80,100);
        
        super.setEditable(false);
        super.setFont(new Font("Courier New",Font.PLAIN,14));
        super.setLineWrap(false);
    }
    
    public void log(String str)
    {
            // only have up to MAX_LOG_LINE lines
        
        if (getLineCount()>MAX_LOG_LINE) {
            try {
                replaceRange(null,0,getLineEndOffset(0));
            }
            catch (BadLocationException e) {
                // eat this one, there should never be a time when this can't happen
            }
        }

            // append the log

        append(str);
        append("\n");
        setCaretPosition(getDocument().getLength());

        System.out.println(str);            // always write logs to standard out, just in case
    }
}
