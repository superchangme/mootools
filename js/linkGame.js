/**
 * Created by Administrator on 11/13/2014.
 */
(function(zp,w){
    w.LinkGame=(function(){
        var dom=Document,_width=_height=600,_gridSize=60;
        if(window.navigator.userAgent.toLowerCase().indexOf("mobile")>-1
        &&window.navigator.userAgent.toLowerCase().indexOf("pad")==-1){
            _width=300;_gridSize=50;_height=400;
            $$("body").addClass("mobile");
        }

        var Grids=(function(){
            var _id= 0,gridNames=["apple","ice-cream","poultry","cookie","other"],
                createCount=10;
            return new Class({
                initialize:function(rows,cols){
                    this.grids={};
                    this.map=(function(r,c){
                        var a=[];
                        for(var i= 0;i<rows;i++){
                            a[i]=new Array(cols);
                        }
                        return a;
                    })(rows,cols)
                },
                getGrid:function(id){
                    return this.grids[id];
                },
                delGrid:function(gridOrId){
                    var grid=typeOf(gridOrId)!=="string"?gridOrId:this.getGrid(gridOrId);
                    if(grid){
                        this.map[grid.row][grid.col]=null;
                        grid=null;
                    }
                },
                initParent:function(row,parent){
                    this.map[row].parentNode = parent;
                    this.map[row].top = 0;
                },
                updateGrid:function(){

                },
                produceGrid:function(size,i,j){
                    var grid=new Grid(size,i,j,this.getGridName(i,j));
                    _id++;
                    this.grids[_id]=grid;
                    grid.node.store("id",_id);
                    this.map[i][j]=grid;
                    //记录列

                    return grid;
                },
                preCreate:function(){

                },
                getGridName:function(i,j){
                    //return gridNames[0];
                    var names=gridNames.clone(),temp,temp1,both=false,siblings=[];
                    for(var r=i+1;r>i-2;r--)
                        for(var c=j-1;c<j+2;c++){
                            if(this.map[r]&& (temp=this.map[r][c])){
                                temp1=this.map[r]&&this.map[r][c+1];
                                if(temp1&&temp1.name==temp.name){
                                    both=true;
                                    break;
                                }
                                temp1=this.map[r-1]&&this.map[r-1][c];
                                if(temp1&&temp1.name==temp.name){
                                    both=true;
                                    break;
                                }
                            }
                        }
                    if(both){
                        if(this.map[i-1]&&(temp=this.map[i-1][j])){
                            siblings.push(temp.name);
                        }
                        if(this.map[i+1]&&(temp=this.map[i+1][j])){
                            siblings.push(temp.name);
                        }
                        if(this.map[i]&&(temp=this.map[i][j-1])){
                            siblings.push(temp.name);
                        }
                        if(this.map[i]&&(temp=this.map[i][j+1])){
                            siblings.push(temp.name);
                        }
                        names=names.filter(function(item){
                            return siblings.indexOf(item)==-1;
                        });
                        if(names.length==0){
                            names=gridNames.clone();
                        }
                        return names[Number.random(0,names.length-1)];
                    }
                    switch (Number.random(0,1)){
                        case 0:
                            for(var r= i-1;r<i+2;r++){
                                if(this.map[r] && (temp=this.map[r][j])){
                                    var index=names.indexOf(temp.name);
                                    names.splice(index,1);
                                }
                            }
                            break;
                        case 1:
                            for(var r= j-1;r<j+2;r++){
                                if(this.map[i] && (temp=this.map[i][r])){
                                    var index=names.indexOf(temp.name);
                                    names.splice(index,1);
                                }
                            }
                            break;
                    }
                    return names[Number.random(0,names.length-1)];
                }
            });
        })();
        //方格类 存放方格dom节点 和位置
        var Grid=(function(){
            return new Class({
                initialize:function(size,row,col,gridName){
                    var el=new Element("div");
                    el.addClass("grid "+gridName).setStyles({width:size,height:size });
                    this.row=row;
                    this.col=col;
                    this.name=gridName;
                    this.node=el;
                    /*this.node.addEvent("click",function(){
                     container.fireEvent("gridCheck")
                     })*/
                }
            });
        })();
        //游戏主类

        return new Class({
            Implements:[Events,Options],
            options:{
                gridSize:_gridSize,
                rowTpl: function(){
                    return (new Element("div")).addClass("row").setStyles({width:this.gridSize,height:"100%"});
                },
                addTpl: function(){
                    return (new Element("div")).addClass("add");
                },
                mFc:"linear",
                mDur:250,
                rows:0,
                cols:0,
                onAddScore:function(count){
                    var self;
                    this.scores+=count;
                    this.addScore.set("text","+ "+count).removeClass("hide").tween("margin-top","50","-50",function(el){
                    });
                    $("scores").set("text",this.scores);
                }
            },
            initialize:function(element,options) {
                this.setOptions(options);
                var opts= this.options,
                    container=$(opts.container),self=this;
                this.root=element;
                element.setStyle("width",_width);
                container.setStyles({width: _width, height: _height});

                opts.rows=_width/ opts.gridSize;
                opts.cols=_height / opts.gridSize;

                this.grids=new Grids(opts.rows,opts.cols);
                this.gameBox=$("gameBox");
                this.addScore=$("addScore").set("tween", {
                    duration:300,transition:"sine:out",onComplete:function(el){
                            el.addClass("hide");
                        }
                    });
                this.scores=0;
                this.loadFirst=true;
                this.animated=false;
                do{
                    this.initGrids();
                }while(this.checkIsOver());
                this.gameBox.addEvent("click:relay(.grid)", function(event,node){
                    if(!self.animated){self.checkGrid(node.retrieve("id"));}
                });
                this.gameBox.addClass("in");
            },
            initGrids:function(){
                var fragments=[],opts=this.options,
                    row;
                for (var i = 0, l = opts.rows; i < l; i++) {
                    if (this.loadFirst) {
                        row = opts.rowTpl();
                    } else {
                        row = this.grids.map[i].parentNode;
                        row.getChildren().destroy();//remove old grids
                    }
                    for (var j = 0, ll = opts.cols; j < ll; j++) {
                        var grid = this.grids.produceGrid(opts.gridSize, i, j);
                        //new Grid(this,opts.gridSize,i,j);
                        fragments.push(grid.node);
                        if (j == ll - 1) {
                            if (this.loadFirst) {
                                this.gameBox.adopt(row.adopt(fragments));
                            }else{
                                row.adopt(fragments);
                            }
                            this.grids.initParent(i, row);
                            //row.animate({top:opts.height-opts.gridSize*(i+1)},opts.mDur);
                            fragments = [];
                        }
                    }
                }
                if(this.loadFirst){
                    this.loadFirst=false;
                }
            },
            preCreate:function(){

            },
            checkIsOver:function(){
                var checkedMap=[],sameGrids,self=this;
                this.grids.map.each(function(row){
                    row.each(function(item){
                       if(checkedMap.indexOf(item)==-1){
                           checkedMap.push(self.getSameGrids(item));
                           checkedMap=checkedMap.flatten();
                       }
                    });
                });
                return checkedMap.length==0;
            },
            checkGrid:function(id){
                this.animated=true;
                var cGrid=this.grids.getGrid(id),temp,removeGrids,self=this;

                if(!cGrid)
                    return false;
                removeGrids=this.getSameGrids(cGrid);
                if(removeGrids.join(",").replace(/,/g,"").length>0){
                    removeGrids[cGrid.row].push(cGrid);
                    this.updateGrids(removeGrids,"del");
                }
                this.animated=false;
            },
            getSameGrids:function(cGrid){
                var removeGrids=(function(r,c){
                    var a=[];
                    for(var i= 0;i<r;i++){
                        a[i]=new Array(c);
                    }
                    return a;
                })(this.options.rows,this.options.cols),removeArr=[],self=this;

                function getSame(grid,row,col,from){
                    if(from!="col") {
                        while (self.grids.map[row] && (temp = self.grids.map[row][--col])&&temp!==cGrid
                        && temp.name == grid.name&&removeArr.indexOf(temp.row+""+temp.col)==-1) {
                            removeGrids[row].push(temp);
                            removeArr.push(temp.row+""+temp.col);
                            getSame(temp,row,col,"col");
                        }
                        col=grid.col;
                    }
                    if(from!="col"){
                        while(self.grids.map[row]&&(temp=self.grids.map[row][++col])&&temp!==cGrid
                        && temp.name == grid.name&&removeArr.indexOf(temp.row+""+temp.col)==-1){
                            removeGrids[row].push(temp);
                            removeArr.push(temp.row+""+temp.col);
                            getSame(temp,row,col,"col");
                        }
                        col=grid.col;
                    }

                    if(from!="row"){
                        while(self.grids.map[++row]&&(temp=self.grids.map[row][col])&&temp!==cGrid
                        && temp.name == grid.name&&removeArr.indexOf(temp.row+""+temp.col)==-1){
                            removeGrids[row].push(temp);
                            removeArr.push(temp.row+""+temp.col);
                            getSame(temp,row,col,"row");
                        }
                        row=grid.row;
                    }

                    if(from!="row"){
                        while(self.grids.map[--row]&&(temp=self.grids.map[row][col])&&temp!==cGrid
                        && temp.name == grid.name&&removeArr.indexOf(temp.row+""+temp.col)==-1){
                            removeGrids[row].push(temp);
                            removeArr.push(temp.row+""+temp.col);
                            getSame(temp,row,col,"row");
                        }
                    }
                }
                getSame(cGrid,cGrid.row,cGrid.col);
                return removeGrids;
            },
            updateGrids:function(grids,type){
                var self=this,delNodes;
                if(type=="del"){
                    delNodes=grids.flatten().map(function(item){return item&&item.node;});
                    this.fireEvent("addScore",delNodes.length);
                    $$(delNodes).destroy();
                    grids.each(function(row,index){
                        var step= 0,delCol=[];
                        row.each(function(item,i){
                            step++;
                            delCol.push(item.col);
                            self.grids.delGrid(item);
                        });
                        if(step!=0){
                            delCol=delCol.sort(function(a,b){
                                return   a- b;
                            });
                            self.updatePos(index,delCol);
                            self.addGrid(index,delCol);
                            self.moveGrid(index,step);
                            /*self.grids.map[index].each(function(item){
                                console.log(index+"---"+item.name)
                            })*/
                            //console.log("---------end----")
                        }
                    });
                    while(this.checkIsOver()){
                        this.initGrids();
                    }
                   /*
                    grids.each(function(row,index){
                        var isClick=false;
                        row.sort(function(a,b){
                            return a.col- b.col;
                        }).each(function(item){
                            if(isClick)
                                return false;
                            isClick=true;
                            self.grids.map[index][item.col].node.click();
                        });
                    });*/
                }
            } ,
            addGrid:function(index,delCol){
                var fragments=this.options.addTpl(),
                    row=this.options.rowTpl(),grid,cols=this.options.cols,from,parent=this.grids.map[index].parentNode;
                for(var col= 0,l=delCol.length-1;col<=l;col++){
                    grid=this.grids.produceGrid(this.options.gridSize,index,col);
                    fragments.adopt(grid.node);
                }
                parent.getChildren(":nth-child(-n+"+delCol[delCol.length-1]+")").inject(fragments);
                parent.grab(fragments,"top");
            },
            moveGrid:function(index,step){
                var  top=-this.options.gridSize*step,grid,
                    parent=this.grids.map[index].parentNode
                    ,wrap=$$(parent).getChildren(".add")[0];
                wrap.setStyle("top",top);
                wrap.set("tween", {
                    duration: step * this.options.mDur,
                    transition: "Cubic:In:Out",
                    link:"cancel",
                    onComplete: function (element) {
                        element.getChildren().inject(element, 'before');
                        element.remove();
                    }
                });
                wrap.tween("top",top,0);
            },
            updatePos:function(index,delCol){
                var self=this,temp,to;
                //asc 9-8-7-6...

                //if del 9,8 then move 7 to 9 ,6 to 8 ,5 to 7 ...
                //console.log("before",delCol,this.grids.map[index])
                //console.log(delCol) total
                //it will confuse u
                to=delCol[delCol.length-1];
                if(delCol.length!=this.options.cols){
                    for(var col=delCol[delCol.length-1];col>=delCol.length;col--){
                        self.grids.map[index][col]=self.grids.map[index][col-delCol.length];
                        self.grids.map[index][col].col=col;
                        self.grids.map[index][col-delCol.length]=null;
                    }
                }

                //console.log("after",this.grids.map[index])
                /*   for(var i= 0,l=row.length;i<l;i++){

                 }*/
            }

        });

        var Control=new Class({
            initialize:function(element){
            }
        });


    })();
})(undefined,window);