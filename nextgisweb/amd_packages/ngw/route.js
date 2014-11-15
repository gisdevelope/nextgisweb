/* globals define, ngwConfig */
define([
    "dojo/_base/lang",
    "./load-json!pyramid/routes", 
    "./load-json!api/component/pyramid/route"
], function (
    lang,
    routes,
    rdata
) {
    var module = function (route, args) {
        console.warn("DEPRECATED: Use route.cname.rname(args) instead of route('cname.rname', args).");

        return ngwConfig.applicationUrl +
            routes[route].pattern.replace(/__(\w+)__/g, function (match, a) {
                return args[a];
            });
    };

    var generator = function (args) {
        var template = this[0],
            keys = this.slice(1),
            isArray = Object.prototype.toString.call(args) === '[object Array]',
            isObject = Object.prototype.toString.call(args) === '[object Object]';
        
        if (isArray) {
            // Список замен можно указать в виде массива.
            var sub = args;
        } else if (!isObject) {
            // Если список замен не массив и не объект, то используем
            // в качестве списка замен массив аргументов, особенно это
            // полезно в случае одного аргумента.
            var sub = arguments;
        } else {
            // Если в качестве списка замен передали объект, то 
            // используем его ключи для подстановки, но вначале
            // нужно преобразовать их в массив.
            var sub = [];
            for (var k in args) { sub[keys.indexOf(k)] = args[k] }
        }

        return template.replace(/\{(\w+)\}/g, function (m, a) {
            var idx = parseInt(a), value = sub[idx];

            // TODO: Неплохо бы так же добавить имя маршрута в сообщение.
            if (value === undefined) { console.error("Undefined parameter " + idx + ":" + keys[idx] + " in URL " + template + ".") }
            
            return value;
        });
    }

    var rcount = 0;
    for (var rname in rdata) {
        lang.setObject(rname, lang.hitch(rdata[rname], generator), module);
        rcount = rcount + 1;
    }

    console.log('Route initialization completed, registered ' + rcount + ' routes.');

    return module;
});