/**
 * @module ProjectEntityClass
 * @ignore
*/

/**
 * This is a simple class used to pass through an input touch
 * click (a quick touch and finger lift) to an entity.
 */
export default class ProjectEntityTouchClickClass
{
    /**
     * Constructor -- you never call this, the engine creates these.
     * 
     * @param {string} id Unique ID for this click
     * @param {number} x The x position of the touch
     * @param {number} y The y position of the touch
     * @param {number} quadrant The quadrant of the touch (this.QUADRANT_)
     * @returns {ProjectEntityInputTouchClass}
     */
    constructor(id,x,y,quadrant)
    {
        this.id=id;
        this.x=x;
        this.y=y;
        this.quadrant=quadrant;
    }
}
