"use strict";

//
// constants
//

var GEN_BITMAP_TEXTURE_SIZE=512;

var GEN_BITMAP_TYPE_BRICK_STACK=0;
var GEN_BITMAP_TYPE_BRICK_RANDOM=1;
var GEN_BITMAP_TYPE_STONE=2;
var GEN_BITMAP_TYPE_TILE_SIMPLE=3;
var GEN_BITMAP_TYPE_TILE_COMPLEX=4;
var GEN_BITMAP_TYPE_TILE_SMALL=5;
var GEN_BITMAP_TYPE_METAL=6;
var GEN_BITMAP_TYPE_CONCRETE=7;
var GEN_BITMAP_TYPE_WOOD_PLANK=8;
var GEN_BITMAP_TYPE_WOOD_BOX=9;
var GEN_BITMAP_TYPE_SKIN=10;

var GEN_BITMAP_TILE_STYLE_BORDER=0;
var GEN_BITMAP_TILE_STYLE_CHECKER=1;
var GEN_BITMAP_TILE_STYLE_STRIPE=2;

//
// brick/rock bitmaps
//

function genBitmapGenerateBrick(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,darkenFactor,segments)
{
    var n,rect;
    var drawBrickColor,drawEdgeColor,f;
    
        // some random values
    
    var groutColor=this.genBitmapUtility.getRandomGreyColor(0.6,0.7);
    var brickColor=this.genBitmapUtility.getRandomColor([0.3,0.2,0.2],[1.0,0.8,0.8]);
    var edgeColor=this.genBitmapUtility.darkenColor(brickColor,0.8);
    
        // clear canvases
        
    this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(groutColor,1.0));
    this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
    
    this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

        // draw the bricks
        
    for (n=0;n!==segments.length;n++) {
        rect=segments[n];
        
        f=1.0;
        if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken bricks that fall off edges
            f=this.genRandom.random()+darkenFactor;
            if (f>1.0) f=1.0;
        }
        
        drawBrickColor=this.genBitmapUtility.darkenColor(brickColor,f);
        drawEdgeColor=this.genBitmapUtility.darkenColor(edgeColor,f);

        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),edgeSize,drawBrickColor,drawEdgeColor,true);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,rect.lft,rect.top,(rect.rgt-paddingSize),(rect.bot-paddingSize),darkenFactor,1.0,0.4);
    }
    
        // finish with the specular
        
    this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
}

//
// stone bitmaps
//

function genBitmapGenerateStone(bitmapCTX,normalCTX,specularCTX,wid,high)
{
    var n,rect,edgeSize;
    var drawStoneColor,drawEdgeColor,f;
    var x,y,particleWid,particleHigh,particleDensity;
    
        // some random values
    
    var groutColor=this.genBitmapUtility.getRandomGreyColor(0.3,0.4);
    var stoneColor=this.genBitmapUtility.getRandomColor([0.5,0.4,0.3],[0.8,0.6,0.6]);
    var edgeColor=this.genBitmapUtility.darkenColor(stoneColor,0.9);
    
    var segments=this.genBitmapUtility.createRandomSegments(wid,high);
    var darkenFactor=0.5;
    
        // clear canvases
        
    this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(groutColor,1.0));
    this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.9);
    
    this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);

        // draw the stones
        
    for (n=0;n!==segments.length;n++) {
        rect=segments[n];
        
        f=1.0;
        if ((rect.lft>=0) && (rect.top>=0) && (rect.rgt<=wid) && (rect.bot<=high)) {        // don't darken stones that fall off edges
            f=this.genRandom.random()+darkenFactor;
            if (f>1.0) f=1.0;
        }
        
        drawStoneColor=this.genBitmapUtility.darkenColor(stoneColor,f);
        drawEdgeColor=this.genBitmapUtility.darkenColor(edgeColor,f);
    
        edgeSize=this.genRandom.randomInt(5,12);     // new edge size as stones aren't the same

        this.genBitmapUtility.draw3DComplexRect(bitmapCTX,normalCTX,rect.lft,rect.top,rect.rgt,rect.bot,edgeSize,drawStoneColor,drawEdgeColor,true);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,rect.lft,rect.top,rect.rgt,rect.bot,darkenFactor,1.0,0.4);
        
            // possible marks
        
        if (this.genRandom.randomInt(0,100)>50) {
            particleWid=this.genRandom.randomInt(50,30);
            particleHigh=this.genRandom.randomInt(50,30);
            particleDensity=this.genRandom.randomInt(150,50);

            x=this.genRandom.randomInt((rect.lft+edgeSize),((rect.rgt-rect.lft)-(edgeSize*2)));
            y=this.genRandom.randomInt((rect.top+edgeSize),((rect.bot-rect.top)-(edgeSize*2)));

            this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.6,particleDensity,true);
        }
    }
    
        // finish with the specular
        
    this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.3);
}

//
// tile bitmaps
//

function genBitmapGenerateTileInner(bitmapCTX,normalCTX,lft,top,rgt,bot,tileColor,tileStyle,splitCount,edgeSize,complex)
{
    var x,y,dLft,dTop,dRgt,dBot,tileWid,tileHigh;
    var col;

        // tile style

    tileStyle=this.genRandom.randomInt(0,3);

        // splits

    tileWid=Math.floor((rgt-lft)/splitCount);
    tileHigh=Math.floor((bot-top)/splitCount);

    for (y=0;y!==splitCount;y++) {
        
        dTop=top+(tileHigh*y);
        dBot=dTop+tileHigh;
        if (y===(splitCount-1)) dBot=bot;

        dLft=lft;

        for (x=0;x!==splitCount;x++) {
            
            dLft=lft+(tileWid*x);
            dRgt=dLft+tileWid;
            if (x===(splitCount-1)) dRgt=rgt;

                // sometimes a tile piece is a recursion to
                // another tile set

            if ((complex) && (this.genRandom.random()<0.25)) {
                tileStyle=this.genRandom.randomInt(0,3);
                this.generateTileInner(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,tileColor,tileStyle,2,edgeSize,false);
                continue;
            }

                // make the tile

            col=tileColor[0];

            switch (tileStyle) {

                case GEN_BITMAP_TILE_STYLE_BORDER:
                    if ((x!==0) && (y!==0)) col=tileColor[1];
                    break;

                case GEN_BITMAP_TILE_STYLE_CHECKER:
                    col=tileColor[(x+y)&0x1];
                    break;

                case GEN_BITMAP_TILE_STYLE_STRIPE:
                    if ((x&0x1)!==0) col=tileColor[1];
                    break;

            }

            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,dLft,dTop,dRgt,dBot,edgeSize,col,[0.0,0.0,0.0]);

                // possible design

            if ((complex) && (this.genRandom.random()<0.25)) {
                this.genBitmapUtility.draw3DOval(bitmapCTX,normalCTX,(dLft+edgeSize),(dTop+edgeSize),(dRgt-edgeSize),(dBot-edgeSize),5,null,[0.0,0.0,0.0]);
            }
        }
    }
}

function genBitmapGenerateTile(bitmapCTX,normalCTX,specularCTX,wid,high,complex,small)
{
        // some random values
    
    var splitCount,tileStyle;
    var tileColor=[];
    
    if (!small) {
        splitCount=this.genRandom.randomInt(2,2);
        tileStyle=this.genRandom.randomInt(0,3);
        tileColor[0]=this.genBitmapUtility.getRandomColor([0.3,0.3,0.4],[0.6,0.6,0.7]);
        tileColor[1]=this.genBitmapUtility.darkenColor(tileColor[0],0.8);
    }
    else {
        splitCount=8;
        tileStyle=GEN_BITMAP_TILE_STYLE_CHECKER;
        tileColor[0]=this.genBitmapUtility.getRandomColor([0.5,0.3,0.3],[0.8,0.6,0.6]);
        tileColor[1]=this.genBitmapUtility.darkenColor(tileColor[0],0.9);
    }
    
        // clear canvases
        
    this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(tileColor,1.0));
    this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
		// original splits
        
    this.generateTileInner(bitmapCTX,normalCTX,0,0,wid,high,tileColor,tileStyle,splitCount,(small?2:5),complex);

		// tile noise
        
    this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,1.1,1.3,0.2);
    
        // finish with the specular
        
    this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.7);
}

//
// metal bitmaps
//

function genBitmapGenerateMetal(bitmapCTX,normalCTX,specularCTX,wid,high)
{
    var n,k,plateX,plateY,halfWid,halfHigh;
    var x,y,particleWid,particleHigh,particleDensity;
    
        // some random values
    
    var metalColor=this.genBitmapUtility.getRandomColor([0.0,0.0,0.4],[0.25,0.25,0.6]);
    var edgeColor=this.genBitmapUtility.darkenColor(metalColor,0.8);
    var markCount=this.genRandom.randomInt(10,15);
    
        // clear canvases
        
    this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(metalColor,1.0));
    this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
        // plates
    
    halfWid=Math.floor(wid/2);
    halfHigh=Math.floor(high/2);
    
    for (n=0;n!==4;n++) {
        plateX=(n%2)*halfWid;
        plateY=Math.floor(n/2)*halfHigh;

        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,plateX,plateY,(plateX+halfWid),(plateY+halfHigh),5,metalColor,edgeColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,plateX,plateY,(plateX+halfWid),(plateY+halfHigh),0.9,0.95,0.2);

            // particles

        for (k=0;k!==markCount;k++) {
            particleWid=this.genRandom.randomInt(50,30);
            particleHigh=this.genRandom.randomInt(50,30);
            particleDensity=this.genRandom.randomInt(150,50);

            x=this.genRandom.randomInt(plateX,(halfWid-particleWid));
            y=this.genRandom.randomInt(plateY,(halfHigh-particleHigh));

            if ((k&0x1)===0) {
                this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.8,particleDensity,true);
            }
            else {
                this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,1.2,particleDensity,false);
            }
        }
    }
    
        // finish with the specular
        
    this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.7);
}

//
// concrete bitmaps
//

function genBitmapGenerateConcrete(bitmapCTX,normalCTX,specularCTX,wid,high)
{
    var n,x,y,particleWid,particleHigh,particleDensity;
    
        // some random values
    
    var concreteColor=this.genBitmapUtility.getRandomGreyColor(0.4,0.6);
    
    var markCount=this.genRandom.randomInt(30,20);
    
        // clear canvases
        
    this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,this.genBitmapUtility.colorToRGBColor(concreteColor,1.0));
    this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,high,0.6,0.8,0.8);
    
    this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
        // marks
        
	for (n=0;n!==markCount;n++) {
        particleWid=this.genRandom.randomInt(100,100);
        particleHigh=this.genRandom.randomInt(100,100);
        particleDensity=this.genRandom.randomInt(250,150);
        
        x=this.genRandom.randomInt(0,wid);
        y=this.genRandom.randomInt(0,high);
        
        this.genBitmapUtility.drawParticle(bitmapCTX,normalCTX,wid,high,x,y,(x+particleWid),(y+particleHigh),10,0.9,particleDensity,false);
    }
    
        // finish with the specular
        
    this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
}

//
// wood bitmaps
//

function genBitmapGenerateWood(bitmapCTX,normalCTX,specularCTX,wid,high,isBox)
{
        // some random values
    
    var boardSize=Math.floor(wid/8);
    var woodColor=this.genBitmapUtility.getRandomColor([0.4,0.2,0.0],[0.5,0.3,0.0]);
    
        // clear canvases
        
    this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,'#FFFFFF');
    this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
        // regular wood planking
        
    if (!isBox) {
        
        var lft=0;
        var woodFactor;
        
        while (lft<wid) {
            woodFactor=0.8+((1.0-(this.genRandom.random()*2.0))*0.1);
            this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,lft,-3,(lft+boardSize),(high+3),3,woodColor,[0.0,0.0,0.0]); // -3 to get around outside borders
            this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,(lft+3),0,((lft+boardSize)-3),high,0.1,woodColor);
            this.genBitmapUtility.addNoiseRect(bitmapCTX,(lft+3),0,((lft+boardSize)-3),high,0.9,0.95,woodFactor);
            lft+=boardSize;
        }
    }
    
        // box type wood
        
    else {
    
            // outside boards

        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,wid,boardSize,3,woodColor,[0.0,0.0,0.0]);
        this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,3,3,(wid-3),(boardSize-3),0.1,woodColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,wid,boardSize,0.9,0.95,0.8);

        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,(high-boardSize),wid,high,3,woodColor,[0.0,0.0,0.0]);
        this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,3,((high-boardSize)+3),(wid-3),(high-3),0.1,woodColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,0,(high-boardSize),wid,high,0.9,0.95,0.8);
    
        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,0,0,boardSize,high,3,woodColor,[0.0,0.0,0.0]);
        this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,3,3,(boardSize-3),(high-3),0.1,woodColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,0,0,boardSize,high,0.9,0.95,0.8);
        
        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,(wid-boardSize),0,wid,high,3,woodColor,[0.0,0.0,0.0]);
        this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,((wid-boardSize)+3),3,(wid-3),(high-3),0.1,woodColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,(wid-boardSize),0,wid,high,0.9,0.95,0.8);
        
            // inner boards
            
        this.genBitmapUtility.drawColorStripeSlant(bitmapCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.3,woodColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,boardSize,boardSize,(wid-boardSize),(high-boardSize),0.9,0.95,0.8);
        
            // inner boards
        
        var y=Math.floor(high/2)-Math.floor(boardSize/2);
        
        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,boardSize,y,(wid-boardSize),(y+boardSize),3,woodColor,[0.0,0.0,0.0]);
        this.genBitmapUtility.drawColorStripeHorizontal(bitmapCTX,(boardSize+3),(y+3),((wid-boardSize)-3),((y+boardSize)-3),0.2,woodColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,boardSize,y,(wid-boardSize),(y+boardSize),0.9,0.95,0.8);
        
        var x=Math.floor(wid/2)-Math.floor(boardSize/2);
        
        this.genBitmapUtility.draw3DRect(bitmapCTX,normalCTX,x,boardSize,(x+boardSize),(high-boardSize),3,woodColor,[0.0,0.0,0.0]);
        this.genBitmapUtility.drawColorStripeVertical(bitmapCTX,(x+3),(boardSize+3),((x+boardSize)-3),((high-boardSize)-3),0.2,woodColor);
        this.genBitmapUtility.addNoiseRect(bitmapCTX,x,boardSize,(x+boardSize),(high-boardSize),0.9,0.95,0.8);
    }
    
        // finish with the specular
        
    this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
}

//
// skin bitmaps
//

/*


void bitmap_ag_texture_skin_chunk(bitmap_ag_type *ag_bitmap,int x,int y,int wid,int high,float scale_darken,float noise_darken)
{
	int				n,px,py,p_wid,p_high,scale_count;
	d3col			border_col;

		// set the clip so scales
		// can wrap within their UV space

	bitmap_ag_set_clip(ag_bitmap,x,y,wid,high);

		// scales

	scale_count=bitmap_ag_skin_start_scale_count+bitmap_ag_random_int(bitmap_ag_skin_extra_scale_count);
	
	border_col.r=ag_bitmap->back_col.r*scale_darken;
	border_col.g=ag_bitmap->back_col.g*scale_darken;
	border_col.b=ag_bitmap->back_col.b*scale_darken;

	for (n=0;n!=scale_count;n++) {
		px=bitmap_ag_random_int(wid);
		py=bitmap_ag_random_int(high);
		p_wid=bitmap_ag_skin_start_scale_size+bitmap_ag_random_int(bitmap_ag_skin_extra_scale_size);
		p_high=bitmap_ag_skin_start_scale_size+bitmap_ag_random_int(bitmap_ag_skin_extra_scale_size);
		bitmap_ag_texture_draw_oval(ag_bitmap,px,py,p_wid,p_high,1,TRUE,&border_col,NULL);
	}

	bitmap_ag_clear_clip(ag_bitmap);

		// skin noise

	bitmap_ag_texture_add_noise(ag_bitmap,x,y,wid,high,noise_darken,0.8f);
}

void bitmap_ag_texture_face_chunk(bitmap_ag_type *ag_bitmap,int x,int y,int wid,int high)
{
	int				n,eye_count,eye_x,eye_y,
					px,py,px2,py2,px_add,face_x,face_wid,
					eye_wid,eye_high,m_sz,border_sz,
					pupil_wid,pupil_high,line_count;
	d3col			border_col,eye_col,pupil_col,mouth_col;

		// skin

	bitmap_ag_texture_skin_chunk(ag_bitmap,x,y,wid,high,0.8f,0.8f);

		// position of face
	
	face_x=x+((wid*6)/10);
	face_wid=(wid*4)/10;

		// eyes

	bitmap_ag_random_color_lock(&border_col,0,50);
	bitmap_ag_random_color(&eye_col,150,0,50,255,50,150);
	bitmap_ag_random_color(&pupil_col,0,0,0,100,10,40);
	bitmap_ag_random_color(&mouth_col,0,0,0,80,10,50);

	eye_count=1+bitmap_ag_random_int(3);

	eye_wid=face_wid/eye_count;
	eye_high=(eye_wid>>1)+bitmap_ag_random_int(eye_wid);
	if (eye_high>(high>>1)) eye_high=high>>1;

	eye_x=(face_wid>>1)-((eye_count*eye_wid)>>1);
	eye_y=40+bitmap_ag_random_int(30);

	pupil_wid=eye_wid>>2;
	pupil_high=eye_high-bitmap_ag_random_int(eye_high>>1);

	px=face_x+eye_x;
	py=y+eye_y;

	border_sz=2+bitmap_ag_random_int(eye_high>>2);

	for (n=0;n!=eye_count;n++) {
		bitmap_ag_texture_draw_oval(ag_bitmap,px,py,(eye_wid-5),eye_high,border_sz,TRUE,&border_col,&eye_col);

		px2=px+((eye_wid-pupil_wid)>>1);
		py2=py+((eye_high-pupil_high)>>1);
		bitmap_ag_texture_draw_oval(ag_bitmap,px2,py2,pupil_wid,pupil_high,0,TRUE,NULL,&pupil_col);

		px+=eye_wid;
	}

		// mouth

	line_count=1+bitmap_ag_random_int(4);

	px=face_x+10;
	px_add=(face_wid-20)/line_count;

	for (n=0;n!=line_count;n++) {
		m_sz=2+bitmap_ag_random_int(8);
		bitmap_ag_texture_draw_line_horizontal(ag_bitmap,px,(y+(high-40)),px_add,m_sz,FALSE,&mouth_col);
		px+=px_add;
	}
}

void bitmap_ag_texture_cloth_chunk(bitmap_ag_type *ag_bitmap,int x,int y,int wid,int high)
{
	int				n,px,py,p_wid,p_high,mark_count;
	d3col			col;

	bitmap_ag_set_clip(ag_bitmap,x,y,wid,high);

	bitmap_ag_random_color(&col,200,200,200,80,80,80);

	bitmap_ag_texture_draw_rectangle(ag_bitmap,x,y,wid,high,1,TRUE,&col,NULL);
	bitmap_ag_texture_gradient_overlay_vertical(ag_bitmap,x,y,wid,high,1.0f,0.7f);
	bitmap_ag_texture_add_noise(ag_bitmap,x,y,wid,high,0.7f,0.5f);

	mark_count=40+bitmap_ag_random_int(60);

	for (n=0;n!=mark_count;n++) {
		px=bitmap_ag_random_int(wid);
		py=bitmap_ag_random_int(high);
		p_wid=30+bitmap_ag_random_int(30);
		p_high=30+bitmap_ag_random_int(30);
		bitmap_ag_texture_add_particle(ag_bitmap,px,py,p_wid,p_high,0.9f,TRUE,bitmap_ag_cement_particle_density);
	}

	bitmap_ag_clear_clip(ag_bitmap);
}

bool bitmap_ag_texture_skin(texture_frame_type *frame,char *base_path,int pixel_sz)
{
	bitmap_ag_type	ag_bitmap;

	ag_bitmap.pixel_sz=pixel_sz;
	ag_bitmap.no_bump_spec=FALSE;
	ag_bitmap.frame=frame;

	bitmap_ag_random_color(&ag_bitmap.back_col,255,255,255,100,100,100);

	if (!bitmap_ag_texture_create(&ag_bitmap,FALSE)) return(FALSE);

		// top-left is plain skin
		// top-right is face
		// bottom-left is darker skin

	bitmap_ag_texture_skin_chunk(&ag_bitmap,0,0,(pixel_sz>>1),(pixel_sz>>1),0.8f,0.8f);
	bitmap_ag_texture_face_chunk(&ag_bitmap,(pixel_sz>>1),0,(pixel_sz>>1),(pixel_sz>>1));
	bitmap_ag_texture_skin_chunk(&ag_bitmap,0,(pixel_sz>>1),(pixel_sz>>1),(pixel_sz>>1),0.7f,0.7f);
	bitmap_ag_texture_cloth_chunk(&ag_bitmap,(pixel_sz>>1),(pixel_sz>>1),(pixel_sz>>1),(pixel_sz>>1));

		// save textures

	bitmap_ag_texture_make_spec(&ag_bitmap,0.5f);
	return(bitmap_ag_texture_finish(&ag_bitmap,base_path));
}
            


 */
function genBitmapGenerateSkin(bitmapCTX,normalCTX,specularCTX,wid,high)
{
        // clear canvases
        
    this.genBitmapUtility.drawRect(bitmapCTX,0,0,wid,high,'#FFFFFF');
    this.genBitmapUtility.clearNormalsRect(normalCTX,0,0,wid,high);
    
    
    
    
        // finish with the specular
        
    this.genBitmapUtility.createSpecularMap(bitmapCTX,specularCTX,wid,high,0.5);
}

//
// create bitmap
//

function genBitmapGenerate(view,bitmapId,generateType,debug)
{
    var edgeSize,paddingSize,segments;
    
        // setup the canvas
        
    var bitmapCanvas=document.createElement('canvas');
    bitmapCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
    bitmapCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
    var bitmapCTX=bitmapCanvas.getContext('2d');

    var normalCanvas=document.createElement('canvas');
    normalCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
    normalCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
    var normalCTX=normalCanvas.getContext('2d');
    
    var specularCanvas=document.createElement('canvas');
    specularCanvas.width=GEN_BITMAP_TEXTURE_SIZE;
    specularCanvas.height=GEN_BITMAP_TEXTURE_SIZE;
    var specularCTX=specularCanvas.getContext('2d');
    
    var wid=bitmapCanvas.width;
    var high=bitmapCanvas.height;
    
        // create the bitmap
    
    var shineFactor=1.0;
    
    switch (generateType) {
        
        case GEN_BITMAP_TYPE_BRICK_STACK:
            segments=this.genBitmapUtility.createStackedSegments(wid,high);
            edgeSize=this.genRandom.randomInt(2,5);
            paddingSize=this.genRandom.randomInt(1,3);
            this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,0.8,segments);
            shineFactor=5.0;
            break;
            
        case GEN_BITMAP_TYPE_BRICK_RANDOM:
            segments=this.genBitmapUtility.createRandomSegments(wid,high);
            edgeSize=this.genRandom.randomInt(5,10);
            paddingSize=this.genRandom.randomInt(3,5);
            this.generateBrick(bitmapCTX,normalCTX,specularCTX,wid,high,edgeSize,paddingSize,0.5,segments);
            shineFactor=5.0;
            break;
            
        case GEN_BITMAP_TYPE_STONE:
            this.generateStone(bitmapCTX,normalCTX,specularCTX,wid,high);
            shineFactor=8.0;
            break;
            
        case GEN_BITMAP_TYPE_TILE_SIMPLE:
            this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,false);
            shineFactor=10.0;
            break;
            
        case GEN_BITMAP_TYPE_TILE_COMPLEX:
            this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,true,false);
            shineFactor=10.0;
            break;
            
        case GEN_BITMAP_TYPE_TILE_SMALL:
            this.generateTile(bitmapCTX,normalCTX,specularCTX,wid,high,false,true);
            shineFactor=10.0;
            break;
            
        case GEN_BITMAP_TYPE_METAL:
            this.generateMetal(bitmapCTX,normalCTX,specularCTX,wid,high);
            shineFactor=20.0;
            break;
            
        case GEN_BITMAP_TYPE_CONCRETE:
            this.generateConcrete(bitmapCTX,normalCTX,specularCTX,wid,high);
            shineFactor=5.0;
            break;
            
        case GEN_BITMAP_TYPE_WOOD_PLANK:
            this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,false);
            shineFactor=5.0;
            break;
            
        case GEN_BITMAP_TYPE_WOOD_BOX:
            this.generateWood(bitmapCTX,normalCTX,specularCTX,wid,high,true);
            shineFactor=5.0;
            break;
            
        case GEN_BITMAP_TYPE_SKIN:
            this.generateSkin(bitmapCTX,normalCTX,specularCTX,wid,high);
            shineFactor=15.0;
            break;

    }
    
        // debugging

/*
    if (generateType==GEN_BITMAP_TYPE_CONCRETE) {
        debug.displayCanvasData(bitmapCanvas,810,10,400,400);
        debug.displayCanvasData(normalCanvas,810,410,400,400);
        debug.displayCanvasData(specularCanvas,810,820,400,400);
    }
*/

        // finally create the bitmap
        // object and load into WebGL

    return(new mapBitmapObject(view,bitmapId,bitmapCanvas,normalCanvas,specularCanvas,[(1.0/4000.0),(1.0/4000.0)],shineFactor));    
}

//
// generate bitmap object
//

function genBitmapObject(genRandom)
{
        // random generator and utility functions
        
    this.genRandom=genRandom;
    this.genBitmapUtility=new genBitmapUtilityObject(genRandom);
    
        // generation functions
        
    this.generateBrick=genBitmapGenerateBrick;
    this.generateStone=genBitmapGenerateStone;
    this.generateTileInner=genBitmapGenerateTileInner;
    this.generateTile=genBitmapGenerateTile;
    this.generateMetal=genBitmapGenerateMetal;
    this.generateConcrete=genBitmapGenerateConcrete;
    this.generateWood=genBitmapGenerateWood;
    
    this.generate=genBitmapGenerate;
}
