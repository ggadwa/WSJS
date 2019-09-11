export default class GeneratePieceClass
{
    pieces=
            [
        
                {
                    "name":"box",
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
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[8,1],[9,2],[10,4],[10,5],[10,6],[9,8],[8,9],
                            [6,10],[5,10],[4,10],[2,9],[1,8],[0,6],[0,5],[0,4],[1,2],[2,1]
                        ]
                },
                
                {
                    "name":"half_circle",
                    "vertexes":
                        [
                            [4,0],[5,0],[6,0],[8,1],[9,2],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[10,10],
                            [9,10],[8,10],[7,10],[6,10],[5,10],[4,10],[3,10],[2,10],[1,10],[0,10],
                            [0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[1,2],[2,1]
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

    getRandomPiece()
    {
        return(this.pieces[Math.trunc(Math.random()*this.pieces.length)]);
    }
}
