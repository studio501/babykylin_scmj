exports.act_handler = {
    normal_attack: function (srcHero, dstHero) {
        var atk = srcHero.atk;
        var def = dstHero.def;
        // 强制扣1血
        var cost_hp = Math.max(atk - def, 1);
        dstHero.curhp -= cost_hp;
    }

};