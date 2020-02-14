import CalcClass from '../project/calc.js';

export default class CompileClass
{
    constructor(core)
    {
        this.core=core;
    }
        
        //
        // compile calcs
        //
    
    compile(jsonName,obj)
    {
        let prop,value,calc;
        
        if (obj===undefined) return(true);
        
        for (prop in obj) {
            value=obj[prop];
            
                // if object (which includes arrays) then go deeper
                
            if (typeof(value)==='object') {
                this.compile(jsonName,value);
                continue;
            }
            
                // otherwise look for a string prop that starts with calc(
                
            if (typeof(value)!=='string') continue;
            
            value=value.trim();
            if (!value.startsWith('calc(')) continue;
            if (!value.endsWith(')')) {
                console.log('Syntax error in calc, mismatched () in: '+jsonName);
                return(false);
            }
            
            calc=new CalcClass(this.core,jsonName,value.substring(5,(value.length-1)));
            if (!calc.compile()) return(false);
            
            obj[prop]=calc;
        }
        
        return(true);
    }
    
        
}
