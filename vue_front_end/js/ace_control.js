//获取autocomplete插件
var langtools = ace.require("ace/ext/language_tools");
//初始化ace实例
var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/json");
editor.setOptions({
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: true
    });
//根据vue的all_properties获得自动补全词库
var property_completer = {
    getCompletions: function(editor, session, pos, prefix, callback){
        if (prefix.length === 0) { callback(null, []); return }
        let word_list = vm.$data.all_properties;
        callback(null, word_list.map(function(item){
            return {value: item.property, meta: item.type }
        }));
    }
};
//添加completer
langtools.addCompleter(property_completer);
