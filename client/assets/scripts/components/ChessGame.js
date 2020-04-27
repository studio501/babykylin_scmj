import { Event_Name, event_mgr } from "../base/event/event_mgr";
import { loader_mgr } from '../base/loader/loader_mgr';
import { handler, gen_handler } from "../base/util";
const table = require("../table");

cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot: {
            default: null,
            type: cc.Node
        },

        prepareRoot: {
            default: null,
            type: cc.Node
        },

        _seats: []
    },
    onLoad: function () {
        cc.vv.utils.setFitSreenMode();
        this.addComponent("NoticeTip");
        this.addComponent("GameOver");
        this.addComponent("DingQue");
        // this.addComponent("PengGangs");
        this.addComponent("ChessRoom");
        this.addComponent("TimePointer");
        this.addComponent("GameResult");
        this.addComponent("Chat");
        this.addComponent("Folds");
        this.addComponent("ReplayCtrl");
        this.addComponent("PopupMgr");
        this.addComponent("HuanSanZhang");
        this.addComponent("ReConnect");
        this.addComponent("Voice");
        this.addComponent("UserInfoShow");
        this.addComponent("Status");

        this.initView();
        this.initEventHandlers();

        this.gameRoot.active = false;
        this.prepareRoot.active = true;
        this.initWanfaLabel();
        this.onGameBeign();
        cc.vv.utils.addEscEvent(this.node);


        this.onlyShowSide();

        var btnWechat = cc.find("Canvas/zouziBtn");
        if (btnWechat) {
            cc.vv.utils.addClickEvent(btnWechat, this.node, "ChessGame", "ui_test");
        }

        this.test_hero();
    },
    test_hero() {
        // cc.vv.net.send('queryhero');
        // cc.vv.utils.addClickEvent(cc.find("Canvas/heroroot/atk"), this.node, "ChessGame", "atk_test");
    },
    atk_test() {
        let other_hero = cc.find("Canvas/game/right/seat/hero1");
        let self_hero = cc.find("Canvas/game/myself/seat/hero1");
        let wp = other_hero.parent.convertToWorldSpaceAR(other_hero.position);
        let np = self_hero.convertToNodeSpaceAR(wp)
        this._seats[0]._heroArr[0].getComponent('hero').attack(cc.v2(np.x, np.y));
    },
    ui_test() {
        // let data = {
        //     start: { hang: 0, lie: 0 },
        //     end: { hang: 1, lie: 0 },
        // }
        // cc.vv.net.send("zouzi", JSON.stringify(data));
        this.show_game_over({
            winner: '0',
        });
    },
    initView() {
        //搜索需要的子节点
        var gameChild = this.node.getChildByName("game");
        var seatKey = ['Canvas/game/myself/seat', 'Canvas/game/right/seat'];
        for (var i = 0; i < seatKey.length; ++i) {
            this._seats.push(cc.find(seatKey[i]).getComponent("Seat"));
        }
        // this.initSeats();
    },

    start() {
    },

    onlyShowSide() {
        var sides = ["myself", "right"];
        var gameChild = this.node.getChildByName("game");
        var chs = gameChild.children;
        for (var i = 0; i < chs.length; ++i) {
            var sideNode = chs[i]
            let tf = !!sides.includes(sideNode.name);
            sideNode.active = tf;
            if (tf) {
                let ts2 = sideNode.children;
                for (let j = 0; j < ts2.length; j++) {
                    ts2[j].active = ts2[j].name == 'seat'
                }
            }
        }
    },
    initDragStuffs: function (node) {
        //break if it's not my turn.
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log("cc.Node.EventType.TOUCH_START");
            if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
                return;
            }
            node.interactable = node.getComponent(cc.Button).interactable;
            if (!node.interactable) {
                return;
            }
            node.opacity = 255;
            this._chupaidrag.active = false;
            this._chupaidrag.getComponent(cc.Sprite).spriteFrame = node.getComponent(cc.Sprite).spriteFrame;
            this._chupaidrag.x = event.getLocationX() - this.node.width / 2;
            this._chupaidrag.y = event.getLocationY() - this.node.height / 2;
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            console.log("cc.Node.EventType.TOUCH_MOVE");
            if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            if (Math.abs(event.getDeltaX()) + Math.abs(event.getDeltaY()) < 0.5) {
                return;
            }
            this._chupaidrag.active = true;
            node.opacity = 150;
            this._chupaidrag.opacity = 255;
            this._chupaidrag.scaleX = 1;
            this._chupaidrag.scaleY = 1;
            this._chupaidrag.x = event.getLocationX() - this.width / 2;
            this._chupaidrag.y = event.getLocationY() - this.height / 2;
            node.y = 0;
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            console.log("cc.Node.EventType.TOUCH_END");
            this._chupaidrag.active = false;
            node.opacity = 255;
            if (event.getLocationY() >= 200) {
                this.shoot(node.mjId);
            }
        }.bind(this));

        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            if (cc.vv.gameNetMgr.turn != cc.vv.gameNetMgr.seatIndex) {
                return;
            }
            if (!node.interactable) {
                return;
            }
            console.log("cc.Node.EventType.TOUCH_CANCEL");
            this._chupaidrag.active = false;
            node.opacity = 255;
            if (event.getLocationY() >= 200) {
                this.shoot(node.mjId);
            } else if (event.getLocationY() >= 150) {
                //this._huadongtishi.active = true;
                //this._huadongtishi.getComponent(cc.Animation).play('huadongtishi');
            }
        }.bind(this));
    },
    initEventHandlers: function () {
        cc.vv.gameNetMgr.dataEventHandler = this.node;

        //初始化事件监听器
        var self = this;

        this.node.on('game_holds', function (data) {
            self.initMahjongs();
            self.checkQueYiMen();
        });

        this.node.on('game_begin', function (data) {
            self.onGameBeign();
            //第一把开局，要提示
            if (cc.vv.gameNetMgr.numOfGames == 1) {
                self.checkIp();
            }
        });

        this.node.on('check_ip', function (data) {
            self.checkIp();
        });

        this.node.on('game_sync', function (data) {
            self.onGameBeign();
        });

        this.node.on('game_chupai', function (data) {
            self.hideChupai();
            self.checkQueYiMen();
            if (data.last != cc.vv.gameNetMgr.seatIndex) {
                self.initMopai(data.last, null);
            }
            if (!cc.vv.replayMgr.isReplay() && data.turn != cc.vv.gameNetMgr.seatIndex) {
                self.initMopai(data.turn, -1);
            }
        });

        this.node.on('act_result', function (data) {
            if (!data || !data.actInfo) {
                return;
            }
            self.applyAtk(data.actInfo, function () {
                self.initSeats();
                if (data.game_over_data) {
                    self.show_game_over(data.game_over_data);
                }
            })
        });

        this.node.on('act_result_npc', function (data) {
            if (!data || !data.round_data) {
                return;
            }
            let round_data = data.round_data;
            let ct = 0;
            let fn = function(){
                if(ct === round_data.length - 1){
                    return;
                }
                let tr = data.round_data[ct++];
                let actInfo = tr.actInfo;
                let heros = tr.heros;

                self.applyAtk(actInfo, function () {
                    cc.vv.gameNetMgr.update_hero_data_inround(heros);
                    self.initSeats();
                    if (data.game_over_data) {
                        self.show_game_over(data.game_over_data);
                        return;
                    }
                    fn();
                })
            }
            fn();
            
        });

        this.node.on('game_mopai', function (data) {
            self.hideChupai();
            var pai = data.pai;
            var localIndex = cc.vv.gameNetMgr.getLocalIndex(data.seatIndex);
            if (localIndex == 0) {
                var index = 13;
                var sprite = self._myMJArr[index];
                self.setSpriteFrameByMJID("M_", sprite, pai, index);
                sprite.node.mjId = pai;
            }
            else if (cc.vv.replayMgr.isReplay()) {
                self.initMopai(data.seatIndex, pai);
            }
        });

        this.node.on('game_action', function (data) {
            // self.showAction(data);
        });

        this.node.on('mj_count', function (data) {
            self._mjcount.string = "剩余" + cc.vv.gameNetMgr.numOfMJ + "张";
        });

        this.node.on('game_num', function (data) {
            self._gamecount.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
        });

        this.node.on('game_over', function (data) {
            self.gameRoot.active = false;
            self.prepareRoot.active = true;
        });

        this.node.on('game_chupai_notify', function (data) {
            self.hideChupai();
            var seatData = data.seatData;
            //如果是自己，则刷新手牌
            if (seatData.seatindex == cc.vv.gameNetMgr.seatIndex) {
                self.initMahjongs();
            }
            else {
                self.initOtherMahjongs(seatData);
            }
            self.showChupai();
            var audioUrl = cc.vv.mahjongmgr.getAudioURLByMJID(data.pai);
            cc.vv.audioMgr.playSFX(audioUrl);
        });

        this.node.on('login_result', function () {
            self.gameRoot.active = false;
            self.prepareRoot.active = true;
            console.log('login_result');
        });

        this.node.on('new_user', function (data) {
            self.initSingleSeat(data);
        });

        this.node.on('user_state_changed', function (data) {
            self.initSingleSeat(data);
        });


        event_mgr.get_inst().add(Event_Name.set_target_hero, this.showHeroInfoPanel, this);

        // this.node.on('push_hero_data',function(data){
        //     self.onHeroDataResp(data)
        // });
    },

    getSpdDesc: function (spd) {
        let spd_num = this.m_spd_num;
        if (!spd_num) {
            spd_num = {
                [1]: cc.vv.utils.getLang('1'),
                [2]: cc.vv.utils.getLang('2'),
                [3]: cc.vv.utils.getLang('3'),
                [4]: cc.vv.utils.getLang('4'),
                [5]: cc.vv.utils.getLang('5'),
                [6]: cc.vv.utils.getLang('6'),
                [7]: cc.vv.utils.getLang('7'),
                [8]: cc.vv.utils.getLang('8')
            };
            this.m_spd_num = spd_num;
        }
        return spd_num[spd];
    },

    showHeroInfoPanel: function (hero_data) {
        let heroInfoPanel = this.m_heroInfoPanel;
        if (!heroInfoPanel) {
            heroInfoPanel = loader_mgr.get_inst().loadPrefabObjSync('sg/prefabs/opt_dialog');
            heroInfoPanel.parent = this.node.getChildByName("game_opt_root")
            this.m_heroInfoPanel = heroInfoPanel;
        }

        heroInfoPanel.active = !!hero_data;
        if (hero_data) {
            heroInfoPanel.getComponent('optdialog').setData(
                [
                    "普通攻击",
                    hero_data.name,
                    `血:${hero_data.curhp}`,
                    `精:${hero_data.curmp}`,
                    this.getSpdDesc(hero_data.roundspd),
                ]
            )
        }
    },

    onDestroy() {
        event_mgr.get_inst().remove(Event_Name.set_target_hero, this.showHeroInfoPanel, this);
    },

    initSeats: function () {
        var seats = cc.vv.gameNetMgr.seats;
        for (var i = 0; i < seats.length; ++i) {
            this.initSingleSeat(seats[i]);
        }
    },

    initSingleSeat(seat) {
        var index = cc.vv.gameNetMgr.getLocalIndex(seat.seatindex);
        var isOffline = !seat.online;

        this._seats[index].setInfo(seat.name, seat.score);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(isOffline);
        this._seats[index].setID(seat.userid);
        this._seats[index].voiceMsg(false);
        this._seats[index].setHeros(seat.heros);

    },

    onGameBeign: function () {
        if (cc.vv.gameNetMgr.gamestate == "" && cc.vv.replayMgr.isReplay() == false) {
            return;
        }
        this.gameRoot.active = true;
        this.prepareRoot.active = false;

        this.initSeats();
    },
    initWanfaLabel: function () {
        var wanfa = cc.find("Canvas/infobar/wanfa").getComponent(cc.Label);
        wanfa.string = cc.vv.gameNetMgr.getWanfa();
    },

    applyAtk: function (atkData, callback) {
        if (!atkData || !atkData.srcId || !atkData.targetIds) {
            return;
        }
        let src_hero = this.find_hero_by_id(atkData.srcId);
        let dst_hero = this.find_hero_by_id(atkData.targetIds[0]);
        let wp = dst_hero.parent.convertToWorldSpaceAR(dst_hero.position);
        let np = src_hero.parent.convertToNodeSpaceAR(wp);
        src_hero.getComponent('hero').attack(cc.v2(np.x, np.y), callback);
    },
    find_hero_by_id: function (id) {
        for (var i = 0; i < this._seats.length; i++) {
            let find_hero = this._seats[i].find_hero_by_id(id);
            if (find_hero) {
                return find_hero;
            }
        }
    },

    show_game_over: function (game_over_data) {
        let gameoverPanel = this.m_gameoverPanel;
        if (!gameoverPanel) {
            gameoverPanel = loader_mgr.get_inst().loadPrefabObjSync('sg/prefabs/gameoverpanel');
            gameoverPanel.parent = this.node.getChildByName("game_opt_root")
            this.m_gameoverPanel = gameoverPanel;
        }
        let t_group =  cc.vv.gameNetMgr.seatIndex;
        gameoverPanel.active = !!game_over_data;
        if(game_over_data){
            let is_success = parseInt( game_over_data.winner ) === t_group;
            gameoverPanel.getComponent('roundgaemover').setData({
                success: is_success
            });
        }
    },

    checkIp: function () {
        if (true || cc.vv.gameNetMgr.gamestate == '') {
            return;
        }
        var selfData = cc.vv.gameNetMgr.getSelfData();
        var ipMap = {}
        for (var i = 0; i < cc.vv.gameNetMgr.seats.length; ++i) {
            var seatData = cc.vv.gameNetMgr.seats[i];
            if (seatData.ip != null && seatData.userid > 0 && seatData != selfData) {
                if (ipMap[seatData.ip]) {
                    ipMap[seatData.ip].push(seatData.name);
                }
                else {
                    ipMap[seatData.ip] = [seatData.name];
                }
            }
        }

        for (var k in ipMap) {
            var d = ipMap[k];
            if (d.length >= 2) {
                var str = "" + d.join("\n") + "\n\n正在使用同一IP地址进行游戏!";
                cc.vv.alert.show("注意", str);
                return;
            }
        }
    },
});