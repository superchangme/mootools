/**
 * Created by Administrator on 11/13/2014.
 */
var LinkGame=(function(){
    var dom=Document;
    Array
    var Grids=(function(){
        var _id= 0,classNames=["apple","ice-cream","poultry","cookie"];
        return new Class({
            initialize:function(rows,cols){
                this.grids={};
                this.gridMap=new Array()
            },
            getGrid:function(id){
                return this[id];
            },
            update:function(grid){
                _id++;
                zp(grid.node).data("id",_id);
                this.grids[_id]=grid;
            },
            produceGrid:function(size,i,j){
                var className=this.getClassName(i,j);
                return new Grid(size,i,j,className)
            },
            getClassName:function(i,j){

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
            initialize:function(size,row,col,className){
                this.row=row;
                this.col=col;
                this.node=zp("<div class=\"grid"+className+"\"></div>").css({width:size,height:size })[0];
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
            width:600,
            height:600,
            mFc:"linear",
            mDur:1000
        },
        initialize:function(element,options) {
            var opts,
                fragments=[],
                row=zp("<div class=\"row\"></div>"),
                element=zp(element),self=this,
                rows=opts.width / opts.gridSize,
                cols=opts.height / opts.gridSize;
            this.setOptions(options);
            this.grids=new Grids();
            this.gameBox=element.find("#gameBox");
            opts = this.options;

            element.css({width: opts.width, height: opts.height});

            for (var i = 0, l = rows; i < l; i++)
                for (var j = 0, ll = cols; j < ll; j++) {
                    var grid=this.grids.produceGrid(this,opts.gridSize,i,j);
                    //new Grid(this,opts.gridSize,i,j);
                    fragments.push(grid.node);
                    if(j==ll-1){
                        this.gameBox.append(row.html(fragments));
                        //row.animate({top:opts.height-opts.gridSize*(i+1)},opts.mDur);
                        row=zp("<div class=\"row\"></div>");
                        fragments=[];
                    }
                }
            this.gameBox.on("click",".grid",function(){
                self.checkGrid(zp(this).data("id"));
            });
            this.gameBox.animate({"translate3d":"0,0%,0"},opts.mDur,opts.mFc);
        },
        checkGrid:function(id){
            var grid=this.grids.getGrid(id);
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