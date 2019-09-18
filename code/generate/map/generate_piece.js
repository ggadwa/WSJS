import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GeneratePieceClass
{
    pieces=
            [
                {
                    "name":"box",
                    "starter":true,
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
                    "name":"circle",
                    "starter":true,
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
                    "name":"cross_1",
                    "starter":false,
                    "multistory":false,
                    "vertexes":
                        [
                            [3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[7,2],[7,3],[8,3],[9,3],[10,3],
                            [10,4],[10,5],[10,6],[10,7],[9,7],[8,7],[7,7],[7,8],[7,9],[7,10],
                            [6,10],[5,10],[4,10],[3,10],[3,9],[3,8],[3,7],[2,7],[1,7],[0,7],
                            [0,6],[0,5],[0,4],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1]
                        ]
                },
                {
                    "name":"cross_2",
                    "starter":false,
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,1],[5,2],[6,1],[7,0],[8,0],[9,0],[10,0],
                            [10,1],[10,2],[10,3],[9,4],[8,5],[9,6],[10,7],[10,8],[10,9],[10,10],
                            [9,10],[8,10],[7,10],[6,9],[5,8],[4,9],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[1,6],[2,5],[1,4],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"corner_1",
                    "starter":false,
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],
                            [10,1],[10,2],[10,3],[10,4],[9,4],[8,4],[7,4],[6,4],[5,4],[4,4],
                            [4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"corner_2",
                    "starter":false,
                    "multistory":false,
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[10,1],[10,2],[10,3],[10,4],[10,5],[10,6],
                            [8,7],[7,8],[6,10],[5,10],[4,10],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,2],[2,1]
                        ]
                },
                {
                    "name":"t_intersection",
                    "starter":false,
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],
                            [10,1],[10,2],[10,3],[10,4],[9,4],[8,4],[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10],
                            [6,10],[5,10],[4,10],[4,9],[4,8],[4,7],[4,6],[4,5],[4,4],
                            [3,4],[2,4],[1,4],[0,4],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"s_intersection",
                    "starter":false,
                    "multistory":false,
                    "vertexes":
                        [
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
                            [7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[8,7],[9,7],[10,7],
                            [10,8],[10,9],[10,10],[9,10],[8,10],[7,10],[6,10],[5,10],[4,10],[3,10],
                            [3,9],[3,8],[3,7],[3,6],[3,5],[3,4],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1]
                        ]
                },
                {
                    "name":"diagnal_hallway",
                    "starter":false,
                    "multistory":false,
                    "vertexes":
                        [
                            [6,0],[7,0],[8,0],[9,0],[10,0],[10,1],[10,2],[10,3],[10,4],
                            [9,5],[8,6],[7,7],[6,8],[5,9],[4,10],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[0,6],[1,5],[2,4],[3,3],[4,2],[5,1]
                        ]
                }

            ];
    
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
            }
            if (flipX) piece.vertexes[n][0]=10-piece.vertexes[n][0];
            if (flipZ) piece.vertexes[n][1]=10-piece.vertexes[n][1];
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
}
