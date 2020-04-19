cc.Class({
    extends: cc.Component,
    initView () {
        this.hppro = cc.find('hp',this.node).getComponent(cc.ProgressBar);
        this.mppro = cc.find('mp',this.node).getComponent(cc.ProgressBar);
    },

    onLoad () {

    },

    setPro(data){
        if(data.hp && data.curhp)
            this.hppro.progress = data.curhp / data.hp;

        if(data.mp && data.curmp)
            this.mppro.progress = data.curmp / data.mp;
    }
});
