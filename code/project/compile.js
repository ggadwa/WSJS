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
    
    compileConditions(jsonName,conditions,variables)
    {
        let condition;
        
        if (conditions===undefined) return(true);
        
        for (condition of conditions) {
            if (condition.condition==='calc') {
                condition.compileCalc=new CalcClass(this.core,jsonName,variables,null,condition.code,null,null);
                if (!condition.compileCalc.compile()) return(false);        // compile failed
            }
        }
        
        return(true);
    }
    
    compileActions(jsonName,actions,variables)
    {
        let action,minClamp,maxClamp;
        
        if (actions===undefined) return(true);
        
        for (action of actions) {
            if (action.action==='calc') {
                if (action.set===undefined) {
                    console.log('Action calcs require a set attribute in: '+this.name);
                    return(false);
                }
                
                minClamp=(action.minClamp===undefined)?null:action.minClamp;
                maxClamp=(action.maxClamp===undefined)?null:action.maxClamp;
                
                action.compileCalc=new CalcClass(this.core,jsonName,variables,action.set,action.code,minClamp,maxClamp);
                if (!action.compileCalc.compile()) return(false);        // compile failed
            }
        }
        
        return(true);
    }
    
    compile(jsonName,json,variables)
    {
        let event;
        
        if (json.ready!==undefined) {
            if (!this.compileActions(jsonName,json.ready.actions,variables)) return(false);
        }
        
        if (json.events!==undefined) {
            for (event of json.events) {
                if (!this.compileConditions(jsonName,event.conditions,variables)) return(false);
                if (!this.compileActions(jsonName,event.actions,variables)) return(false);
            }
        }
        
        return(true);
    }
        
}
