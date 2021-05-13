package com.klinksoftware.wsjs.websockets;

import com.klinksoftware.wsjs.application.*;

import java.io.*;
import java.net.*;
import java.nio.*;
import java.security.*;
import java.util.*;

public class WebSocketClient implements Runnable
{
    public static final int MAX_MESSAGE_LENGTH=64*1024;
    public static final int GENERAL_STR_LENGTH=32;
    
    public static final short MESSAGE_TYPE_ENTITY_ENTER=0;
    public static final short MESSAGE_TYPE_ENTITY_LEAVE=1;
    public static final short MESSAGE_TYPE_ENTITY_LOGON_REQUEST=2;
    public static final short MESSAGE_TYPE_ENTITY_LOGON_REPLY=3;
    public static final short MESSAGE_TYPE_MAP_SYNC_REQUEST=4;
    public static final short MESSAGE_TYPE_MAP_SYNC_REPLY=5;
    public static final short MESSAGE_TYPE_ENTITY_UPDATE=6;
    public static final short MESSAGE_TYPE_ENTITY_CUSTOM=7;
    
    private static final short ERROR_UNKNOWN_PROJECT=-1;
    private static final short ERROR_PROJECT_VERSION=-2;
    private static final short ERROR_DUPLICATE_USERID=-3;
    private static final short ERROR_UNAUTHORIZED=-4;
    private static final String[] ERROR_STRINGS=
                        {
                            "Requested project is not running on this server",
                            "Server and player have different versions of project",
                            "Duplicate user name",
                            "User is unauthorized on this server"
                        };
    
    private final int               id;
    private boolean                 synched,inShutdown;
    private String                  userName,characterName,gameName,mapName,mapFileName;
    private byte[]                  socketInBytes,socketOutHeaderBytes;
    private final App               app;
    private Project                 project;
    private final WebSocketListener listener;
    private final Socket            socket;
    private InputStream             in;
    private OutputStream            out;
    
    public WebSocketClient(App app,WebSocketListener listener,int id,Socket socket)
    {
        this.app=app;
        this.project=null;              // no project attached yet
        this.listener=listener;
        this.id=id;
        this.socket=socket;
        
        userName=null;
        synched=false;              // this is for the state after a logon but before the first sync
        inShutdown=false;
        
        socketInBytes=new byte[MAX_MESSAGE_LENGTH];       // preallocate to reduce GC
        socketOutHeaderBytes=new byte[4];
    }
    
    public int getId()
    {
        return(id);
    }
    
    public String getUserName()
    {
        return(userName);
    }
    
    public boolean isSynched()
    {
        return(synched);
    }
    
        //
        // utilities
        //
    
    public String getStringFromByteBuffer(ByteBuffer byteBuf,int offset,int bufferLen)
    {
        int             n;
        byte            b;
        StringBuilder   strBuild;
        
        strBuild=new StringBuilder(bufferLen);
        
        for (n=0;n!=bufferLen;n++) {
            b=byteBuf.get(offset++);
            if (b==0) break;
            
            strBuild.append(Character.toString(b));     // we are only doing ascii here (it's &0x7F) so this is OK
        }
        
        return(strBuild.toString());
    }
    
    public void putStringInByteBuffer(ByteBuffer byteBuf,int offset,String str,int bufferLen)
    {
        int     n,len;
        
        len=str.length();
        if (len>bufferLen) len=bufferLen;
        
        for (n=0;n!=len;n++) {
            byteBuf.put(offset++,(byte)(str.codePointAt(n)&0x7F));   // we only handle simple ascii
        }
        
        for (n=len;n<bufferLen;n++) {
            byteBuf.put(offset++,(byte)0);
        }
    }
    
        //
        // read and write web socket messages
        //
    
    private byte[] readMessage() throws Exception
    {
        int             n,len,readLen,messageLen,lenByte,
                        keyOffset,dataLen,dataOffset;
        byte[]          decodedBytes;
        
            // wait for input, and then wait until
            // we get a single websocket message
            
        readLen=0;
        messageLen=-1;
        keyOffset=0;
        
        while (true) {
            len=in.read(socketInBytes,readLen,(MAX_MESSAGE_LENGTH-readLen));
            if (len<=0) return(null);
            
            readLen+=len;
            
                // only except single message binaries
                
            if (readLen>0) {
                if ((socketInBytes[0]&0xF)==0x8) return(null);          // client has closed connection with server
                if ((socketInBytes[0]&0x80)==0) return(null);           // these are multipart messages, clients don't send them, ignore
                if ((socketInBytes[0]&0xF)!=0x2) return(null);          // these are non binary messages, ignore
            }
            
                // have we reached the end of
                // the websocket message?

            if (messageLen==-1) {
                if (readLen>1) {
                    lenByte=(socketInBytes[1]&0xFF)-128;
                    if (lenByte<=125) {
                        messageLen=lenByte+6;       // 2 bytes at opening, 4 more for keys
                        keyOffset=2;
                    }
                    else {
                        if ((lenByte==126) && (readLen>3)) {
                            messageLen=(((socketInBytes[2]&0xFF)<<8)+(socketInBytes[3]&0xFF))+8;      // 2 bytes at opening, 2 more for 16 bit length, 4 more for keys
                            keyOffset=4;
                        }
                        if ((lenByte==127) && (readLen>9)) return(null);        // some enormous message that exceeds our 64K length, ignore
                    }
                }
            }
            
                // do we have the whole message?
                
            if (messageLen!=-1) {
                if (readLen>=messageLen) break;
            }
        }
        
            // stats
        
        app.addStatusNetworkBytes(readLen);
        
            // decode the message
            
        dataOffset=keyOffset+4;
        dataLen=messageLen-dataOffset;
        decodedBytes=new byte[dataLen];
            
        for (n=0;n!=dataLen;n++) {
            decodedBytes[n]=(byte)(socketInBytes[n+dataOffset]^socketInBytes[keyOffset+(n&0x3)]);
        }
        
        return(decodedBytes);
    }
    
    public void writeMessage(byte[] dataBytes) throws Exception
    {
        int             dataLen;
        
            // get data size
            
        dataLen=dataBytes.length;
        if (dataLen>MAX_MESSAGE_LENGTH) throw new Exception("Too much data, can only send 64K");
        
            // create the headers
        
        if (dataLen<=125) {
            socketOutHeaderBytes[0]=(byte)0x82;                // binary message
            socketOutHeaderBytes[1]=(byte)dataLen;             // server messages aren't masked, so just length
            out.write(socketOutHeaderBytes,0,2);
        }
        else {
            socketOutHeaderBytes[0]=(byte)0x82;            // binary message
            socketOutHeaderBytes[1]=(byte)126;             // 126 marks that the next two bytes are length (again, no mask on server messages)
            socketOutHeaderBytes[2]=(byte)((dataLen>>8)&0xFF);
            socketOutHeaderBytes[3]=(byte)(dataLen&0xFF);
            out.write(socketOutHeaderBytes,0,4);
        }
        
            // write out the data

        out.write(dataBytes,0,dataBytes.length);
        
            // stats
        
        app.addStatusNetworkBytes(((dataLen<=125)?2:4)+dataLen);
    }
    
        //
        // handshakes and logons
        //
    
    private boolean runHandShake() throws IOException
    {
        int             n,len,readLen;
        byte[]          bytes;
        String          httpRequest,key,acceptKey;
        String[]        lines;
        StringBuilder   strBuild;
        
            // handshake starts with an http transmission
            
        bytes=new byte[MAX_MESSAGE_LENGTH];
        readLen=0;
        
        while (true) {
            len=in.read(bytes,readLen,(MAX_MESSAGE_LENGTH-readLen));
            if (len<=0) break;
            
            readLen+=len;
            
                // have we reached \r\n\r\n which is
                // end of http transaction

            if (readLen>4) {
                if ((bytes[readLen-4]==13) && (bytes[readLen-3]==10) && (bytes[readLen-2]==13) && (bytes[readLen-1]==10)) break;
            }
        }
        
                    // stats
        
        app.addStatusNetworkBytes(readLen);
        
            // parse the http transaction, if we
            // don't have a get or it's less than 2 lines,
            // reject immediately
            
        httpRequest=new String(bytes,0,readLen,"UTF-8");
        lines=httpRequest.split("\r\n");
            
        if (lines.length<2) return(false);
        if (!lines[0].contains("GET")) return(false);
        
            // get the websocket key
            
        key=null;
        
        for (n=1;n!=lines.length;n++) {
            if (lines[n].startsWith("Sec-WebSocket-Key:")) {
                key=lines[n].substring(18).trim();
                break;
            }
        }
        
        if (key==null) return(false);
        
            // make the accept key
            
        try {    
            acceptKey=Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA-1").digest((key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").getBytes("UTF-8")));
        }
        catch (NoSuchAlgorithmException e) {
            app.log("Unable to exchange keys with client");
            return(false);
        }
        
            // the reply
            // this switches over to the binary websocket
            // protocol for all further messages
            
        strBuild=new StringBuilder(1024);
        strBuild.append("HTTP/1.1 101 Switching Protocols\r\n");
        strBuild.append("Connection: Upgrade\r\n");
        strBuild.append("Upgrade: websocket\r\n");
        strBuild.append("Sec-WebSocket-Accept: ");
        strBuild.append(acceptKey);
        strBuild.append("\r\n\r\n");
        
        bytes=strBuild.toString().getBytes("UTF-8");
        out.write(bytes,0,bytes.length);
        
            // stats
        
        app.addStatusNetworkBytes(bytes.length);
        
        return(true);
    }
    
    private boolean getLogonRequest()
    {
        int             errorId;
        String          projectName;
        byte[]          bytes;
        ByteBuffer      byteBuf;
        
            // get logon message
            
        try {
            bytes=readMessage();
            if (bytes==null) return(false);
        }
        catch (Exception e)
        {
            app.log("Unable to read logon message");
            return(false);
        }
        
            // if the logon message is the wrong
            // type, then it's an immediate failure
                
        byteBuf=ByteBuffer.wrap(bytes);
        
        if (byteBuf.getShort(0)!=MESSAGE_TYPE_ENTITY_LOGON_REQUEST) {
            app.log("Got bad logon message, type was: "+byteBuf.getShort(0));
            return(false);
        }
        
            // decode it
            
        userName=getStringFromByteBuffer(byteBuf,2,GENERAL_STR_LENGTH);
        characterName=getStringFromByteBuffer(byteBuf,34,GENERAL_STR_LENGTH);
        projectName=getStringFromByteBuffer(byteBuf,66,GENERAL_STR_LENGTH);
        gameName=getStringFromByteBuffer(byteBuf,98,GENERAL_STR_LENGTH);
        mapName=getStringFromByteBuffer(byteBuf,130,GENERAL_STR_LENGTH);
        mapFileName=getStringFromByteBuffer(byteBuf,162,GENERAL_STR_LENGTH);
        
            // no error yet
            
        errorId=0;
        
            // find project
            
        project=app.getProjectList().get(projectName);
        if (project==null) {
            errorId=ERROR_UNKNOWN_PROJECT;
        }
        
        errorId=ERROR_PROJECT_VERSION;
        
            // TODO -- AUTHORIZATION and duplicate names
        
            // reply user id, or a negative
            // number if unable to log on
         
        byteBuf=ByteBuffer.allocate(4);
        byteBuf.putShort(0,MESSAGE_TYPE_ENTITY_LOGON_REPLY);
        byteBuf.putShort(2,(errorId==0)?(short)id:(short)errorId);
        
        try {
            writeMessage(byteBuf.array());
        }
        catch (Exception e) {
            app.log("Unable to write logon reply");
            return(false);
        }
        
            // if we couldn't log on, nothing more to do
            // break out and tear down the client
            
        if (errorId!=0) {
            app.log("Rejecting: "+userName+"; reason: "+ERROR_STRINGS[(-errorId)-1]);
            userName=null;
            return(false);
        }
        
        return(true);
    }
    
        //
        // map syncing
        //
    
    private void handleMapSync()
    {
        ByteBuffer      byteBuf;
        
        byteBuf=ByteBuffer.allocate(3);
        byteBuf.putShort(0,MESSAGE_TYPE_MAP_SYNC_REPLY);
        byteBuf.put((byte)0);         // true/false, set to false for no sync (keep current values)
        sendMessage(byteBuf.array());
    }
    
        //
        // messages
        //
        
    private boolean handleMessages()
    {
        byte[]          bytes;
        ByteBuffer      byteBuf;
        
            // get any new message
            // if nothing available, then skip
            
        try {
            bytes=readMessage();
            if (bytes==null) return(false);         // socket has been closed
        }
        catch (Exception e)
        {
            if (inShutdown) return(false);          // if in shutdown, we are canceling this thread by closing the socket
            
            app.log("Unable to read message");
            return(false);
        }
        
            // check for the special sync message
            
        byteBuf=ByteBuffer.wrap(bytes);
        
        if (byteBuf.getShort(0)!=MESSAGE_TYPE_MAP_SYNC_REQUEST) {
            handleMapSync();
            return(true);
        }
        
            // pass message to other clients
        
        project.distributeMessageToOtherClients(this,bytes);
        
        return(true);
    }
    
    public boolean sendMessage(byte[] msg)
    {
        try {
            writeMessage(msg);
        }
        catch (Exception e) {
            app.log("Unable to write message");
            return(false);
        }
        
        return(true);
    }
    
    private void distributeEnterMessage()
    {
        ByteBuffer      byteBuf;
        
        try {
            byteBuf=ByteBuffer.allocate(GENERAL_STR_LENGTH+4);
            byteBuf.putShort(0,MESSAGE_TYPE_ENTITY_ENTER);
            byteBuf.putShort(2,(short)id);
            putStringInByteBuffer(byteBuf,4,userName,GENERAL_STR_LENGTH);

            project.distributeMessageToOtherClients(this,byteBuf.array());    
        }
        catch (Exception e)
        {
            app.log("Unable to send enter message");
        }
    }
    
    private void distributeLeaveMessage()
    {
        ByteBuffer      byteBuf;
        
        try {
            byteBuf=ByteBuffer.allocate(4);
            byteBuf.putShort(0,MESSAGE_TYPE_ENTITY_LEAVE);
            byteBuf.putShort(2,(short)id);

            project.distributeMessageToOtherClients(this,byteBuf.array());    
        }
        catch (Exception e)
        {
            app.log("Unable to send leave message");
        }
    }
    
        //
        // client mainline
        //
    
    public void shutdown()
    {
        inShutdown=true;
        
            // closing the socket will cancel this thread
        
        try {
            socket.close();
        }
        catch(Exception e) {    // socket already closed, not much to do here
        }
    }
    
    @Override
    public void run()
    {
        userName=null;
        
        try {
            in=socket.getInputStream();
            out=socket.getOutputStream();
            
                // the first message in will be a HTTP
                // handshake that we need to change to
                // a websocket call
        
            if (!runHandShake()) return;
            
                // first message from client should be
                // a logon request
                
            if (!getLogonRequest()) return;
            
                // if a good log on, we add to the clients
                // for that project
            
            project.addClient(this);
                
            app.log("Client connected: "+project.getName()+"."+userName+" (id:"+Integer.toString(id)+")");
            app.updateUsers();
            
                // push other players
                
            project.sendCurrentPlayerListToSelf(this);
            
                // distribute enter to other players
                
            distributeEnterMessage();
            
                // and then it's waiting for client messages
                // if the client closes, then shut it down and exit
            
            while (true) {
                if (inShutdown) break;
                if (!handleMessages()) break;
            }    
        }
        catch (IOException e)
        {
            app.log("IO exception on client socket");
        }
        finally {
            if (userName!=null) distributeLeaveMessage();
            
            try {
                socket.close();
            }
            catch (Exception e2)
            {
                app.log("Unable to close client socket");
            }
            
            project.removeClient(this);
            
            if (userName!=null) {
                app.log("Client disconnected: "+project.getName()+"."+userName+" (id:"+Integer.toString(id)+")");
                app.updateUsers();
            }
        }
    }
    
}
