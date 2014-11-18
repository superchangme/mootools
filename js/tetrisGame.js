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
    var GridMap=(function(){
        var isFill= 1;
        return new Class({
            Implements:[Events,Options,Chain],
            options:{
                rows:0,
                cols:0
            },
            initialize:function(el,options){
                this.setOptions(options);
                this.data=(function(r,c){
                    var a=[];
                    for(var i= 0;i<r;i++){
                        a[i]=new Array(c);
                        a[i].each(function(item){
                            item=!isFill;
                        })
                    }
                    return a;
                })(this.options.rows,this.options.cols);
            },
            reset:function(){
                this.data.each(function(row){
                    row.each(function(item){
                       item=!isFill;
                    });
                })
            }
        });
    })();

    w.TetrisGame=(function(){
        var grids=[
            [[1,1,1],[1,1,1],[1,1,1]],
            [[1,0,0,0],[1,1,1,1]],
            [[0,0,0,1],[1,1,1,1]],
            [[0,1,0],[1,1,1]],
            [1,1,1,1],
            [[1,1,0],[0,1,1]]
        ];

        return new Class({
            Implements:[Events,Options,Chain],
            options:{
                width:300,
                height:540,
                size:30,
                total:0,
                highlight:"red",
                gridTpl:function(){
                    return (new Element("div")).addClass("grid").setStyles({width:this.size,height:this.size});
                }
            },
            initialize:function(element,options){
                this.setOptions(options);
                this.root=element;
                var opts=this.options,
                    container=$(opts.container),
                    self=this,rows=opts.width*opts.height,cols=opts.width*opts.height;

                container.setStyles({width: opts.width, height: opts.height});
                this.gameBox=$("gameBox");
                this.gridMap=new GridMap(rows,cols);
                for(var i= 0,l=rows*cols/(opts.size*opts.size);i<l;i++){
                    this.gameBox.adopt(opts.gridTpl());
                }
                this.start();
            },
            start:function(){
                timer=Fun.delay(5000);
            },
            pause:function(){

            }
        })
    })();
})(undefined,window);

