function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray,normalArray)
{
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(0);
           
           normalArray.push(0);
           normalArray.push(0);
           normalArray.push(1);
       }

    var numT=0;
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+n+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+1+n+1);
           faceArray.push(vid+n+1);
           numT+=2;
       }
    return numT;
}

function generateLinesFromIndexedTriangles(faceArray,lineArray)
{
    numTris=faceArray.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        lineArray.push(faceArray[fid]);
        lineArray.push(faceArray[fid+1]);
        
        lineArray.push(faceArray[fid+1]);
        lineArray.push(faceArray[fid+2]);
        
        lineArray.push(faceArray[fid+2]);
        lineArray.push(faceArray[fid]);
    }
}


function obj2json(input) {

  var out = {};
  out.vertices = [];
  out.vertexNormals = [];
    out.colors=[];
  out.faceindex = [];

    var lines= input.split('\n')
     
    for (var i=0; i<lines.length; i++){
        line = lines[i].split(" ");
         
        if(line[0] == "v"){
            for(var j=1; j<4; j++){
               
                out.vertices.push(parseFloat(line[j]));
            }
        }
        else if(line[0] == "f"){
            for(var j=2; j<5; j++){
                out.faceindex.push(parseInt(line[j]-1));
            }
        }
        else if((line[0] == '#') || (line[0] == 'g')){
            continue;
        }
    } 
  for(var i=0;i< out.vertices.length/3; i++){
    out.colors.push(1);
    out.colors.push(0);
    out.colors.push(0);
    out.colors.push(1);
  }
  return out;
}




