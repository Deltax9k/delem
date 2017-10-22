function Evaluate(field, target , self) {
      if (!field) {
        return
      }
      var type = typeof(field)
      if (type === 'string') {
        return field
      }
      if (type === 'function') {
        if (target === '_node') {
          return field()
        }
        if (target === '_html') {
          field.prototype = function append(some) {
            self.append(De(some))
          }
          return field.call(self, self)
        }
        if (target === '_done') {
          field()
          return
        }
        if (target === 'onclick') {
          return function () {
            field.call(field, self)
          }
        }
        return field.call(field, self)
      }
      if (type === 'object') {
        if ($.isArray(field)) {
          var html = []
          $.each(field, function () {
            html.push(Delem(this))
          })
          return html
        }
        return Delem(field)
      }
    }
    function Delem(dElem) {
      var _node = Evaluate.call(de, dElem._node, '_node')
      if (typeof(_node) !== 'string') {
        return
      }
      var de = $('<' + _node + '>')
      //处理非内置属性
      for (var name in dElem) {
        // 以 '_' 开头为内置属性
        if (name.charAt(0) !== '_') {
          var attr = Evaluate(dElem[name], name, de)
          if (attr) {
            if (name === 'onclick') {
              de[0].onclick = attr
            } else {
              de.attr(name, attr)
            }
          } else {
            de.removeAttr(name)
          }
        }
      }
      //内置属性
      var htm = Evaluate(dElem._html, '_html', de)
      if (htm) {
        if ($.isArray(htm)) {
          $.each(htm, function () {
            de.append(this)
          })
        } else {
          de.append(htm)
        }
      }
      Evaluate(dElem._done, de)
      return de
    }

    function Dmake(proto) {
      return function (data) {
        if (!data || typeof(data) !== 'object' ||
            $.isArray(data)) {
          throw 'only single object supported, data:\n' + JSON.stringify(data)
        }
        return Delem($.extend({}, proto(data), data))
      }
    }

    function De(objectOrFunc) {
      if (!objectOrFunc) {
        return
      }
      var type = typeof(objectOrFunc)
      if (type === 'object') {
        return Delem(objectOrFunc)
      }
      if (type === 'function') {
        return Dmake(objectOrFunc)
      }
    }

