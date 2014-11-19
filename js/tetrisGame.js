/**
 * Created by Administrator on 11/13/2014.
 */
/*
 //shape 1
* 1 1 1
* 1 1 1
* 1 1 1
*
* //shape 2
* 1
* 1 1 1 1
*
* //shape 3
*       1
* 1 1 1 1
*
* //shape 4
*   1
* 1 1 1
*
 * //shape 5
* 1 1 1 1
*
* //shape 6
* 1 1
*   1 1
*
* */
(function(zp,w){

    w.TetrisGame=(function(){
        var gridsArr=[
            [
                [[1,1,1],[1,1,1],[1,1,1]]
            ],
            [
                [[1,0,0,0],[1,1,1,1]],
                [[1,1,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
                [[1,1,1,1],[0,0,0,1]],
                [[0,1,0,0],[0,1,0,0],[0,1,0,0],[1,1,0,0]]
            ],
            [
                [[0,0,0,1],[1,1,1,1]],
                [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,0,0]],
                [[1,1,1,1],[1,0,0,0]],
                [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,0,0]]
            ],
            [
                [[0,1,0],[1,1,1]],
                [[1,1,1],[0,1,0]]
            ],
            [
                [[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
                [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]]
            ],
            [
                [[1,1,0],[0,1,1]],
                [[0,0,1],[1,1,0],[1,0,0]]
            ],
            [
                [[0,1,1],[1,1,0]],
                [[1,0,0],[0,1,1],[0,0,1]]
            ]
        ];
        var GridMap=(function(){
            var isFill= 1;
            return new Class({
                Implements:[Events,Chain],
                initialize:function(rows,cols){
                    this.rows=rows;
                    this.cols=cols;
                    this.data=(function(r,c){
                        var a=[];
                        for(var i= 0;i<r;i++){
                            a[i]=new Array(c);
                            a[i].each(function(item){
                                item=!isFill;
                            })
                        }
                        return a;
                    })(rows,cols);
                },
                reset:function(){
                    this.data.each(function(row){
                        row.each(function(item){
                            item=!isFill;
                        });
                    })
                },
                fill:function(row,col){
                    this.data[row][col]=isFill;
                },
                isFill:function(row,col){
                    try{
                        return this.data[row][col]&&this.data[row][col]===isFill;

                    }catch(e) {
                        console.log(row,col)
                    }
                }
            });
        })();
        var Grid=new Class({
            Implements:[Events,Options],
            initialize:function(data,start){
                this.data=data;
                this.frameIndex=0;
                this.frameLen=this.data.length;
                this.frame=this.data[this.frameIndex];
                this.row=0;
                this.col=start;
                this.isStop=false;
            },
            setFrame:function(){
                  if(this.frameIndex==this.frameLen-1){
                      this.frameIndex=0;
                  }else{
                      this.frameIndex++;
                  }
                  this.frame=this.data[this.frameIndex];
            },
            getHeight:function(){
                var len=0;
                this.frame.each(function(item){
                    len+=item.join("").indexOf("1")>-1;
                });
                return len+this.row;
            }
        });
        return new Class({
            Implements:[Events,Options,Chain],
            options:{
                width:300,
                height:540,
                size:30,
                level:"easy",
                levelMap:{easy:100,middle:75,hard:50},
                stepTime:5,
                step:10,
                startNo:null,
                waitTime:150,
                total:0,
                onClass:"on",
                gridTpl:function(){
                    return (new Element("div")).addClass("grid").setStyles({width:this.size,height:this.size});
                }
            },
            initialize:function(element,options){

                this.setOptions(options);
                this.root=element;
                this.timer=null;
                this.curGrid=null;
                var opts=this.options,
                    container=$(opts.container),
                    self=this,rows=opts.height/opts.size,cols=opts.width/opts.size;
                container.setStyles({width: opts.width, height: opts.height});
                this.opts=this.options;
                this.gameBox=$("gameBox");
                this.gridMap=new GridMap(rows,cols);
                for(var i= 0,l=rows*cols;i<l;i++){
                    this.gameBox.adopt(opts.gridTpl());
                }
                this.startNo=opts.startNo||opts.width/(2*opts.size)-2;
                this.setLevel(this.level);
                this.start();
            },
            setLevel:function(level){
                var level=level||"easy";
                this.opts.stepTime=this.opts.stepTime||this.opts.levelMap[level];
            },
            start:function(){
                if(this.curGrid==null){
                    this.produceGrid();
                }else{
                    this.renderGrid("down");
                }
                this.timer=this.start.delay(this.opts.stepTime,this);
            },
            isBottom:function(){
                    return this.curGrid.getHeight()==this.gridMap.rows ;
            },
            produceGrid:function(){
                this.curGrid=new Grid(gridsArr[4/*Number.random(0,gridsArr.length-1)*/],this.startNo);
                this.printGrid();
            },
            printGrid:function(){
                var data=this.curGrid.frame,rows= data.length,cols=data[0].length,div="■",
                    str="■",out="\r\n",end="\r\n";
               for(var i= 0,l=rows;i<l;i++){
                   for(var j= 0,ll=cols;j<ll;j++){
                        if(data[i][j]===0){
                            out+=str.replace(div," ");
                        }else{
                            out+=str;
                        }
                   }
                   out+=end;
               }
               console.log(out);
            },
            renderGrid:function(dir){
                var frame=this.curGrid.frame,
                    sRow=this.curGrid.row,
                    sCol=this.curGrid.col,
                    onClass=this.options.onClass;
                // console.log(sRow,sRow+frame.length,totalRows)
                if(this.canMove(dir)) {
                    $$(this.getNodes(sRow,sCol,frame)).removeClass(onClass);
                    switch (dir){
                        case "down":
                            sRow=++this.curGrid.row;
                            break;
                        case "rotate":
                            break;
                        case "left":
                            sCol=--this.curGrid.col;
                            break;
                        case "right":
                            sCol=--this.curGrid.col;
                            break;
                    }
                    $$(this.getNodes(sRow,sCol,frame)).addClass(onClass);
                }
                if(dir=="down"&&!this.canMove()){
                    //移动后判定 当前高度包括自身和游戏容器高度相等时且动作是向下时
                    // 删除curGrid
                    this.recordMap();
                    this.curGrid=null;
                    return false;
                }
            },
            getNodes:function(sRow,sCol,frame){
                var nodes=[],totalCols=this.gridMap.cols;
                for(var row= sRow,lRow=frame.length;row<lRow+sRow;row++){
                    for(var col= sCol,lCol=frame[0].length;col<sCol+lCol;col++){
                        if(frame[row-sRow][col-sCol]===1){
                            nodes.push(this.gameBox.getChildren(".grid:nth-child("+(row*totalCols+col+1)+")"));
                        }
                    }
                }
                return  nodes;
            },
            canMove:function(dir){
                var vFlag=0,hFlag= 0,grid=this.curGrid,frame=grid.frame,
                    sRow=this.curGrid.row,
                    sCol=this.curGrid.col;         //vFlag下落标记，hFlag左右移动标记-1:left 1:right
                if(this.isBottom()&&!dir||this.curGrid.isStop){
                    return false;
                }
                if(dir){
                    switch (dir){
                        case "down":
                            vFlag=1;
                        case "left":
                            hFlag=-1;break;
                        case "right":
                            hFlag=1;break;
                        default :

                    }
                    if(grid.col+hFlag<0||grid.col+hFlag>this.opts.cols-frame[0].length){
                        return false;
                    }else{
                        ////判断移动动作是否可行

                        for(var row= sRow,lRow=frame.length;row<lRow+sRow;row++){
                            for(var col= sCol,lCol=frame[0].length;col<sCol+lCol;col++){
                                if(frame[row-sRow][col-sCol]===1){
                                    if(this.gridMap.isFill(row+vFlag,col+hFlag)){
                                        this.curGrid.isStop=true;
                                        return false;
                                    }
                                    // nodes.push(this.gameBox.getChildren(".grid:nth-child("+(row*totalCols+col+1)+")"));
                                }
                            }
                        }

                    }
                }


                return true;
            },
            pause:function(){

            } ,
            recordMap:function(){
                var frame=this.curGrid.frame,
                    sRow=this.curGrid.row,
                    sCol=this.curGrid.col;
                for(var row= sRow,lRow=frame.length;row<lRow+sRow;row++){
                    for(var col= sCol,lCol=frame[0].length;col<sCol+lCol;col++){
                        if(frame[row-sRow][col-sCol]===1){
                            this.gridMap.fill(row,col);
                        }
                    }
                }
            }
        })
    })();
})(undefined,window);

