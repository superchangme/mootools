/**
 * Created by tom.chang on 2014/12/18.
 */
var app={};
;(function(w,forage,tmpl) {
    //MVC
   var ENTER_KEY = 13;
   var ESC_KEY = 27;
   var todoModel={title:"",completed:false};
   var todos=new Class({
       initialize: function () {
           var self=this;
           this.items=[];
           this.index=0;
           this.remaining=0;
           this.completed=0;
           forage.getItem("todos", function (err, items) {
               if(err){
                   console.error(err)
               }
               if(items){
                   self.items=items;
                   self.index=items.length;
                   items.each(function(model){
                      if(model.completed){
                          self.completed++;
                      }else{
                          self.remaining++;
                      }
                   });
                   console.log(items)
                   app.todoView.updateList(items);
               }
           });
       },
       addOrUpdate:function(models){
           var self=this;
           models.each(function(model){
               var index=self.getIndex(model.id);
               if(!index){
                   model.id=String.uniqueID();
                   self.items.push(model);
                   self.index++;
               }else{
                   self.items[index]=model;
               }
           });
           forage.setItem("todos",this.items);
       },
      getIndex:function(id){
         for(var i= 0,l=this.items.length;i<l;i++){
             if(this.items[i].id==id){
                 return i;
             }
         }
      },
      findOne:function(id){
          for(var i= 0,l=this.items.length;i<l;i++){
              if(this.items[i].id==id){
                  return this.items[i];
              }
          }
      }
       ,removeOne:function(id){
           for(var i= 0,l=this.items.length;i<l;i++){
               if(this.items[i].id==id){
                   this.items.splice(i,1);
                   break;
               }
           }
           forage.setItem("todos",this.items);
       },
       changeState:function(models,completed){
           var self=this;
           models.each(function(model){
                  model.completed= completed!=undefined ? completed:!model.completed;
                  self.remaining-=Number(model.completed);
                  self.completed+=Number(model.completed);
                  self.items[self.getIndex(model.id)]=model;

           });
           console.log(this.items)
           forage.setItem("todos",this.items);
       }
   });

    var todoView=new Class({
        Implements: [Events, Options, Chain],
        options:{
            $list:$("todo-list"),
            $allCheckbox:$('toggle-all'),
            $input:$('new-todo'),
            $footer:$('footer'),
            $main :$('main'),
            itemTpl:tmpl("item-template"),
            statusTpl:tmpl("stats-template")
        },
        updateList:function(models,isEdit){
            var nodes=[],self=this;
            //from store
            if(!isEdit){
                models.each(function(item){
                    var $li=new Element("<li></li>");
                    if(item.completed){
                       $li.addClass("completed");
                    }
                    $li.retrieve("id",item.id);
                    $li.innerHTML=self.options.itemTpl(item);
                    nodes.push($li);
                });
                this.options.$list.adopt(nodes);
                if(app.todos.remaining===0){
                    this.options.$allCheckbox.setProperty("checked",true);
                }
            }else{
                app.todos.addOrUpdate(models);
            }
        },
        enter:function(e) {
            if (e.code == ENTER_KEY) {
                var model, val = e.target.value, isEdit = false;
                if ($(e.target).hasClass("edit")) {
                    isEdit = true;
                    this.doEdit(e);
                }else{
                  this.options.$input.value="";
                }
                if (!model) {
                    model = Object.merge(todoModel, {title: val});
                }
                app.todos.addOrUpdate([model]);
                this.updateList([model], isEdit);
            }
        },
        canEditor:function(e){
            var $li=$(e.target).getParents("li")[0];
            $li.addClass("editing");
            $li.getChildren(".edit")[0].focus();
        },
        doEdit:function(e){
            var $li=$(e.target).getParents("li")[0],id=$li.retrieve("id"),val= e.target.value,model;
            model = app.todos.findOne(id);
            model = Object.merge(model, {title: val});
            app.todos.addOrUpdate([model]);
            $li.getElements("label")[0].innerText=val;
            $li.removeClass("editing");
            e.target.value="";
        },
        remove:function(e){
            var $li=$(e.target).getParents("li")[0],id=$li.retrieve("id");
             $li.remove();
             app.todos.removeOne(id);
        },
        toggleState:function(all,e){
            var models,completed;
            if(all){
                completed=$(e.target).getProperty("checked")===true;
                models = app.todos.items;
                if(completed){
                    this.options.$list.getChildren("li").addClass("completed");
                    this.options.$list.getElements(".toggle").setProperty("checked",true);
                }else{
                    this.options.$list.getChildren("li").removeClass("completed");
                    this.options.$list.getElements(".toggle").setProperty("checked",false);
                }
            }else{
                var $li=$(e.target).getParents("li")[0],id=$li.retrieve("id");
                models = [app.todos.findOne(id)];
                $li.toggleClass("completed");
                if(this.options.$list.getElements(".toggle:not(:checked)").length==0){
                    this.options.$allCheckbox.setProperty("checked",true);
                }
                if($(e.target).getProperty("checked")===false){
                    this.options.$allCheckbox.setProperty("checked",false);
                }
            }
            app.todos.changeState(models,completed);
        },
        initialize: function (options) {
            var opts;
            this.setOptions(options);
            opts =this.options;
            opts.$input.addEvent("keypress",this.enter.bind(this));
            opts.$list.addEvent("dblclick:relay(label)",this.canEditor);
            opts.$list.addEvent("keypress:relay(input)",this.enter.bind(this));
            opts.$list.addEvent("blur:relay(input)",this.doEdit);
            opts.$list.addEvent("click:relay(.destroy)",this.remove);
            opts.$list.addEvent("change:relay(.toggle)",this.toggleState.bind(this,false));
            opts.$allCheckbox.addEvent("change",this.toggleState.bind(this,true));
        }
    });
   app.todos = new todos();
   app.todoView =  new  todoView();

})(window,localforage,tmpl,app);
