/**
 * Created by Administrator on 11/13/2014.
 */
var LinkGame=(function(){
    var dom=Document;
    var Grids=(function(){
        var _id= 0,gridNames=["apple","ice-cream","poultry","cookie"];
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
            updateGrid:function(){

            },
            produceGrid:function(size,i,j){
                var grid=new Grid(size,i,j,this.getGridName(i,j));
                _id++;
                this.grids[_id]=grid;
                zp(grid.node).data("id",_id);
                this.map[i][j]=grid;
                return grid;
            },
            getGridName:function(i,j){
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
    var GridEvent=new Class({
        Implements:[Events],
        grids:[],
        initialize:function(){

        },
        addGrid:function(){

        }
    });
    var Grid=(function(){
        return new Class({
            initialize:function(size,row,col,gridName){
                this.row=row;
                this.col=col;
                this.name=gridName;
                this.node=zp("<div class=\"grid "+gridName+"\"></div>").css({width:size,height:size })[0];
                /*this.node.addEvent("click",function(){
                    container.fireEvent("gridCheck")
                })*/
            }
        });
    })();
    var Container=new Class({
        Implements:[Events,Options],
        options:{
            gridSize:60,
            rowTpl: "<div class=\"row\" style=\"width:60px;height:100%;\" ></div>",
            width:600,
            height:600,
            mFc:"linear",
            mDur:1000,
            row:0
        },
        initialize:function(element,options) {
            this.setOptions(options);

            var opts= this.options,
                fragments=[],
                row=zp(opts.rowTpl),
                element=zp(element),self=this,
                rows=opts.width / opts.gridSize,
                cols=opts.height / opts.gridSize;
            this.grids=new Grids(rows,cols);
            this.gameBox=element.find("#gameBox");
            element.css({width: opts.width, height: opts.height});

            for (var i = 0, l = rows; i < l; i++)
                for (var j = 0, ll = cols; j < ll; j++) {
                    var grid=this.grids.produceGrid(opts.gridSize,i,j);
                    //new Grid(this,opts.gridSize,i,j);
                    fragments.push(grid.node);
                    if(j==ll-1){
                        this.gameBox.append(row.html(fragments));
                        //row.animate({top:opts.height-opts.gridSize*(i+1)},opts.mDur);
                        row=zp(opts.rowTpl);
                        fragments=[];
                    }
                }
            this.gameBox.on("click",".grid",function(){
                self.checkGrid(zp(this).data("id"));
            });
            this.gameBox.animate({"translate3d":"0,0%,0"},opts.mDur,opts.mFc);
        },
        checkGrid:function(id){
            var grid=this.grids.getGrid(id),removeGrids=new Array(),row,col,temp;
            if(!grid)
            return false;
            row=grid.row;
            col=grid.col;
            while(this.grids.map[row]&&(temp=this.grids.map[row][--col])&&temp.name==grid.name){
                removeGrids[row].push(temp.node);
            }
            col=grid.col;

            while(this.grids.map[row]&&(temp=this.grids.map[row][++col])&&temp.name==grid.name){
                removeGrids[row].push(temp.node);
            }
            col=grid.col;

            while(this.grids.map[++row]&&(temp=this.grids.map[row][col])&&temp.name==grid.name){
                removeGrids[row].push(temp.node);
            }
            row=grid.row;

            while(this.grids.map[--row]&&(temp=this.grids.map[row][col])&&temp.name==grid.name){
                removeGrids[row].push(temp.node);
            }
            if(removeGrids.length>0){
                removeGrids.push(grid.node);
            }
            //this.updateGrids(removeGrids,"del");
            zp(removeGrids).remove();

        },
        updateGrids:function(grids,type){
           if(type=="del"){
               grids.each(function(item,index){


               })
           }
        }

    });
    Container.implement(addEvent("createGrid",function(grid){
        console.log(this)
    }));
    var Control=new Class({

    });

    return new Class({
        Implements:[Chain,Events,Options],
        options:{
            type:"div"//or canvas
        },
        initialize:function(element,options){
            this.setOptions(options);
            this.root=element;
            if(this.options.type==="div"){
                this.container=new Container(this.options.container);
                this.controls=new Control(this.options.controls);
            }
        },
        initContainer:function(container){
        },
        createGrid:function(){
        }
    });
})();