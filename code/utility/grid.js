export default class GridClass
{
    constructor(xSize,zSize)
    {
        this.xSize=xSize;
        this.zSize=zSize;
        
        this.grid=new Uint8Array(xSize*zSize);
        
        Object.seal(this);
    }
    
    setCell(x,z,value)
    {
        this.grid[(z*this.xSize)+x]=value;
    }
    
    getCell(x,z)
    {
        return(this.grid[(z*this.xSize)+x]);
    }
    
    setCellAll(value)
    {
        let n;
        let cellSize=this.xSize*this.zSize;
        
        for (n=0;n!==cellSize;n++) {
            this.grid[n]=value;
        }
    }
    
    copy()
    {
        let copyGrid=new GridClass(this.xSize,this.zSize);
        
        let n;
        let cellSize=this.xSize*this.zSize;
        
        for (n=0;n!==cellSize;n++) {
            copyGrid.grid[n]=this.grid[n];
        }
        
        return(copyGrid);
    }

}
