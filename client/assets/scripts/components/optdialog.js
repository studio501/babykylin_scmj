const cus_event = require("../cus_event");
cc.Class({
    extends: cc.Component,
    initView() {
        let bgs = ["bg1", "bg0", "bg00"];
        this.bg_arr = [];
        for (var i = 0; i < bgs.length; i++) {
            this.bg_arr.push(this.node.getChildByName(bgs[i]));
        }

        this.label_arr = [];
        for (var i = 0; i < 6; i++) {
            this.label_arr.push(this.node.getChildByName(`lb${i + 1}`).getComponent('cc.Label'));
        }

        cc.vv.utils.addClickEvent(this.node.getChildByName("backBtn"), this.node, "optdialog", "onBackClick");
    },

    setData(label_contens) {
        for (var i = 0; i < label_contens.length; i++) {
            if (this.label_arr[i])
                this.label_arr[i].string = label_contens[i];
        }
    },

    get_back_event() {
        let back_event = this.m_back_event
        if (!back_event) {
            back_event = new cus_event();
            this.m_back_event = back_event
        }
        return back_event;
    },

    onBackClick(event) {
        this.get_back_event().emit();
    }
});
