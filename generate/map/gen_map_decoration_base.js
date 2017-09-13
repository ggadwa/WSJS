import * as constants from '../../code/main/constants.js';

//
// base class for room decoration classes
//

export default class GenRoomDecorationBaseClass
{
    constructor(view,map,platformBitmap)
    {
        this.view=view;
        this.map=map;
        this.platformBitmap=platformBitmap;
    }

    create(room,rect)
    {
    }

}
