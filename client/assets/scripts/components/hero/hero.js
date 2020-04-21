cc.Class({
    extends: cc.Component,

    properties: {
        headframes: {
            // ATTRIBUTES:
            default: [], // The default value will be used only when the component attaching
            type: cc.SpriteFrame, // optional, default is typeof default
        },
        _initScale: 3,
        _focusDeltal: 5
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {

    },
    initView() {
        let tn = this.node;
        tn.scale = this._initScale;
        this.m_ori_p = tn.position;
        this.m_root = this.node.getChildByName("root");
        this.m_hpmp = cc.find('statusroot', tn).addComponent('hpmp');
        this.m_hpmp.initView();
        this.m_body_i = cc.find('root/body_i', tn);
        this.m_body_i_p = this.m_body_i.position;
        this.m_atktoggles = [
            [this.m_body_i, cc.find('root/foot_i', tn)],
            [cc.find('root/body_a', tn), cc.find('root/foot_a', tn)]
        ];

        this.m_funbtnRoot = cc.find('root/funbtns', tn);
        this.m_funbtns = [];
        for (let i = 0; i < 7; i++) {
            var key = `funbtn${i + 1}`;
            this.m_funbtns.push(this.m_funbtnRoot.getChildByName(key));
        }

        this.m_triangle = cc.find('root/focus/tri', tn);
        this.m_focus = cc.find('root/focus', tn);

        this.toggleAtk(false);
        this.idle();

        cc.vv.utils.addClickEvent(cc.find('touch/touchbtn', tn), this.node, "hero", "onTouchbtnClick");
    },

    start() {
        // let body = cc.find("body",this.node);
        // let frame = body.getComponent(cc.Sprite).spriteFrame;
        // frame.setRect(new cc.Rect(0,0,20,15));
    },

    setData(data) {
        if (!data) {
            console.error("hero set data null");
            return;
        }
        this.m_data = data;
        this.m_hpmp.setPro(data);
        this.toggleFocus(data.group === 0 && data.act_state === 1);
    },

    toggleAtk(isAtk) {
        let ti = isAtk ? 1 : 0;
        let atks = this.m_atktoggles;
        for (let i = 0; i < atks.length; i++) {
            let is_show = i == ti;
            for (let j = 0; j < atks[i].length; j++) {
                atks[i][j].active = is_show;
            }
        }
    },

    attack(pos) {
        this.try_clean_idle();
        this.try_clean_atk();
        this.node.position = this.m_ori_p;
        let self = this;
        let go_dt = 0.5;
        let back_dt = 0.4
        let dl_dt = 0.1
        this.m_atkAct = this.node.runAction(cc.spawn(
            cc.sequence(cc.moveTo(go_dt, cc.v2(pos.x, pos.y)), cc.delayTime(dl_dt), cc.moveTo(back_dt, cc.v2(self.m_ori_p.x, self.m_ori_p.y)), cc.callFunc(function () {
                self.idle();
            })),
            cc.sequence(cc.delayTime(go_dt - dl_dt), cc.callFunc(function () {
                self.toggleAtk(true)
            }), cc.delayTime(dl_dt * 2), cc.callFunc(function () {
                self.toggleAtk(false)
            }))
        ))
    },


    idle() {
        this.try_clean_idle();
        this.try_clean_atk();
        let tx = this.m_body_i_p.x;
        let ty = this.m_body_i_p.y;
        this.m_idleAct = this.m_body_i.runAction(
            cc.repeatForever(cc.sequence(cc.moveTo(0.2, cc.v2(tx, ty + 1)),
                cc.moveTo(0.3, cc.v2(tx, ty)))));
    },

    try_clean_idle() {
        if (this.m_idleAct) {
            this.node.stopAction(this.m_idleAct);
            this.m_idleAct = null;
        }
    },
    try_clean_atk() {
        if (this.m_atkAct) {
            this.node.stopAction(this.m_atkAct);
            this.m_atkAct = null;
        }
    },

    try_clean_focus() {
        if (this.m_focusAct) {
            this.m_triangle.stopAction(this.m_focusAct);
            this.m_focusAct = null;
        }
    },

    setDirection(faceToRight) {
        if (this.m_faceToRight === faceToRight) {
            return;
        }
        this.m_faceToRight = faceToRight
        this.m_root.scaleX = faceToRight ? 1 : -1;
        for (let i = 0; i < this.m_funbtns.length; i++) {
            this.m_funbtns[i].scaleX = faceToRight ? 1 : -1;
        }
    },

    showFunctionBtns(isShow) {
        this.m_funbtnRoot.active = isShow;
    },

    toggleFocus(isFocus) {
        if (this.m_isFocus === isFocus) {
            return;
        }
        this.m_isFocus = isFocus
        this.m_focus.active = isFocus;
        this.m_triangle.active = isFocus;
        this.showFunctionBtns(isFocus);
        let ox = this.m_triangle.m_origin_x;
        if (!ox) {
            ox = this.m_triangle.x;
            this.m_triangle.m_origin_x = ox;
        }
        let oy = this.m_triangle.y;
        if (isFocus) {
            this.try_clean_focus();
            this.m_focusAct = this.m_triangle.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.2, cc.v2(ox - this._focusDeltal, oy)),
                cc.moveTo(0.1, cc.v2(ox, oy)))))
        }
    },

    onTouchbtnClick(pSender, event) {
        if (this.m_data.act_state === 1) {

        }
    },


    onFunbtnClick(event, ud) {
        switch (ud) {
            case 'atk': {

            }
                break;
            case 'zx': {
                this.showFunctionBtns(false);
            }
                break;
            case 'zj': {
                this.showFunctionBtns(false);
            }
                break;
            case 'defense': {
                this.showFunctionBtns(false);
            }
                break;
            case 'skill': {

            }
                break
            case 'item': {

            }
                break;
            case 'escape': {
                this.showFunctionBtns(false);
            }
                break;
        }
        let f = event.currentTarget === this.m_funbtns[0];
        let a = 100;
    }


    // update (dt) {},
});