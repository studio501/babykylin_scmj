/*
* @Author: tangwen
* @Date:   2020-02-24 23:21:28
* @Last Modified by:   tangwen
* @Last Modified time: 2020-02-27 15:16:10
*/

var cus_event = function () {
	this.m_callbackArr = [];
}
cus_event.prototype = 
{

// cus_event.__index = cus_event

// function cus_event.new( o )
// 	o = o or {}
// 	setmetatable(o,cus_event)
// 	return o
// end

/*

注册事件监听函数

@param selector 回调函数
@param target 回调对象
*/
add:function(selector, target){
	if (this.m_callbackArr == null){
		this.m_callbackArr = [];
	}
	this.m_callbackArr.push({target : target, selector : selector})
},

/*

删除事件监听函数

@param selector 回调函数
@param target 回调对象
*/
remove:function(selector, target){

	if (!this.m_callbackArr || this.m_callbackArr.length === 0) {
		return false
	}

	let idx = null
	for (let i=0; i<this.m_callbackArr.length; i++) {
		let callback = this.m_callbackArr[i];
		if (callback.target == target && callback.selector == selector) {
			idx = i
			break;
		}
	}

	if (idx) {
		this.m_callbackArr.splice(idx, 1);
		return true
	}
	return false
},

/*

注册所有事件监听函数

@param selector 回调函数
@param target 回调对象
*/
removeAll:function(){
	this.m_callbackArr = null
},

hasObserver:function(  ){
	return (this.m_callbackArr || []).length != 0
},

/*
触发事件
*/
emit:function(...params){
	if (!this.m_callbackArr || this.m_callbackArr.length === 0){
		return
	}
	
	var callbackArr = []
	for (let i=0;i<this.m_callbackArr.length;i++){
		callbackArr.push(this.m_callbackArr[i])
	}

	for (let i=0;i<callbackArr.length;i++) {
		let callback = callbackArr[i];

		if (callback.target) {
			callback.selector.call(callback.target, ...params)
		}
		else{
			callback.selector(...params)
		}
	}
}
}
