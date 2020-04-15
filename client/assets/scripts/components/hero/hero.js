cc.Class({
    extends: cc.Component,

    properties: {
        headframes: {
            // ATTRIBUTES:
            default: [],        // The default value will be used only when the component attaching
            type: cc.SpriteFrame, // optional, default is typeof default
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // let body = cc.find("body",this.node);
        // let frame = body.getComponent(cc.Sprite).spriteFrame;
        // frame.setRect(new cc.Rect(0,0,20,15));
    },

    // update (dt) {},
});
