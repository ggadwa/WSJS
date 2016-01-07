"use strict";

//
// generate room closet class
//

function GenRoomClosetObject(view,map,room,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;
    
        // build the closet cube
        
    this.createClosetCube=function(map,xBound,yBound,zBound)
    {
        var n,idx;
        var vertexList,indexes;
        var bitmap=map.getBitmapById(TEXTURE_CLOSET);
        
            // center point for normal creation
            
        var centerPoint=new wsPoint(xBound.getMidPoint(),yBound.getMidPoint(),zBound.getMidPoint());

            // the walls

        idx=0;
        vertexList=meshUtility.createMapVertexList(24);

        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min); 
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);        
        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);     
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);    
        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);  
        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);

        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);

        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);

        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);

        indexes=new Uint16Array(24);

        for (n=0;n!==24;n++) {
            indexes[n]=n;
        }
        
        meshUtility.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);
        
        map.addMesh(new MapMeshObject(bitmap,vertexList,indexes,MESH_FLAG_ROOM_WALL));

            // ceiling
            
        idx=0;
        vertexList=meshUtility.createMapVertexList(6);

        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.min,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.min,zBound.max);
        
        indexes=new Uint16Array(6);

        for (n=0;n!==6;n++) {
            indexes[n]=n;
        }
        
        meshUtility.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);
        
        map.addMesh(new MapMeshObject(bitmap,vertexList,indexes,MESH_FLAG_ROOM_CEILING));

            // floor
            
        idx=0;
        vertexList=meshUtility.createMapVertexList(6);

        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.min);
        vertexList[idx++].position.set(xBound.max,yBound.max,zBound.max);
        vertexList[idx++].position.set(xBound.min,yBound.max,zBound.max);

        indexes=new Uint16Array(6);

        for (n=0;n!==6;n++) {
            indexes[n]=n;
        }
        
        meshUtility.buildVertexListNormals(vertexList,indexes,centerPoint,true);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);
        
        map.addMesh(new MapMeshObject(bitmap,vertexList,indexes,MESH_FLAG_ROOM_FLOOR));
    };

        // closet mainline
        
    this.addCloset=function()
    {
        var x,z;
        var connectLineIdx,connectType,connectOffset,closetLen;
        var xClosetBound,zClosetBound;
        
        var room=this.room;
        var piece=room.piece;
        var nConnectLine=piece.connectLines.length;
        
            // box sizing
            
        var xAdd=Math.floor(room.xBound.getSize()/5);
        var zAdd=Math.floor(room.zBound.getSize()/5);
        
            // get the Y bound
            
        var yClosetBound=room.yBound.copy();
        if (room.hasStories) {
            if (genRandom.random()>0.75) yClosetBound.add(-(room.yBound.getSize()+ROOM_FLOOR_DEPTH));
        }
        
            // initial connection try
            
        connectLineIdx=Math.floor(nConnectLine*this.genRandom.random());
        closetLen=this.genRandom.randomInt(1,5);
        
            // try a number of times
            
        var tryCount=0;
        
        while (tryCount<10) {
            
                // find a connect line starting point
                
            connectType=piece.getConnectType(connectLineIdx);
            connectOffset=piece.getConnectTypeOffset(connectLineIdx,room.xBound,room.zBound);
            
            x=connectOffset.x+room.xBound.min;
            z=connectOffset.z+room.zBound.min;
            
                // get the box
                
            switch (connectType) {
                case piece.CONNECT_TYPE_LEFT:
                    xClosetBound=new wsBound((x-xAdd),x);
                    zClosetBound=new wsBound(z,(z+zAdd));
                    break;
                case piece.CONNECT_TYPE_TOP:
                    xClosetBound=new wsBound(x,(x+xAdd));
                    zClosetBound=new wsBound((z-zAdd),z);
                    break;
                case piece.CONNECT_TYPE_RIGHT:
                    xClosetBound=new wsBound(x,(x+xAdd));
                    zClosetBound=new wsBound(z,(z+zAdd));
                    break;
                case piece.CONNECT_TYPE_BOTTOM:
                    xClosetBound=new wsBound(x,(x+xAdd));
                    zClosetBound=new wsBound(z,(z+zAdd));
                    break;
            }
            
                // check if OK
                
            if (this.map.boxBoundCollision(xClosetBound,null,zClosetBound,MESH_FLAG_ROOM_WALL)!==-1) {
                connectLineIdx++;
                if (connectLineIdx>=nConnectLine) connectLineIdx=0;
                tryCount++;
                continue;
            }
            
                // add a box
            
            this.createClosetCube(map,xClosetBound,yClosetBound,zClosetBound);
            map.addOverlayCloset(xClosetBound,zClosetBound);
            
                // more length?
                
            closetLen--;
            if (closetLen===0) break;
        }
        
    };

}
