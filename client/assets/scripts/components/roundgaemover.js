cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        this.m_notice = this.node.getChildByName("notice");
    },

    setData(t_data) {
        this.m_notice.getComponent(cc.Label).string = cc.vv.utils.getLang(t_data.success ? '9' : '10');
    }
});
