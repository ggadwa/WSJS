/**
 * @module ProjectEntityClass
 * @ignore
*/

/**
 * This is a simple class used to pass through an input swipe
 * (a touch and than movement without lifting finger) to an entity.
 */
export default class ProjectEntityTouchSwipeClass
{
    /**
     * Constructor -- you never call this, the engine creates these.
     * 
     * @param {string} Unique id for this swipe (can used to track multiple parts of a swipe)
     * @param {number} startX The x position of the start of this swipe
     * @param {number} startY The y position of the start of this swipe
     * @param {number} endX The x position of the end of this swipe
     * @param {number} endY The y position of the end of this swipe
     * @param {number} quadrant The quadrant of the start of the swipe (this.QUADRANT_)
     * @returns {ProjectEntityTouchSwipeClass}
     */
    constructor(id,startX,startY,endX,endY,quadrant)
    {
        this.id=id;
        this.startX=startX;
        this.startY=startY;
        this.endX=endX;
        this.endY=endY;
        this.quadrant=quadrant;
    }
}
