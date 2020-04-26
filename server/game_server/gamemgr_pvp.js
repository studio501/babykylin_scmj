var roomMgr = require("./roommgr");
var userMgr = require("./usermgr");
var mjutils = require('./mjutils');
var gameutils = require('./gameutils');
var act_handler = require('./act_handler').act_handler;
var db = require("../utils/db");
var table = require("../utils/table");
var crypto = require("../utils/crypto");
var games = {};
var gamesIdBase = 0;

var gameSeatsOfUsers = {};

const GameSeatNum = 2;


function clearAllOptions(game, seatData) {
    var fnClear = function (sd) {
        sd.canPeng = false;
        sd.canGang = false;
        sd.gangPai = [];
        sd.canHu = false;
        sd.lastFangGangSeat = -1;
    }
    if (seatData) {
        fnClear(seatData);
    }
    else {
        game.qiangGangContext = null;
        for (var i = 0; i < game.gameSeats.length; ++i) {
            fnClear(game.gameSeats[i]);
        }
    }
}

function getSeatIndex(userId) {
    var seatIndex = roomMgr.getUserSeat(userId);
    if (seatIndex == null) {
        return null;
    }
    return seatIndex;
}

function getGameByUserID(userId) {
    var roomId = roomMgr.getUserRoom(userId);
    if (roomId == null) {
        return null;
    }
    var game = games[roomId];
    return game;
}

function hasOperations(seatData) {
    if (seatData.canGang || seatData.canPeng || seatData.canHu) {
        return true;
    }
    return false;
}

function sendOperations(game, seatData, pai) {
    if (hasOperations(seatData)) {
        if (pai == -1) {
            pai = seatData.holds[seatData.holds.length - 1];
        }

        var data = {
            pai: pai,
            hu: seatData.canHu,
            peng: seatData.canPeng,
            gang: seatData.canGang,
            gangpai: seatData.gangPai
        };

        //如果可以有操作，则进行操作
        userMgr.sendMsg(seatData.userId, 'game_action_push', data);

        data.si = seatData.seatIndex;
    }
    else {
        userMgr.sendMsg(seatData.userId, 'game_action_push');
    }
}


function doGameOver(game, userId, forceEnd) {
    var roomId = roomMgr.getUserRoom(userId);
    if (roomId == null) {
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if (roomInfo == null) {
        return;
    }

    var results = [];
    var dbresult = [0, 0];

    var fnNoticeResult = function (isEnd) {
        var endinfo = "just end";
        userMgr.broacastInRoom('game_over_push', { results: results, endinfo: endinfo }, userId, true);
        //如果局数已够，则进行整体结算，并关闭房间
        if (isEnd) {
            setTimeout(function () {
                if (roomInfo.numOfGames > 1) {
                    store_history(roomInfo);
                }

                userMgr.kickAllInRoom(roomId);
                roomMgr.destroy(roomId);
                // db.archive_games(roomInfo.uuid);
            }, 1500);
        }
    }

    if (game != null) {

        for (var i = 0; i < roomInfo.seats.length; ++i) {
            var rs = roomInfo.seats[i];
            var sd = game.gameSeats[i];

            rs.ready = false;

            var userRT = {
                userId: sd.userId,
                pengs: sd.pengs,
                actions: [],
            };

            dbresult[i] = 0;
            delete gameSeatsOfUsers[sd.userId];
        }
        delete games[roomId];

    }

    if (forceEnd || game == null) {
        fnNoticeResult(true);
    }
    else {
        //保存游戏
        store_game(game, function (ret) {

            // 此结果为经验或者得到的奖励
            db.update_game_result(roomInfo.uuid, game.gameIndex, dbresult);

            //记录游戏回合
            var str = JSON.stringify(game.actionList);
            db.update_game_action_records(roomInfo.uuid, game.gameIndex, str);

            fnNoticeResult(true);
        });
    }
}


//只选取必要的信息存储
function trimHeroData(heros) {
    var res = [];
    for (var j = 0; j < heros.length; j++) {
        var t_hero = heros[j];
        res.push({
            id: t_hero.id,
            uuid: t_hero.uuid,
            name: t_hero.name,
            curhp: t_hero.curhp,
            mp: t_hero.mp,
            curmp: t_hero.curmp,
            lv: t_hero.lv,
            act_state: t_hero.act_state,
        })
    }
    return res;
}

function recordGameAction(game, action) {
    game.actionList.push(action);
}

function sendActResult(seats, actInfo, game_over_data) {
    var trim_seats = table.trimTbl(seats, ["heros"]);
    for (var i = 0; i < seats.length; ++i) {
        var s = seats[i];
        userMgr.sendMsg(s.userId, 'act_result', { seats: trim_seats, actInfo: actInfo, game_over_data: game_over_data });
    }
}

exports.setReady = function (userId) {
    var roomId = roomMgr.getUserRoom(userId);
    if (roomId == null) {
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if (roomInfo == null) {
        return;
    }

    roomMgr.setReady(userId, true);

    // replyHero(userId);

    var game = games[roomId];
    if (game == null) {
        if (roomInfo.seats.length == GameSeatNum) {
            for (var i = 0; i < roomInfo.seats.length; ++i) {
                var s = roomInfo.seats[i];
                if (s.ready == false || userMgr.isOnline(s.userId) == false) {
                    return;
                }
            }
            //GameSeatNum个人到齐了，并且都准备好了，则开始新的一局
            exports.begin(roomId);
        }
    }
    else {
        var data = {
            state: game.state,
            button: game.button,
            turn: game.turn,
        };

        data.seats = [];
        var seatData = null;
        var user_ids = [];
        for (var i = 0; i < GameSeatNum; ++i) {
            var sd = game.gameSeats[i];
            user_ids.push(sd.userId);
            var s = {
                userid: sd.userId,
                heros: sd._seat && sd._seat.heros
            }
            if (sd.userId == userId) {
                seatData = sd;
            }
            else {
                s.huanpais = sd.huanpais ? [] : null;
            }
            data.seats.push(s);
        }


        gameutils.initActHeroOrder(data.seats);

        for (var i = 0; i < data.seats.length; ++i) {
            var s = data.seats[i];
            userMgr.sendMsg(s.userid, 'game_sync_push', data);
        }
        sendOperations(game, seatData, game.chuPai);
    }
}

function store_single_history(userId, history) {
    db.get_user_history(userId, function (data) {
        if (data == null) {
            data = [];
        }
        while (data.length >= 10) {
            data.shift();
        }
        data.push(history);
        db.update_user_history(userId, data);
    });
}

function store_history(roomInfo) {
    var seats = roomInfo.seats;
    var history = {
        uuid: roomInfo.uuid,
        id: roomInfo.id,
        time: roomInfo.createTime,
        seats: new Array(GameSeatNum)
    };

    for (var i = 0; i < seats.length; ++i) {
        var rs = seats[i];
        var hs = history.seats[i] = {};
        hs.userid = rs.userId;
        hs.name = crypto.toBase64(rs.name);
        hs.score = rs.score;
    }

    for (var i = 0; i < seats.length; ++i) {
        var s = seats[i];
        store_single_history(s.userId, history);
    }
}

function store_game(game, callback) {
    db.create_game(game.roomInfo.uuid, game.gameIndex, game.baseInfoJson, callback);
}

exports.replyHero = function (userId, cb) {
    db.get_user_data_by_userid(userId, function (res) {
        if (!res) {
            if (cb) {
                cb(null);
            }
            return;
        }
        if (res.bindhero) {
            db.get_hero_data(res.bindhero, null, function (herodata) {
                if (cb) {
                    cb(herodata);
                }
                // userMgr.sendMsg(userId,'push_hero_data',herodata);
            })
        }
    })
}

//开始新的一局
exports.begin = function (roomId) {
    var roomInfo = roomMgr.getRoom(roomId);
    if (roomInfo == null) {
        return;
    }
    var seats = roomInfo.seats;

    var game = {
        conf: roomInfo.conf,
        roomInfo: roomInfo,
        gameIndex: roomInfo.numOfGames,

        currentIndex: 0,
        gameSeats: new Array(GameSeatNum),
        actionList: []
    };

    roomInfo.numOfGames++;
    var hero_arr = [];
    for (var i = 0; i < GameSeatNum; ++i) {
        var data = game.gameSeats[i] = {};

        data.game = game;

        data.seatIndex = i;

        data.userId = seats[i].userId;

        data._seat = seats[i];

        hero_arr.push(seats[i].heros);

        gameSeatsOfUsers[data.userId] = data;
    }
    games[roomId] = game;

    gameutils.updateRoundInitSpd(hero_arr);
    gameutils.moveToNextHero(seats);
    var trim_seats = table.trimTbl(seats, ["heros"]);
    for (var i = 0; i < seats.length; ++i) {
        //开局时，通知前端必要的数据
        var s = seats[i];
        //通知游戏开始
        userMgr.sendMsg(s.userId, 'game_begin_push', { seats: trim_seats });
    }
};

exports.heroAct = function (userId, actInfo) {
    if (table.isEmpty(actInfo)) {
        return;
    }

    var roomId = roomMgr.getUserRoom(userId);
    if (roomId == null) {
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if (roomInfo == null) {
        return;
    }

    var room_seats = roomInfo.seats;
    var now_act_hero = gameutils.getNowActHero(room_seats);
    if (table.isEmpty(now_act_hero)) {
        return;
    }

    var srcId = actInfo.srcId;
    if (srcId !== now_act_hero.id) {
        return;
    }

    var game = games[roomId];
    if (!game) {
        return;
    }

    var targetIds = actInfo.targetIds;
    var actKey = actInfo.actKey;
    var act_func = act_handler[actKey];
    if (act_func) {
        var targetHeros = gameutils.getAliveHeros(room_seats, targetIds);
        for (var i = 0; i < targetHeros.length; i++) {
            act_func(now_act_hero, targetHeros[i]);
        }
        recordGameAction(game, { actInfo: actInfo, heros: [trimHeroData(room_seats[0].heros), trimHeroData(room_seats[1].heros)] });
    }

    var one_side_fail = null;
    for (var i = 0; i < room_seats.length; i++) {
        if (gameutils.getAliveHerosFromOnesizeHeroArr(room_seats[i].heros).length === 0) {
            one_side_fail = i;
            break
        }
    }
    var game_over_data = one_side_fail !== null ? {
        winner: one_side_fail == 0 ? 1 : 0,
        losser: one_side_fail
    } : null;

    if (!one_side_fail) {
        gameutils.moveToNextHero(room_seats);
    }
    sendActResult(room_seats, actInfo, game_over_data);
    if (game_over_data) {
        var game = games[roomId];
        doGameOver(game, userId);
    }
}

exports.hasBegan = function (roomId) {
    var game = games[roomId];
    if (game != null) {
        return true;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if (roomInfo != null) {
        return roomInfo.numOfGames > 0;
    }
    return false;
};

function update() {
    // for (var i = dissolvingList.length - 1; i >= 0; --i) {
    //     var roomId = dissolvingList[i];

    //     var roomInfo = roomMgr.getRoom(roomId);
    //     if (roomInfo != null && roomInfo.dr != null) {
    //         if (Date.now() > roomInfo.dr.endTime) {
    //             console.log("delete room and games");
    //             exports.doDissolve(roomId);
    //             dissolvingList.splice(i, 1);
    //         }
    //     }
    //     else {
    //         dissolvingList.splice(i, 1);
    //     }
    // }
}

setInterval(update, 1000);
