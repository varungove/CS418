
//recursive Diamond Algorithm
function changeHeight(BL, BR, TL, TR, Array_v)
{
    //base case
    if (TL == TR -1)
        return;
    
    //setting the other points 
    var BC = (BR + BL)/2;
    var middle = (TL + BR)/2;
    var TC = (TR + TL)/2;
    var RC = (TR + BR)/2;
    var LC = (TL + BL)/2;
    
//computing the average
    var avg = Array_v[3*BL + 2] + Array_v[3*BR + 2] + Array_v[3*TL + 2] + Array_v[3*TR + 2];
    
    Array_v[3*TC + 2] = (Array_v[3*TL + 2] + Array_v[3*TR + 2])/2 + 0.0423232;
    Array_v[3*BC + 2] = (Array_v[3*BL + 2] + Array_v[3*BR + 2])/2 + 0.00232312;
    Array_v[3*LC + 2] = (Array_v[3*TL + 2] + Array_v[3*BL + 2])/2 + 0.04232323;
    Array_v[3*RC + 2] = (Array_v[3*BR + 2] + Array_v[3*TR + 2])/2 + 0.0892323;
    Array_v[3*middle + 2] = avg/4 + 0.1232323;
    
    //recursive method calls
    changeHeight(LC, middle, TL, TC, Array_v);
    changeHeight(middle, RC, TC, TR, Array_v);
    changeHeight(BL, BC, LC, middle, Array_v);
    changeHeight(BC, BR, middle, RC, Array_v);
    
    return;
    
    
}//end of ChangeHeight

// Set the Normal for every vertex. 
function normalize(n, Array_f, Array_v, Array_n)
{ 

    var xone, yOne, zOne, xTwo, yTwo, zTwo, xThree, yThree, zThree;

       for(var index=0;index<n*n*2;index++)
       {
            
           
            xThree = Array_v[3*Array_f[3*index+2]];
            yThree = Array_v[3*Array_f[3*index+2]+1];
            zThree = Array_v[3*Array_f[3*index+2]+2];
           
             xTwo = Array_v[3*Array_f[3*index+1]];
            yTwo = Array_v[3*Array_f[3*index+1]+1];
            zTwo = Array_v[3*Array_f[3*index+1]+2];
            xone = Array_v[3*Array_f[3*index]];
           
           
            yOne = Array_v[3*Array_f[3*index]+1];
            zOne = Array_v[3*Array_f[3*index]+2];
           
          
            var v1, v2, v3;
           
           
             v3 = vec3.fromValues(xThree, yThree, zThree);
             v1 = vec3.fromValues(xone, yOne, zOne);
             v2 = vec3.fromValues(xTwo, yTwo, zTwo);
             
           

            var normal1 = vec3.create();
            vec3.subtract(normal1, v2, v1);

            var normal2=vec3.create();
            vec3.subtract(normal2, v3, v1);

            var normal=vec3.create();
            vec3.cross(normal, normal1, normal2);

           
           var xNormal, yNormal, zNormal;
           
            var a = normal[0];
             xNormal = a;
           
           a= normal[1];
             yNormal = a;
           
           a=normal[2];
             zNormal = a;

           
           
           Array_n[3*Array_f[3*index+2]] = Array_n[3*Array_f[3*index+2]] + xNormal;
           
            Array_n[3*Array_f[3*index+2]+1] = Array_n[3*Array_f[3*index+2]+1] + yNormal;
           
            Array_n[3*Array_f[3*index+2]+2] = Array_n[3*Array_f[3*index+2]+2] + zNormal;
           
            Array_n[3*Array_f[3*index]] = Array_n[3*Array_f[3*index]] + xNormal;
            Array_n[3*Array_f[3*index]+1] = Array_n[3*Array_f[3*index]+1] + yNormal;
            Array_n[3*Array_f[3*index]+2] = Array_n[3*Array_f[3*index]+2] + zNormal;
            
            Array_n[3*Array_f[3*index+1]] = Array_n[3*Array_f[3*index+1]] + xNormal;
            Array_n[3*Array_f[3*index+1]+1] = Array_n[3*Array_f[3*index+1]+1] + yNormal;
            Array_n[3*Array_f[3*index+1]+2] = Array_n[3*Array_f[3*index+1]+2] + zNormal;
           
            
       
    
            var normalize_normal = vec3.fromValues(Array_n[3*Array_f[3*index]], Array_n[3*Array_f[3*index]+1], Array_n[3*Array_f[3*index]+2]);
            
           
           
            vec3.normalize(normalize_normal, normalize_normal);   
            Array_n[3*Array_f[3*index]] = normalize_normal[0];
            Array_n[3*Array_f[3*index]+1] = normalize_normal[1];
            Array_n[3*Array_f[3*index]+2] = normalize_normal[2];
            
            normalize_normal = vec3.fromValues(Array_n[3*Array_f[3*index+1]], Array_n[3*Array_f[3*index+1]+1], Array_n[3*Array_f[3*index+1]+2]);       
            vec3.normalize(normalize_normal, normalize_normal);
            Array_n[3*Array_f[3*index+1]] =  normalize_normal[0];
            Array_n[3*Array_f[3*index+1]+1] = normalize_normal[1];
            Array_n[3*Array_f[3*index+1]+2] = normalize_normal[2];
           
           
           
             normalize_normal = vec3.fromValues(Array_n[3*Array_f[3*index+2]], Array_n[3*Array_f[3*index+2]+1], Array_n[3*Array_f[3*index+2]+2]);
            vec3.normalize(normalize_normal, normalize_normal);
            Array_n[3*Array_f[3*index+2]] = normalize_normal[0];
            Array_n[3*Array_f[3*index+2]+1] = normalize_normal[1];
            Array_n[3*Array_f[3*index+2]+2] = normalize_normal[2];
        
       }  


    return;
}

//-------------------------------------------------------------------------
function terrainFromIteration(n, minX,maxX,minY,maxY, Array_v, Array_f,Array_n)
{
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           Array_v.push(minX+deltaX*j);
           Array_v.push(minY+deltaY*i);
           Array_v.push(0);
           
           Array_n.push(0);
           Array_n.push(0);
           Array_n.push(0);
       }
    

     Array_v[3*n*(n+1) + 2] = 0.013232;
    Array_v[3*((n+1)*(n+1)-1) + 2] = 0.077462;
    Array_v[2] = 0.03424343;
    Array_v[3*n + 2] = 0.0823823;
   
    
    
    changeHeight(0, n, n*(n+1), (n+1)*(n+1)-1, Array_v);
    
    
    var numT=0;
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           Array_f.push(vid);
           Array_f.push(vid+1);
           Array_f.push(vid+n+1);
           
           Array_f.push(vid+1);
           Array_f.push(vid+1+n+1);
           Array_f.push(vid+n+1);
           numT+=2;
       }
    
    normalize(n, Array_f, Array_v, Array_n);
    return numT;
}
//-------------------------------------------------------------------------
function generateLinesFromIndexedTriangles(Array_f,lineArray)
{
    numTris=Array_f.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        lineArray.push(Array_f[fid]);
        lineArray.push(Array_f[fid+1]);
        
        lineArray.push(Array_f[fid+1]);
        lineArray.push(Array_f[fid+2]);
        
        lineArray.push(Array_f[fid+2]);
        lineArray.push(Array_f[fid]);
    }
}

//-------------------------------------------------------------------------