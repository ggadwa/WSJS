"use strict";

//
// primitive collisions
//

/*

static inline bool line_line_intersect(d3pnt *p0,d3pnt *p1,d3pnt *p2,d3pnt *p3,d3pnt *hit_pnt)
{
	float			fx0,fy0,fx1,fy1,fx2,fy2,fx3,fy3,
					denom,
					ax,bx,dx,ay,by,dy,r,s;

	fx0=(float)p0->x;
	fy0=(float)p0->z;
	fx1=(float)p1->x;
	fy1=(float)p1->z;
	fx2=(float)p2->x;
	fy2=(float)p2->z;
	fx3=(float)p3->x;
	fy3=(float)p3->z;
	
	ax=fx0-fx2;
	bx=fx1-fx0;
	dx=fx3-fx2;
	
	ay=fy0-fy2;
	by=fy1-fy0;
	dy=fy3-fy2;
	
	denom=(bx*dy)-(by*dx);
	if (denom==0.0f) return(FALSE);
	
	r=((ay*dx)-(ax*dy))/denom;
	if ((r<0.0f) || (r>1.0f)) return(FALSE);
	
	s=((ay*bx)-(ax*by))/denom;
	if ((s<0.0f) || (s>1.0f)) return(FALSE);
	
	if ((r==0.0f) && (s==0.0f)) return(FALSE);
	
	hit_pnt->x=(int)(fx0+(r*bx));
	hit_pnt->z=(int)(fy0+(r*by));
	
	return(TRUE);
}

int circle_line_intersect(d3pnt *p1,d3pnt *p2,d3pnt *circle_pnt,int radius,d3pnt *hit_pnt)
{
	int				n,dist,cur_dist;
	float			rad,rad_add,f_radius;
	float			fx,fz;
	d3pnt			cp2,temp_hit_pnt;
	
		// ray cast like spokes from the circle
		// normal math says check the perpendicular,
		// but that allows parts of the circle to
		// wade into corners

	cur_dist=-1;

	f_radius=(float)radius;

	rad=0.0f;
	rad_add=(TRIG_PI*2.0f)/24.0f;

	for (n=0;n!=24;n++) {
		cp2.x=circle_pnt->x+(int)(f_radius*sinf(rad));
		cp2.z=circle_pnt->z-(int)(f_radius*cosf(rad));
		
		if (line_line_intersect(p1,p2,circle_pnt,&cp2,&temp_hit_pnt)) {
			fx=(float)(temp_hit_pnt.x-circle_pnt->x);
			fz=(float)(temp_hit_pnt.z-circle_pnt->z);
			dist=(int)sqrtf((fx*fx)+(fz*fz));

			if ((dist<cur_dist) || (cur_dist==-1)) {
				cur_dist=dist;
				hit_pnt->x=temp_hit_pnt.x;
				hit_pnt->z=temp_hit_pnt.z;
			}
		}

		rad+=rad_add;
	}
	
	return(cur_dist);
}

 */


//
// collision class
//

function CollisionObject()
{

        //
        // colliding objects
        //

    this.moveObjectInMap=function(map,pt,radius)
    {

    };
}
