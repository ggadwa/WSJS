export default class GeneratePieceClass
{
    constructor(core)
    {
        this.core=core;
    
        this.pieces=
            [
                {
                    "name":"big_box",
                    "size":{"x":10,"z":10},
                    "decorate":true,
                    "storyMinimum":2,
                    "margins":[1,1,1,1],
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],
                            [10,1],[10,2],[10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[10,10],
                            [9,10],[8,10],[7,10],[6,10],[5,10],[4,10],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"small_box",
                    "size":{"x":5,"z":5},
                    "decorate":true,
                    "storyMinimum":2,
                    "margins":[1,1,1,1],
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],
                            [5,1],[5,2],[5,3],[5,4],[5,5],
                            [4,5],[3,5],[2,5],[1,5],[0,5],
                            [0,4],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"circle",
                    "size":{"x":10,"z":10},
                    "decorate":true,
                    "storyMinimum":2,
                    "margins":[2,2,2,2],
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[8,1],[9,2],[10,4],[10,5],[10,6],[9,8],[8,9],
                            [6,10],[5,10],[4,10],[2,9],[1,8],[0,6],[0,5],[0,4],[1,2],[2,1]
                        ]
                },
                {
                    "name":"half_circle",
                    "size":{"x":10,"z":10},
                    "decorate":true,
                    "storyMinimum":1,
                    "margins":[2,2,2,1],
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[8,1],[9,2],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[10,10],
                            [9,10],[8,10],[7,10],[6,10],[5,10],[4,10],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,2],[2,1]
                        ]
                },
                {
                    "name":"half_circle_small",
                    "size":{"x":10,"z":5},
                    "decorate":true,
                    "storyMinimum":1,
                    "margins":[2,2,2,1],
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[8,1],[9,2],[10,4],[10,5],
                            [9,5],[8,5],[7,5],[6,5],[5,5],[4,5],[3,5],[2,5],[1,5],[0,5],
                            [0,4],[1,2],[2,1]
                        ]
                },
                {
                    "name":"slant_box",
                    "size":{"x":10,"z":10},
                    "decorate":true,
                    "storyMinimum":2,
                    "margins":[1,1,1,1],
                    "vertexes":
                        [
                            [2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,1],[10,2],
                            [10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[9,9],[8,10],
                            [7,10],[6,10],[5,10],[4,10],[3,10],[2,10],[1,9],[0,8],
                            [0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[1,1]
                        ]
                },
                {
                    "name":"ragged_box",
                    "size":{"x":10,"z":10},
                    "decorate":true,
                    "storyMinimum":2,
                    "margins":[1,1,1,1],
                    "vertexes":
                        [
                            [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[6,0],[7,0],[8,0],[9,0],
                            [9,1],[9,2],[9,3],[9,4],[9,5],[9,6],[10,6],[10,7],[10,8],[10,9],
                            [9,9],[8,9],[7,9],[6,9],[5,9],[4,9],[4,10],[3,10],[2,10],[1,10],
                            [1,9],[1,8],[1,7],[1,6],[1,5],[1,4],[0,4],[0,3],[0,2]
                        ]
                },
                {
                    "name":"small_diamond",
                    "size":{"x":5,"z":5},
                    "decorate":true,
                    "storyMinimum":1,
                    "margins":[1,1,1,1],
                    "vertexes":
                        [
                            [2,0],[3,0],[4,1],[5,2],[5,3],[4,4],[3,5],
                            [2,5],[1,4],[0,3],[0,2],[1,1]
                        ]
                },
                {
                    "name":"star",
                    "size":{"x":10,"z":10},
                    "decorate":true,
                    "storyMinimum":2,
                    "margins":[1,1,1,1],
                    "vertexes":
                        [
                            [0,0],[1,0],[2,1],[3,1],[4,0],[5,0],[6,0],[7,1],[8,1],[9,0],[10,0],
                            [10,1],[10,2],[9,3],[9,4],[10,4],[10,5],[10,6],[9,6],[9,7],[10,8],[10,9],[10,10],
                            [9,10],[8,9],[7,9],[6,10],[5,10],[4,10],[3,9],[2,9],[1,10],[0,10],
                            [0,9],[0,8],[1,7],[1,6],[0,6],[0,5],[0,4],[1,4],[1,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"4_exit_hallway",
                    "size":{"x":6,"z":6},
                    "decorate":false,
                    "storyMinimum":1,
                    "margins":[0,0,0,0],
                    "vertexes":
                        [
                            [0,1],[1,1],[2,1],[3,1],[4,1],[4,0],[5,0],
                            [5,1],[5,2],[5,3],[5,4],[6,4],[6,5],
                            [5,5],[4,5],[3,5],[2,5],[2,6],[1,6],
                            [1,5],[1,4],[1,3],[1,2],[0,2]
                        ]
                },
                {
                    "name":"v_hallway",
                    "size":{"x":6,"z":4},
                    "decorate":false,
                    "storyMinimum":1,
                    "margins":[0,0,0,0],
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[2,1],[3,2],[4,1],[4,0],[5,0],[6,0],
                            [6,1],[5,3],[4,4],[3,4],[2,4],[1,3],[0,1]
                        ]
                },
                {
                    "name":"s_hallway",
                    "size":{"x":5,"z":5},
                    "decorate":false,
                    "storyMinimum":1,
                    "margins":[0,0,0,0],
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[5,1],
                            [4,1],[3,1],[2,1],[2,2],[3,2],[4,2],[5,2],
                            [5,3],[5,4],[5,5],[4,5],[3,5],[2,5],[1,5],[0,5],
                            [0,4],[1,4],[2,4],[3,4],[3,3],[2,3],[1,3],[0,3],
                            [0,2],[0,1]
                        ]
                },
                {
                    "name":"u_hallway",
                    "size":{"x":5,"z":5},
                    "decorate":false,
                    "storyMinimum":1,
                    "margins":[0,0,0,0],
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[2,1],[2,2],[2,3],
                            [3,3],[3,2],[3,1],[3,0],[4,0],[5,0],
                            [5,1],[5,2],[5,3],[5,4],[5,5],
                            [4,5],[3,5],[2,5],[1,5],[0,5],
                            [0,4],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"small_hallway",
                    "size":{"x":1,"z":3},
                    "decorate":false,
                    "storyMinimum":1,
                    "margins":[0,0,0,0],
                    "vertexes":
                        [
                            [0,0],[1,0],[1,1],[1,2],[1,3],
                            [0,3],[0,2],[0,1]
                        ]
                }
            ];
    }
    
    dupTransformPiece(origPiece,rotate,flipX,flipZ)
    {
        let n,k,piece;
        
            // no change
            
        if ((!rotate) && (!flipX) && (!flipZ)) return(origPiece);
        
            // duplicate
            
        piece=JSON.parse(JSON.stringify(origPiece));
        
            // and flip
        
        if (rotate) {
            k=piece.size.x;
            piece.size.x=piece.size.z;
            piece.size.z=k;
            
            k=piece.margins[0];
            piece.margins[0]=piece.margins[2];
            piece.margins[2]=k;
            
            k=piece.margins[1];
            piece.margins[1]=piece.margins[3];
            piece.margins[3]=k;
        }
            
        for (n=0;n!==piece.vertexes.length;n++) {
            if (rotate) {
                k=piece.vertexes[n][0];
                piece.vertexes[n][0]=piece.vertexes[n][1];
                piece.vertexes[n][1]=k;
            }
            if (flipX) piece.vertexes[n][0]=piece.size.x-piece.vertexes[n][0];
            if (flipZ) piece.vertexes[n][1]=piece.size.z-piece.vertexes[n][1];
        }
        
        if (flipX) {
            k=piece.margins[0];
            piece.margins[0]=piece.margins[2];
            piece.margins[2]=k;
        }
        
        if (flipZ) {
            k=piece.margins[1];
            piece.margins[1]=piece.margins[3];
            piece.margins[3]=k;
        }
        
        return(piece);
    }
    
    getDefaultPiece()
    {
        return(this.pieces[0]);
    }

    getRandomPiece()
    {
        return(this.dupTransformPiece(this.pieces[this.core.randomIndex(this.pieces.length)],this.core.randomPercentage(0.5),this.core.randomPercentage(0.5),this.core.randomPercentage(0.5)));
    }
}
