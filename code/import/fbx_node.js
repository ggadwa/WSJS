export default class FBXNodeClass
{
    constructor(name)
    {
        this.name=name;
        
        this.properties=[];
        this.children=[];
    }
    
    addProperty(value)
    {
        this.properties.push(value);
    }
    
    addChild(name)
    {
        let child=new FBXNodeClass(name);
        this.children.push(child);
        
        return(child);
    }
}

