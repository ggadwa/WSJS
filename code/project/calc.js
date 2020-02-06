class CalcItemClass
{
    constructor(type,obj)
    {
        this.type=type;
        this.obj=obj;
        
        this.parent=null;
        this.children=[];
    }
}

export default class CalcClass
{
    constructor(core,entity,set,code,minClamp,maxClamp)
    {
        this.CALC_TYPE_VARIABLE=0;
        this.CALC_TYPE_CONSTANT=1;
        this.CALC_TYPE_CONJUNCTION=2;
        this.CALC_TYPE_OPERATOR=3;
        this.CALC_TYPE_MESSAGE_CONTENT=4;
        this.CALC_TYPE_TIMESTAMP=5;
        
        this.CALC_TYPE_CONJUNCTION_AND=0;
        this.CALC_TYPE_CONJUNCTION_OR=1;
        
        this.CALC_CONJUNCTION_LIST=['&&','||'];
        
        this.CALC_TYPE_OPERATOR_EQUAL=0;
        this.CALC_TYPE_OPERATOR_NOT_EQUAL=1;
        this.CALC_TYPE_OPERATOR_GREATER_THAN=2;
        this.CALC_TYPE_OPERATOR_GREATER_THAN_EQUAL=3;
        this.CALC_TYPE_OPERATOR_LESS_THAN=4;
        this.CALC_TYPE_OPERATOR_LESS_THAN_EQUAL=5;
        this.CALC_TYPE_OPERATOR_PLUS=6;
        this.CALC_TYPE_OPERATOR_MINUS=7;
        this.CALC_TYPE_OPERATOR_MULTIPLY=8;
        this.CALC_TYPE_OPERATOR_DIVIDE=9;
        
        this.CALC_OPERATOR_LIST=['=','!=','>','>=','<','<=','+','-','*','/'];
        
        this.core=core;
        this.entity=entity;
        this.set=set;
        this.code=code;
        this.minClamp=minClamp;
        this.maxClamp=maxClamp;
        
        this.root=null;
        
        Object.seal(this);
    }
    
        //
        // convert the code string into a list of items that
        // we can run through so we don't have to compile it every time
        //
        
    tokenToItem(token)
    {
        let idx;
        
            // known tokens
            
        switch (token) {
            case 'true':
                return(new CalcItemClass(this.CALC_TYPE_CONSTANT,true));
            case 'false':
                return(new CalcItemClass(this.CALC_TYPE_CONSTANT,false));
            case '@content':
                return(new CalcItemClass(this.CALC_TYPE_MESSAGE_CONTENT,null));
            case '@timestamp':
                return(new CalcItemClass(this.CALC_TYPE_TIMESTAMP,null));
        }
        
            // conjunctions and operators
         
        idx=this.CALC_CONJUNCTION_LIST.indexOf(token);
        if (idx!==-1) return(new CalcItemClass(this.CALC_TYPE_CONJUNCTION,idx));
        
        idx=this.CALC_OPERATOR_LIST.indexOf(token);
        if (idx!==-1) return(new CalcItemClass(this.CALC_TYPE_OPERATOR,idx));
        
            // numbers
            
        if (!isNaN(token)) return(new CalcItemClass(this.CALC_TYPE_CONSTANT,(+token)));     // +token coverts to number
        
            // everything else is a variable
            
        if (this.entity.variables.get(token)===undefined) {
            console.log('Missing variable in \''+this.code+'\': '+token);
            return(null);
        }
            
        return(new CalcItemClass(this.CALC_TYPE_VARIABLE,token));
    }
    
    displayTreeRecurse(item,indent)
    {
        let n;
        let str='';
        
        for (n=0;n!==indent;n++) {
            str+=' ';
        }
        
        switch (item.type) {
            case this.CALC_TYPE_VARIABLE:
                str+=('[var]'+item.obj);
                break;
                
            case this.CALC_TYPE_CONSTANT:
                str+=('[constant]'+item.obj);
                break;
                
            case this.CALC_TYPE_CONJUNCTION:
                str+=('[conj]'+this.CALC_CONJUNCTION_LIST[item.obj]);
                break;
                
            case this.CALC_TYPE_OPERATOR:
                str+=('[operator]'+this.CALC_OPERATOR_LIST[item.obj]);
                break;
                
            case this.CALC_TYPE_MESSAGE_CONTENT:
                str+=('[special]@content');
                break;
                
            case this.CALC_TYPE_TIMESTAMP:
                str+=('[special]@timestamp');
                break;
        }
        
        console.info(str);
        
        for (let item2 of item.children) {
            this.displayTreeRecurse(item2,(indent+2));
        }
    }
    
    displayTree()
    {
        console.log('-- code='+this.code);
        this.displayTreeRecurse(this.root,0);
    }
    
    findEndParen(tokens,idx,endIdx)
    {
        let parenCount=0;
        
        while (idx<endIdx) {
            
                // more parens
                
            if (tokens[idx]==='(') {
                parenCount++;
                idx++;
                continue;
            }
            
                // end paren
                
            if (tokens[idx]===')') {
                if (parenCount===0) return(idx);
                parenCount--;
                idx++;
                continue;
            }
            
            idx++;
        }
        
        return(-1);
    }
    
    buildTreeRecursive(tokens,startIdx,endIdx)
    {
        let idx,endParenIdx;
        let token,item,rootItem,curItem;
        let forceChild;
        
        rootItem=null;
        
            // build the tree
        
        idx=startIdx;
        
        while (idx<endIdx) {
            token=tokens[idx];
            
            forceChild=false;
            
                // parens, recursive for a root item
                
            if (token==='(') {
                endParenIdx=this.findEndParen(tokens,(idx+1),endIdx);
                if (endParenIdx===-1) {
                    console.log('Mismatched parens at token '+idx+' in :'+this.code);
                    return(null);
                }

                item=this.buildTreeRecursive(tokens,(idx+1),endParenIdx);
                idx=endParenIdx;
                
                forceChild=(item.type===this.CALC_TYPE_OPERATOR);       // operators coming out of () need to be forced children of surrounding operators
            }
            
                // get item from token
                
            else {
                item=this.tokenToItem(token);
            }
            
            if (item===null) return(null);     // bad token
            
                // no tree yet, start
                
            if (rootItem===null) {
                rootItem=item;
                item.parent=null;
                curItem=item;
                
                idx++;
                continue;
            }
            
                // conjunctions always swap
                
            if (item.type===this.CALC_TYPE_CONJUNCTION) {
                if (curItem===null) {
                    console.log('Syntax error in code at token '+idx+' in: '+this.code);
                    return(null);
                }
                
                item.parent=curItem.parent;
                if (item.parent===null) rootItem=item;     // was the root item
                item.children.push(curItem);
                curItem.parent=item;
                
                curItem=item;
                
                idx++;
                continue;
            }
            
                // operators need to swap out last item
                // unless we are coming out of a parens, which
                // forces children
                
            if (item.type===this.CALC_TYPE_OPERATOR) {
                if (curItem===null) {
                    console.log('Syntax error in code at token '+idx+' in: '+this.code);
                    return(null);
                }
                
                if (forceChild) {
                    curItem.children.push(item);
                    item.parent=curItem;
                }
                else {
                    item.parent=curItem.parent;
                    if (item.parent===null) rootItem=item;     // was the root item
                    item.children.push(curItem);
                    curItem.parent=item;
                    curItem=item;
                }
                
                idx++;
                continue;
            }
            
                // just place variables and constants as siblings
                
            curItem.children.push(item);
            item.parent=curItem;
            
            idx++;
        }

        return(rootItem);
    }
    
    buildTree(tokens)
    {
        this.root=this.buildTreeRecursive(tokens,0,tokens.length);
        return(this.root!==null);
    }
    
    compile()
    {
        let n,ch,cc;
        let tokens,token;
        let isInAlpha,isInNumber,isInSymbol;
        
            // tokenize by splitting from changes
            // back and forth to symbols
        
        tokens=[];
        
        token='';
        isInAlpha=false;
        isInNumber=false;
        isInSymbol=false;
        
        for (n=0;n!==this.code.length;n++) {
            ch=this.code.charAt(n);
            cc=this.code.charCodeAt(n);
            
                // ( and ) are special tokens we always catch
               
            if ((ch==='(') || (ch===')')) {
                if (token.length>0) tokens.push(token.trim());
                tokens.push(''+ch);
                token='';
                isInAlpha=false;
                isInNumber=false;
                isInSymbol=false;
                continue;
            }
            
                // 0..9
                
            if ((cc>47) && (cc<58)) {
                if ((isInAlpha) || (isInNumber)) {            // we are still in a variable, just continue on
                    token+=ch;
                    continue;
                }
                
                if (isInSymbol) {
                    if (token.length>0) tokens.push(token.trim());
                    token=ch;
                    isInAlpha=false;
                    isInNumber=true;
                    isInSymbol=false;
                    continue;
                }
                
                isInAlpha=false;
                isInNumber=true;
                isInSymbol=false;
                token+=ch;
                continue;
            }
            
                // letter (@ counts as special variables can start with @)
                
            if (((cc>64) && (cc<91)) || ((cc>96) && (cc<123)) || (cc===64)) {
                if ((isInAlpha) || (isInNumber)) {            // we are still in a variable, just continue on
                    token+=ch;
                    continue;
                }
                
                if (isInSymbol) {
                    if (token.length>0) tokens.push(token.trim());
                    token=ch;
                    isInAlpha=false;
                    isInNumber=true;
                    isInSymbol=false;
                    continue;
                }

                isInAlpha=true;
                isInNumber=false;
                isInSymbol=false;
                token+=ch;
                continue;
            }
            
                // everything else is a symbol
                
            if (!isInSymbol) {
                if (token.length>0) tokens.push(token.trim());
                token=ch;
                isInAlpha=false;
                isInNumber=false;
                isInSymbol=true;
                continue;
            }
            
            isInAlpha=false;
            isInNumber=false;
            isInSymbol=true;
            token+=ch;
        }
        
        if (token.length>0) tokens.push(token.trim());
        
            // build the tree from tokens
            
        if (!this.buildTree(tokens)) return(false);
            
            // display the tree (debugging)
            
        //this.displayTree();
        
        return(true);
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
    
    runRecurse(item,currentMessageContent)
    {
        let n;
        let value,curValue;
        
            // conjunction
            
        if (item.type===this.CALC_TYPE_CONJUNCTION) {
            
            curValue=this.runRecurse(item.children[0],currentMessageContent);

            for (n=1;n<item.children.length;n++) {
                value=this.runRecurse(item.children[n],currentMessageContent);
                
                switch (item.obj) {
                    case this.CALC_TYPE_CONJUNCTION_AND:
                        curValue=(curValue&&value);
                        break;
                    case this.CALC_TYPE_CONJUNCTION_OR:
                        curValue=(curValue||value);
                        break;
                }
            }
            
            return(curValue);
        }
        
            // operator
            
        if (item.type===this.CALC_TYPE_OPERATOR) {
            
            curValue=this.runRecurse(item.children[0],currentMessageContent);
            
            for (n=1;n<item.children.length;n++) {
                value=this.runRecurse(item.children[n],currentMessageContent);
                
                switch (item.obj) {
                    case this.CALC_TYPE_OPERATOR_EQUAL:
                        curValue=(curValue===value);
                        break;
                    case this.CALC_TYPE_OPERATOR_NOT_EQUAL:
                        curValue=(curValue!==value);
                        break;
                    case this.CALC_TYPE_OPERATOR_GREATER_THAN:
                        curValue=(curValue>value);
                        break;
                    case this.CALC_TYPE_OPERATOR_GREATER_THAN_EQUAL:
                        curValue=(curValue>=value);
                        break;
                    case this.CALC_TYPE_OPERATOR_LESS_THAN:
                        curValue=(curValue<value);
                        break;
                    case this.CALC_TYPE_OPERATOR_LESS_THAN_EQUAL:
                        curValue=(curValue<=value);
                        break;
                    case this.CALC_TYPE_OPERATOR_PLUS:
                        curValue=(curValue+value);
                        break;
                    case this.CALC_TYPE_OPERATOR_MINUS:
                        curValue=(curValue-value);
                        break;
                    case this.CALC_TYPE_OPERATOR_MULTIPLY:
                        curValue=(curValue*value);
                        break;
                    case this.CALC_TYPE_OPERATOR_DIVIDE:
                        curValue=(curValue/value);
                        break;
                    
                }
            }
                
            return(curValue);
        }
        
            // variable, constants, and specials
            
        if (item.type===this.CALC_TYPE_VARIABLE) return(this.entity.variables.get(item.obj));
        if (item.type===this.CALC_TYPE_CONSTANT) return(item.obj);
        if (item.type===this.CALC_TYPE_MESSAGE_CONTENT) return(currentMessageContent);
        if (item.type===this.CALC_TYPE_TIMESTAMP) return(this.core.timestamp);

        return(0);
    }
    
    run(currentMessageContent)
    {
        let value;
        
        value=this.runRecurse(this.root,currentMessageContent);
        
            // clamp and save
            
        if (this.set!==null) {
            if (this.minClamp!==null) {
                if (value<this.minClamp) value=this.minClamp;
            }

            if (this.maxClamp!==null) {
                if (value>this.maxClamp) value=this.maxClamp;
            }

            this.entity.variables.set(this.set,value);
        }
        
            // return value for comparisons
            
        return(value);
    }
}
