import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GeneratePieceClass
{
    pieces=
            [
                {
                    "name":"big_box",
                    "starter":true,
                    "size":{"x":10,"z":10},
                    "multistory":true,
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
                    "starter":true,
                    "size":{"x":5,"z":5},
                    "multistory":true,
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
                    "starter":true,
                    "size":{"x":10,"z":10},
                    "multistory":true,
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[8,1],[9,2],[10,4],[10,5],[10,6],[9,8],[8,9],
                            [6,10],[5,10],[4,10],[2,9],[1,8],[0,6],[0,5],[0,4],[1,2],[2,1]
                        ]
                },
                {
                    "name":"half_circle",
                    "starter":true,
                    "size":{"x":10,"z":10},
                    "multistory":true,
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[8,1],[9,2],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[10,10],
                            [9,10],[8,10],[7,10],[6,10],[5,10],[4,10],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,2],[2,1]
                        ]
                },
                {
                    "name":"slant_box",
                    "starter":true,
                    "size":{"x":10,"z":10},
                    "multistory":true,
                    "vertexes":
                        [
                            [2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,1],[10,2],
                            [10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[9,9],[8,10],
                            [7,10],[6,10],[5,10],[4,10],[3,10],[2,10],[1,9],[0,8],
                            [0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[1,1]
                        ]
                },
                {
                    "name":"4_exit_box",
                    "starter":true,
                    "size":{"x":10,"z":10},
                    "multistory":true,
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
                    "starter":true,
                    "size":{"x":5,"z":5},
                    "multistory":true,
                    "vertexes":
                        [
                            [2,0],[3,0],[4,1],[5,2],[5,3],[4,4],[3,5],
                            [2,5],[1,4],[0,3],[0,2],[1,1]
                        ]
                },
                {
                    "name":"cross_1",
                    "starter":false,
                    "size":{"x":5,"z":5},
                    "multistory":false,
                    "vertexes":
                        [
                            [2,0],[3,0],[3,1],[3,2],[4,2],[5,2],[5,3],[4,3],[3,3],[3,4],[3,5],
                            [2,5],[2,4],[2,3],[1,3],[0,3],[0,2],[1,2],[2,2],[2,1]
                        ]
                },
                {
                    "name":"cross_2",
                    "starter":false,
                    "size":{"x":5,"z":5},
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,1],[3,1],[4,0],[5,0],
                            [5,1],[4,2],[4,3],[5,4],[5,5],
                            [4,5],[3,4],[2,4],[1,5],[0,5],
                            [0,4],[1,3],[1,2],[0,1],
                        ]
                },
                {
                    "name":"corner_1",
                    "starter":false,
                    "size":{"x":3,"z":3},
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[3,1],[2,1],[1,1],[1,2],[1,3],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"t_intersection",
                    "starter":false,
                    "size":{"x":5,"z":3},
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],
                            [5,1],[4,1],[3,1],[3,2],[3,3],[2,3],[2,2],[2,1],[1,1],[0,1]
                        ]
                },
                {
                    "name":"s_intersection",
                    "starter":false,
                    "size":{"x":5,"z":5},
                    "multistory":false,
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
                    "name":"diagonal_hallway",
                    "starter":false,
                    "size":{"x":5,"z":5},
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,1],[3,2],[4,3],[5,4],[5,5],
                            [4,5],[3,4],[2,3],[1,2],[0,1]
                        ]
                }

            ];
            
    stairZPiece=
                {
                    "name":"stair_z",
                    "starter":false,
                    "size":{"x":1,"z":2},
                    "multistory":false,
                    "vertexes":[[0,0],[1,0],[1,1],[1,2],[0,2],[0,1]]
                };
                
    stairXPiece=
                {
                    "name":"stair_x",
                    "starter":false,
                    "size":{"x":2,"z":1},
                    "multistory":false,
                    "vertexes":[[0,0],[1,0],[2,0],[2,1],[1,1],[0,1]]
                };

    constructor()
    {
        let n,nPiece;
        
            // when we construct this, make rotated versions
            // of all the pieces
            
        nPiece=this.pieces.length;
        
        for (n=0;n!==nPiece;n++) {
            this.pieces.push(this.dupTransformPiece(this.pieces[n],false,false,true));
            this.pieces.push(this.dupTransformPiece(this.pieces[n],true,false,false));
            this.pieces.push(this.dupTransformPiece(this.pieces[n],true,true,false));
        }
    }
    
    dupTransformPiece(origPiece,rotate,flipX,flipZ)
    {
        let n,x,piece;
        
            // duplicate
            
        piece=JSON.parse(JSON.stringify(origPiece));
        
            // and flip
            
        for (n=0;n!==piece.vertexes.length;n++) {
            if (rotate) {
                x=piece.vertexes[n][0];
                piece.vertexes[n][0]=piece.vertexes[n][1];
                piece.vertexes[n][1]=x;
                
                x=piece.size.x;
                piece.size.x=piece.size.z;
                piece.size.z=x;
            }
            if (flipX) piece.vertexes[n][0]=piece.size.x-piece.vertexes[n][0];
            if (flipZ) piece.vertexes[n][1]=piece.size.z-piece.vertexes[n][1];
        }
        
        return(piece);
    }

    getRandomPiece(isStarter)
    {
        let piece;
        
        while (true) {
            piece=this.pieces[GenerateUtilityClass.randomIndex(this.pieces.length)];
            if (!isStarter) return(piece);
            
            if (piece.starter) return(piece);
        }
    }
    
    getStairZPiece()
    {
        return(this.stairZPiece);
    }
    
    getStairXPiece()
    {
        return(this.stairXPiece);
    }
}
