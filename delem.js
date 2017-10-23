!function () {
  var delem = {
    Eval: function (proc, $elem) {
      var _this = this
      switch (typeof(proc)) {
      case 'string': return proc
      case 'function': return proc.call(_this, $elem)
      case 'object': 
        if ($.isArray(proc)) {
          var array = []
          $.each(proc, function () {
            array.push(delem.Delem(this))
          })
          return array
        } else {
          return delem.Delem(proc)
        }
      }
    }
    ,defaults: {
      _delem: function (demo) {
        var ext = $.extend({}, delem.defaults, demo._EVAL)
        var $elem = delem.Eval.call(demo, ext._node)
        if (!$elem) {
          return
        }
        delete ext._node
        for (var name in demo) {
          delem.Eval.call(demo, ext[name] || demo[name], $elem)
        }
        return $elem
      }
      ,_node: function () {
        var _node = delem.Eval.call(this, this._node)
        if (typeof(_node) !== 'string' 
            || _node === '') {
          return
        }
        return $('<' + _node + '>')
      }
      ,_html: function ($elem) {
        var res = delem.Eval.call(this, this._html, $elem)
        res && !function (){
          if ($.isArray(res)) {
            $.each(res, function () {
              $elem.append(this)
            })
          } else {
            $elem.append(res)
          }
        }()
      }
      ,_children: function ($elem) {
        var _children = this._children
        _children && $.each(_children._data, function () {
          $elem.append(De($.extend(_children, this)))
        })
      }
      ,_data: function () {
      }
    }
    ,bindEvent: function (eventName) {
      delem.defaults[eventName] = function(self) {
        var proc = this[eventName]
        if (proc) {
          self[0][eventName] = function (self) {
            proc.call(this, self)
          }
        }
      }
    }
    ,addAttr: function (name) {
      delem.defaults[name] = function(self) {
        var attribute = delem.Eval.call(this, this[name], self)
        attribute && (self[0][name] = attribute)
      }
    }
    ,Delem: function (demo) {
      return (demo && demo._EVAL && demo._EVAL._delem) ?
        demo._EVAL._delem(demo) : delem.defaults._delem(demo)
    }
    ,Dmake: function (proto) {
      return function (data) {
        if (!data || typeof(data) !== 'object' ||
            $.isArray(data)) {
          throw 'only single object supported, data:\n' + JSON.stringify(data)
        }
        return delem.Delem($.extend({}, proto(data), data))
      }
    }
    ,De: function (objectOrFunc) {
      switch (typeof(objectOrFunc)) {
        case 'object': return delem.Delem(objectOrFunc)
        case 'function': return delem.Dmake(objectOrFunc)
      }
    }
  }

  //初始化绑定事件处理
  $.each([
    'onclick', 'onblur', 'onchange'
  ], function () {
    delem.bindEvent(this)
  })

  //初始化属性处理
  $.each([
    'id', 'name', 'value', 'class', 'style'
  ], function () {
    delem.addAttr(this)
  })

  window.De = delem.De
}()