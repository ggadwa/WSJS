import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ProjectEntityClass from '../../code/project/project_entity.js';
import EntityWeaponBerettaClass from '../../data/scripts/entity_weapon_beretta.js';
import EntityWeaponM16RifleClass from '../../data/scripts/entity_weapon_m16_rifle.js';
import ModelClass from '../../code/model/model.js';
import ImportModelClass from '../../code/import/import_model.js';
import MapPathNodeClass from '../../code/map/map_path_node.js';

export default class ProjectEntityDeveloperClass extends ProjectEntityClass
{
    constructor(core,name,position,angle)
    {
        super(core,name,position,angle);

        this.parentNodeIdx=-1;
        this.splitStartNodeIdx=-1;
        this.splitEndNodeIdx=-1;
    }
    
        //
        // position information
        //
        
    positionInfo()
    {
        let n,nodeIdx,str;
        let nMesh=this.core.map.meshList.meshes.length;
        let xBound=new BoundClass(this.position.x-100,this.position.x+100);
        let yBound=new BoundClass(this.position.y+(this.eyeOffset+100),this.position.y+this.eyeOffset);
        let zBound=new BoundClass(this.position.z-100,this.position.z+100);

            // position and angle
            
        console.log('pos='+Math.trunc(this.position.x)+','+Math.trunc(this.position.y)+','+Math.trunc(this.position.z));
        console.log('ang='+Math.trunc(this.angle.x)+','+Math.trunc(this.angle.y)+','+Math.trunc(this.angle.z));

            // nodes
            
        nodeIdx=this.findNearestPathNode(5000);
        if (nodeIdx!==-1) console.log('node='+this.core.map.path.nodes[nodeIdx].nodeIdx);
            
            // meshes
            
        str='';

        for (n=0;n!==nMesh;n++) {
            if (this.core.map.meshList.meshes[n].boxBoundCollision(xBound,yBound,zBound)) {
                if (str!=='') str+='|';
                str+=this.core.map.meshList.meshes[n].name;
            }
        }
        
        if (str!=='') console.log('mesh='+str);
    }
    
        //
        // path editing
        //
    
    pathJSONReplacer(key,value)
    {
        if (key==='nodeIdx') return(undefined);
        if (key==='pathHints') return(undefined);
        if ((key==='data') && (value===null)) return(undefined);
        return(value);
    }
    
    pathEditor()
    {
        let nodeIdx;
        let name,links;
        let input=this.core.input;
        
            // i key picks a new parent from closest node
            
        if (input.keyFlags[73]) {
            input.keyFlags[73]=false;
            
            nodeIdx=this.findNearestPathNode(1000000);
            if (nodeIdx===-1) return;
            
            this.parentNodeIdx=nodeIdx;
            
            console.log('Reset to parent node '+nodeIdx);
            return;
        }
        
            // o splits a path at two nodes,
            // hit o on each node, then o for new node
            
        if (input.keyFlags[79]) {
            input.keyFlags[79]=false;
            
            nodeIdx=this.findNearestPathNode(1000000);
            if (nodeIdx===-1) return;
            
            if (this.splitStartNodeIdx===-1) {
                this.splitStartNodeIdx=nodeIdx;
                console.log('starting split at '+nodeIdx+' > now select second node');
                return;
            }
            
            if (this.splitEndNodeIdx===-1) {
                this.splitEndNodeIdx=nodeIdx;
                console.log('second node selected '+nodeIdx+' > now add split node');
                return;
            }
            
            nodeIdx=this.core.map.path.nodes.length;
            this.core.map.path.nodes.push(new MapPathNodeClass(nodeIdx,this.position.copy(),[this.splitStartNodeIdx,this.splitEndNodeIdx]));
            
            links=this.core.map.path.nodes[this.splitStartNodeIdx].links;
            links[links.indexOf(this.splitEndNodeIdx)]=nodeIdx;
            
            links=this.core.map.path.nodes[this.splitEndNodeIdx].links;
            links[links.indexOf(this.splitStartNodeIdx)]=nodeIdx;
            
            this.parentNodeIdx=nodeIdx;

            return;
        }
        
            // p key adds to path
            
        if (input.keyFlags[80]) {
            input.keyFlags[80]=false;
            
                // is there a close node?
                // if so connect to that
                
            nodeIdx=this.findNearestPathNode(5000);
            if (nodeIdx!==-1) {
                if (this.parentNodeIdx!==-1) {
                    this.core.map.path.nodes[nodeIdx].links.push(this.parentNodeIdx);
                    this.core.map.path.nodes[this.parentNodeIdx].links.push(nodeIdx);
                    
                    this.parentNodeIdx=nodeIdx;
                    
                    console.log('Connected node '+nodeIdx);
                }
                
                return;
            }
            
                // otherwise create a new node
                
            nodeIdx=this.core.map.path.nodes.length;
            
            links=[];
            if (this.parentNodeIdx!==-1) {
                links.push(this.parentNodeIdx);
                this.core.map.path.nodes[this.parentNodeIdx].links.push(nodeIdx);
            }
            
            this.core.map.path.nodes.push(new MapPathNodeClass(nodeIdx,this.position.copy(),links));
            
            this.parentNodeIdx=nodeIdx;
            
            console.log('Added node '+nodeIdx);
            return;
        }
        
            // \ key displays json of path
            
        if (input.keyFlags[220]) {
            input.keyFlags[220]=false;
            
            console.log(JSON.stringify(this.core.map.path.nodes,this.pathJSONReplacer.bind(this)));
        }
    }
    
        //
        // run editor
        //
    
    run()
    {
        let input=this.core.input;
        
            // backspace prints out position info
            
        if (input.keyFlags[8]) {
            input.keyFlags[8]=false;
            this.positionInfo();
            return;
        }
        
            // path editing
            
        if (config.DRAW_PATHS) this.pathEditor();
    }
}
