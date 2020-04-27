
var table = require('../utils/table');
var utils = require('../utils/utils');
var gameconst = require('./gameconst');
var Hero_Act_State = gameconst.Hero_Act_State;

exports.moveToNextHero = function (seats,index) {
    return exports.initActHeroOrder(seats, true, index);
}

exports._get_aliveheros_by_seat = function(res,seat){
    if (!table.isEmpty(seat.heros)) {
        for (var j = 0; j < seat.heros.length; j++) {
            var t_hero = seat.heros[j];
            if (t_hero.curhp > 0) {
                res.push(t_hero);
            }
            else {
                t_hero.act_state = Hero_Act_State.UnableAct;
            }
        }
    }
}
// 
exports.initActHeroOrder = function (seats, moveToNext, index) {
    if (table.isEmpty(seats)) {
        return;
    }
    var res = [];
    if(index === undefined){
        for (var i = 0; i < seats.length; i++){
            exports._get_aliveheros_by_seat(res,seats[i]);
        }
    }else{
        exports._get_aliveheros_by_seat(res,seats[index]);
    }
    // for (var i = 0; i < seats.length; i++) {
    //     if (!table.isEmpty(seats[i].heros)) {
    //         for (var j = 0; j < seats[i].heros.length; j++) {
    //             var t_hero = seats[i].heros[j];
    //             if (t_hero.curhp > 0) {
    //                 res.push(t_hero);
    //             }
    //             else {
    //                 t_hero.act_state = Hero_Act_State.UnableAct;
    //             }
    //         }
    //     }
    // }

    // 确定初始化
    for (var i = 0; i < res.length; i++) {
        res[i].act_state = utils.isNull(res[i].act_state) ? Hero_Act_State.CanAct : res[i].act_state;
    }

    // 找出当前可行动英雄
    var cur_act_hero = table.find(res, function (cur) {
        return cur.act_state === Hero_Act_State.Acting;
    });
    if (moveToNext) {
        // 取消当前行动英雄
        if (cur_act_hero) {
            cur_act_hero.value.act_state = Hero_Act_State.Acted;
        }

        // 找出所有可行动英雄
        var can_act_hero = table.findAll(res, function (cur) {
            return cur.act_state === Hero_Act_State.CanAct;
        });

        // 如果没有重新初始化
        if (table.isEmpty(can_act_hero)) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].act_state !== Hero_Act_State.UnableAct)
                    res[i].act_state = Hero_Act_State.CanAct;
            }
        }
    }
    // 按速度排序
    res.sort(function (f, s) {
        if (f.act_state === s.act_state) {
            return s.spd - f.spd;
        } else {
            if (f.act_state === Hero_Act_State.Acting) {
                return -1;
            }
            else if (s.act_state === Hero_Act_State.Acting) {
                return 1;
            }
            else {
                return f.act_state < s.act_state ? -1 : 1;
            }
        }
    })
    // 首个为当前可行动英雄
    if (!table.isEmpty(res) && res[0].act_state === Hero_Act_State.CanAct) {
        res[0].act_state = Hero_Act_State.Acting;
    }
    return res;
}

exports.getNowActHero = function (seats) {
    if (table.isEmpty(seats)) {
        return;
    }
    for (var i = 0; i < seats.length; i++) {
        if (!table.isEmpty(seats[i].heros)) {
            for (var j = 0; j < seats[i].heros.length; j++) {
                var t_hero = seats[i].heros[j];
                if (t_hero.curhp > 0 && t_hero.act_state === Hero_Act_State.Acting) {
                    return t_hero;
                }
            }
        }
    }
}

exports.getAliveHeros = function (seats, targetIds) {
    if (table.isEmpty(seats)) {
        return;
    }
    var res = [];
    for (var i = 0; i < seats.length; i++) {
        if (!table.isEmpty(seats[i].heros)) {
            for (var j = 0; j < seats[i].heros.length; j++) {
                var t_hero = seats[i].heros[j];
                if (t_hero.curhp > 0 && (table.isEmpty(targetIds) || table.contains(targetIds, function (cur) {
                    return cur === t_hero.id;
                }))) {
                    res.push(t_hero);
                }
            }
        }
    }
    return res;
}

exports.getAliveHerosFromOnesideHeroArr = function (heros) {
    if (table.isEmpty(heros)) {
        return [];
    }

    return table.findAll(heros, function (cur) {
        return cur.curhp > 0;
    })
}

exports.updateRoundInitSpd = function (hero_arr) {
    // 按速度排序
    hero_arr.sort(function (f, s) {
        return s.spd - f.spd;
    });
    for (var i = 0; i < hero_arr.length; i++) {
        hero_arr[i].roundspd = i + 1;
    }
}

exports.tell_hero_group = function (seats, hero) {
    if (!seats || !hero) {
        return null;
    }

    for (var i = 0; i < seats.length; i++) {
        for (var j = 0; j < seats[i].heros.length; i++) {
            if (seats[i].heros[j] === hero) {
                return i;
            }
        }
    }
    return null;
}

exports.random_hero = function (heros) {
    return heros[Math.floor(Math.random() * heros.length)];
}