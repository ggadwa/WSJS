class CalcItemClass
{
    constructor(type,varName,num)
    {
        this.type=type;
        this.varName=varName;
        this.num=num;
    }
}

export default class CalcClass
{
    constructor(core,entity,code)
    {
        this.CALC_TYPE_VARIABLE=0;
        this.CALC_TYPE_CONSTANT_NUMBER=1;
        this.CALC_TYPE_CONTANT_CONTENT=2;
        this.CALC_TYPE_OPERATOR_EQUAL=3;
        this.CALC_TYPE_OPERATOR_PLUS=4;
        this.CALC_TYPE_OPERATOR_MINUS=5;
        
        this.core=core;
        this.entity=entity;
        this.code=code;
        
        this.items=[];
        
        Object.seal(this);
    }
    
        //
        // convert the code string into a list of items that
        // we can run through so we don't have to compile it every time
        //
        
    tokenToItem(token)
    {
        let varName;
        
        if (token.length===0) return(true);
        
        if (token.charAt(0)==='#') {
            varName=token.substring(1);
            if (this.entity.variables.get(varName)===undefined) {
                console.log('Missing variable in \''+this.code+'\': '+varName);
                return(false);
            }
            
            this.items.push(new CalcItemClass(this.CALC_TYPE_VARIABLE,varName,0));
            return(true);
        }
        
        if (token==='@content') {
            this.items.push(new CalcItemClass(this.CALC_TYPE_CONTANT_CONTENT,null,0));
            return(true);
        }
        
        if (isNaN(token)) {
            console.log('Illegal token error in \''+this.code+'\': '+token);
            return(false);
        }
        
        this.items.push(new CalcItemClass(this.CALC_TYPE_CONSTANT_NUMBER,token));
        return(true);
    }
    
    compile()
    {
        let n,ch;
        let curToken;
        
        curToken='';
        
        for (n=0;n!==this.code.length;n++) {
            ch=this.code.charAt(n);
            
            switch (ch) {
                
                case '=':
                    if (!this.tokenToItem(curToken)) return(false);
                    curToken='';
                    
                    this.items.push(new CalcItemClass(this.CALC_TYPE_OPERATOR_EQUAL,null,0));
                    break;
                
                case '+':
                    if (!this.tokenToItem(curToken)) return(false);
                    curToken='';
                    
                    this.items.push(new CalcItemClass(this.CALC_TYPE_OPERATOR_PLUS,null,0));
                    break;
                    
                case '-':
                    if (!this.tokenToItem(curToken)) return(false);
                    curToken='';
                    
                    this.items.push(new CalcItemClass(this.CALC_TYPE_OPERATOR_MINUS,null,0));
                    break;
                    
                default:
                    curToken+=ch;
                    break;   
            }
        }
        
        return(this.tokenToItem(curToken));
    }
    
        //
        // run it
        //
    
    runOperand(operator,leftValue,rightValue)
    {
        switch (operator) {
            case this.CALC_TYPE_OPERATOR_PLUS:
                return(leftValue+rightValue);
                
            case this.CALC_TYPE_OPERATOR_MINUS:
                return(leftValue-rightValue);
        }
        
        return(0);
    }
    
    run(currentMessageContent,minClamp,maxClamp)
    {
        let item;
        let value;
        let currentValue=null;
        let lastVarName=null;
        let leftValue=null;
        let lastOperator=null;
        let storageVarName=null;
        
        for (item of this.items) {
            switch (item.type) {
                
                case this.CALC_TYPE_VARIABLE:
                    lastVarName=item.varName;
                    value=this.entity.variables.get(lastVarName);
                    
                    if (lastOperator===null) {
                        leftValue=value;
                    }
                    else {
                        currentValue=this.runOperand(lastOperator,leftValue,value);
                        lastOperator=null;
                        leftValue=currentValue;
                    }
                    break;
                    
                case this.CALC_TYPE_CONTANT_CONTENT:
                    if (lastOperator===null) {
                        leftValue=currentMessageContent;
                    }
                    else {
                        currentValue=this.runOperand(lastOperator,leftValue,currentMessageContent);
                        lastOperator=null;
                        leftValue=currentValue;
                    }
                    break;
                    
                case this.CALC_TYPE_OPERATOR_EQUAL:
                    storageVarName=lastVarName;
                    lastVarName=null;
                    break;
                    
                case this.CALC_TYPE_OPERATOR_PLUS:
                case this.CALC_TYPE_OPERATOR_MINUS:
                    lastOperator=item.type;
                    break;
                    
            }
        }
        
            // error if no storage
            
        if (storageVarName===null) {
            console.info('Syntax error in calc, nothing to store to: '+this.code);
            return;
        }
        
            // clamp and save
            
        if (minClamp!==undefined) {
            if (currentValue<minClamp) currentValue=minClamp;
        }
        
        if (maxClamp!==undefined) {
            if (currentValue>maxClamp) currentValue=maxClamp;
        }
        
        this.entity.variables.set(storageVarName,currentValue);
    }
}
