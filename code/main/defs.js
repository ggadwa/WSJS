"use strict";

//
// points and rects objects
//

function wsPoint(x,y,z)
{
    this.x=x;
    this.y=y;
    this.z=z;
    
    this.set=function(xSet,ySet,zSet)
                {
                    this.x=xSet;
                    this.y=ySet;
                    this.z=zSet;
                };
                
    this.move=function(xAdd,yAdd,zAdd)
                {
                    this.x+=xAdd;
                    this.y+=yAdd;
                    this.z+=zAdd;
                };
               
    this.noSquareDistance=function(pt)
                {
                    var px=this.x-pt.x;
                    var py=this.y-pt.y;
                    var pz=this.z-pt.z;
                    return((px*px)+(py*py)+(pz*pz));
                };
                
    this.noSquareDistanceByTriplet=function(kx,ky,kz)
                {
                    var px=this.x-kx;
                    var py=this.y-ky;
                    var pz=this.z-kz;
                    return((px*px)+(py*py)+(pz*pz));
                };
                
    this.distance=function(pt)
                {
                    return(Math.sqrt(this.noSquareDistance(pt)));
                };
                
    this.distanceByTriplet=function(kx,ky,kz)
                {
                    return(Math.sqrt(this.noSquareDistanceByTriplet(kx,ky,kz)));
                };
    
    this.toVec3=function()
                {
                    return(vec3.fromValues(this.x,this.y,this.z));
                };
    
    this.copy=function()
                {
                    return(new wsPoint(this.x,this.y,this.z));
                };
}

function ws2DPoint(x,y)
{
    this.x=Math.floor(x);
    this.y=Math.floor(y);
    
    this.set=function(xSet,ySet)
                {
                    this.x=Math.floor(xSet);
                    this.y=Math.floor(ySet);
                };
                
    this.move=function(xAdd,yAdd)
                {
                    this.x+=xAdd;
                    this.y+=yAdd;
                };
    
    this.copy=function()
                {
                    return(new ws2DPoint(this.x,this.y));
                };
}

function wsAngle(x,y,z)
{
    this.x=x;
    this.y=y;
    this.z=z;
    
    this.set=function(xSet,ySet,zSet)
                {
                    this.x=xSet;
                    this.y=ySet;
                    this.z=zSet;
                };
                
    this.copy=function()
                {
                    return(new wsAngle(this.x,this.y,this.z));
                };
}

function wsLine(p1,p2)
{
    this.p1=p1;
    this.p2=p2;
}

function wsBound(value1,value2)
{
    if (value1<value2) {
        this.min=value1;
        this.max=value2;
    }
    else {
        this.min=value2;
        this.max=value1;
    }
    
    this.add=function(addValue)
                {
                    this.min+=addValue;
                    this.max+=addValue;
                };
                
    this.getMidPoint=function()
                {
                    return((this.max+this.min)/2);
                };
                
    this.getSize=function()
                {
                    return(this.max-this.min);
                };
                
    this.adjust=function(value)
                {
                    if (value<this.min) this.min=value;
                    if (value>this.max) this.max=value;
                };
                
    this.copy=function()
                {
                    return(new wsBound(this.min,this.max));
                };
}

function wsRect(lft,top,rgt,bot)
{
    this.lft=lft;
    this.top=top;
    this.rgt=rgt;
    this.bot=bot;
    
    this.overlap=function(rect)
                {
                    if (this.lft>=rect.rgt) return(false);
                    if (this.rgt<=rect.lft) return(false);
                    if (this.top>=rect.bot) return(false);
                    return(!(this.bot<=rect.top));
                };
    
    this.pointIn=function(x,y)
                {
                    return((x>=this.lft) && (x<this.rgt) && (y>=this.top) && (y<this.bot));     
                };
    
    this.move=function(x,y)
                {
                    this.lft+=x;
                    this.rgt+=x;
                    this.top+=y;
                    this.bot+=y;
                };
                
    this.copy=function()
                {
                    return(new wsRect(this.lft,this.top,this.rgt,this.bot));
                };
}

function wsPlane(a,b,c,d)
{
    this.a=a;
    this.b=b;
    this.c=c;
    this.d=d;
    
    this.normalize=function()
    {
        var f=Math.sqrt((this.a*this.a)+(this.b*this.b)+(this.c*this.c));
        if (f===0.0) return;
        this.a/=f;
        this.b/=f;
        this.c/=f;
        this.d/=f;
    };
    
    this.boundBoxOutsidePlane=function(xBound,yBound,zBound)
    {
        if (((this.a*xBound.min)+(this.b*yBound.min)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.min)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.min)+(this.b*yBound.max)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.max)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.min)+(this.b*yBound.min)+(this.c*zBound.max)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.min)+(this.c*zBound.max)+this.d)>0.0) return(true);
		if (((this.a*xBound.min)+(this.b*yBound.max)+(this.c*zBound.max)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.max)+(this.c*zBound.max)+this.d)>0.0) return(true);
        
        return(false);
    };
}

//
// colors
//

function wsColor(r,g,b)
{
    this.r=r;
    this.g=g;
    this.b=b;
    
    this.set=function(r,g,b)
                {
                    this.r=r;
                    this.g=g;
                    this.b=b;
                };
                
    this.add=function(col)
                {
                    this.r+=col.r;
                    this.g+=col.g;
                    this.b+=col.b;
                };
    
    this.attenuate=function(att)
                {
                    return(new wsColor((this.r*att),(this.g*att),(this.b*att)));
                };
                
    this.fixOverflow=function()
                {
                    if (this.r>1.0) this.r=1.0;
                    if (this.r<0.0) this.r=0.0;
                    if (this.g>1.0) this.g=1.0;
                    if (this.g<0.0) this.g=0.0;
                    if (this.b>1.0) this.b=1.0;
                    if (this.b<0.0) this.b=0.0;
                };
}
