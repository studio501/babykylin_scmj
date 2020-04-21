
cc.Class({
    extends: cc.Component,

    properties: {
        cellWidth: 100,
        cellHeight: 30,
    },

    // LIFE-CYCLE CALLBACKS:

    initView() {
        this.bg_arr = [
            this.onDestroy.getChildByName("bg1"),
            this.onDestroy.getChildByName("bg0"),
            this.onDestroy.getChildByName("bg00")
        ]
    },

    onLoad() {

    },

    start() {

    },

    setCellSize(tw, th) {
        this.cellWidth = tw;
        this.cellHeight = th;

        this.setBgDimension(tw, "width");
    },

    setBgDimension(value, key) {
        key = key || "width";
        for (var i = 0; i < this.bg_arr.length; i++) {
            this.bg_arr[i][key] = value + i * 4;
        }
    },

    setContent(content) {
        if (!content || content.length === 0) {
            return;
        }
        if (this.m_content === content) {
            return;
        }
        this.m_content = content;

        let cell_num = content.length;
        this.setBgDimension(this.cellHeight * cell_num, "height");
    }

    // update (dt) {},
});
