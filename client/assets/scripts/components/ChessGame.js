cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot:{
            default:null,
            type:cc.Node
        },
        
        prepareRoot:{
            default:null,
            type:cc.Node   
        }
    },
    onLoad: function () {
        cc.vv.utils.setFitSreenMode();

        this.addComponent("ChessRoom");

        

        this.onlyShowSide();
    },

    onlyShowSide(){
        var sides = ["myself","right","up","left"];
        var gameChild = this.node.getChildByName("game");
        var chs = gameChild.children;
        for(var i = 0; i < chs.length; ++i){
            var sideNode = chs[i]
            let tf = !!sides.includes( sideNode.name );
            sideNode.active = tf;
            if(tf){
                let ts2 = sideNode.children;
                for(let j=0;j<ts2.length;j++){
                    ts2[j].active = ts2[j].name == 'seat'
                }
            }
        }
    }
});