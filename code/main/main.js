import CoreClass from '../main/core.js';

//
// main class
//

class MainClass
{
    constructor()
    {
            // core is the global root
            // object for all game objects

        this.core=new CoreClass();

        Object.seal(this);
    }
    
    async run(data)
    {
            // clear html
            
        document.body.innerHTML='';
        
            // initialize the core and
            // go into the title run
        
        if (!(await this.core.initialize(data))) return;
        if (!(await this.core.loadShaders())) return;
        
        this.core.startLoop();
    }


}

//
// single global object is the main class
// and contains all other global objects
// (this elimates a bunch of circular logic
// and simplifies imports)
//

let main=new MainClass();

export default main;
