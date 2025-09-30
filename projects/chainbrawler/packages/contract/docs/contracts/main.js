/*! For license information please see main.js.LICENSE.txt */
(() => {
  var e = {
      240: (e) => {
        "use strict";
        e.exports = (e) => {
          var t = [];
          return (
            (t.toString = function () {
              return this.map((t) => {
                var n = "",
                  a = void 0 !== t[5];
                return (
                  t[4] && (n += "@supports (".concat(t[4], ") {")),
                  t[2] && (n += "@media ".concat(t[2], " {")),
                  a && (n += "@layer".concat(t[5].length > 0 ? " ".concat(t[5]) : "", " {")),
                  (n += e(t)),
                  a && (n += "}"),
                  t[2] && (n += "}"),
                  t[4] && (n += "}"),
                  n
                );
              }).join("");
            }),
            (t.i = function (e, n, a, r, i) {
              "string" == typeof e && (e = [[null, e, void 0]]);
              var o = {};
              if (a)
                for (var s = 0; s < this.length; s++) {
                  var u = this[s][0];
                  null != u && (o[u] = !0);
                }
              for (var c = 0; c < e.length; c++) {
                var l = [].concat(e[c]);
                (a && o[l[0]]) ||
                  (void 0 !== i &&
                    (void 0 === l[5] ||
                      (l[1] = "@layer"
                        .concat(l[5].length > 0 ? " ".concat(l[5]) : "", " {")
                        .concat(l[1], "}")),
                    (l[5] = i)),
                  n &&
                    (l[2]
                      ? ((l[1] = "@media ".concat(l[2], " {").concat(l[1], "}")), (l[2] = n))
                      : (l[2] = n)),
                  r &&
                    (l[4]
                      ? ((l[1] = "@supports (".concat(l[4], ") {").concat(l[1], "}")), (l[4] = r))
                      : (l[4] = "".concat(r))),
                  t.push(l));
              }
            }),
            t
          );
        };
      },
      665: (e, t, n) => {
        "use strict";
        function a(e, t) {
          for (var n = [], a = {}, r = 0; r < t.length; r++) {
            var i = t[r],
              o = i[0],
              s = { id: e + ":" + r, css: i[1], media: i[2], sourceMap: i[3] };
            a[o] ? a[o].parts.push(s) : n.push((a[o] = { id: o, parts: [s] }));
          }
          return n;
        }
        n.d(t, { A: () => f });
        var r = "undefined" != typeof document;
        if ("undefined" != typeof DEBUG && DEBUG && !r)
          throw new Error(
            "vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
          );
        var i = {},
          o = r && (document.head || document.getElementsByTagName("head")[0]),
          s = null,
          u = 0,
          c = !1,
          l = () => {},
          p = null,
          d = "data-vue-ssr-id",
          y =
            "undefined" != typeof navigator &&
            /msie [6-9]\b/.test(navigator.userAgent.toLowerCase());
        function f(e, t, n, r) {
          (c = n), (p = r || {});
          var o = a(e, t);
          return (
            m(o),
            (t) => {
              for (var n = [], r = 0; r < o.length; r++) {
                var s = o[r];
                (u = i[s.id]).refs--, n.push(u);
              }
              for (t ? m((o = a(e, t))) : (o = []), r = 0; r < n.length; r++) {
                var u;
                if (0 === (u = n[r]).refs) {
                  for (var c = 0; c < u.parts.length; c++) u.parts[c]();
                  delete i[u.id];
                }
              }
            }
          );
        }
        function m(e) {
          for (var t = 0; t < e.length; t++) {
            var n = e[t],
              a = i[n.id];
            if (a) {
              a.refs++;
              for (var r = 0; r < a.parts.length; r++) a.parts[r](n.parts[r]);
              for (; r < n.parts.length; r++) a.parts.push(h(n.parts[r]));
              a.parts.length > n.parts.length && (a.parts.length = n.parts.length);
            } else {
              var o = [];
              for (r = 0; r < n.parts.length; r++) o.push(h(n.parts[r]));
              i[n.id] = { id: n.id, refs: 1, parts: o };
            }
          }
        }
        function v() {
          var e = document.createElement("style");
          return (e.type = "text/css"), o.appendChild(e), e;
        }
        function h(e) {
          var t,
            n,
            a = document.querySelector("style[" + d + '~="' + e.id + '"]');
          if (a) {
            if (c) return l;
            a.parentNode.removeChild(a);
          }
          if (y) {
            var r = u++;
            (a = s || (s = v())), (t = T.bind(null, a, r, !1)), (n = T.bind(null, a, r, !0));
          } else
            (a = v()),
              (t = _.bind(null, a)),
              (n = () => {
                a.parentNode.removeChild(a);
              });
          return (
            t(e),
            (a) => {
              if (a) {
                if (a.css === e.css && a.media === e.media && a.sourceMap === e.sourceMap) return;
                t((e = a));
              } else n();
            }
          );
        }
        var b,
          g = ((b = []), (e, t) => ((b[e] = t), b.filter(Boolean).join("\n")));
        function T(e, t, n, a) {
          var r = n ? "" : a.css;
          if (e.styleSheet) e.styleSheet.cssText = g(t, r);
          else {
            var i = document.createTextNode(r),
              o = e.childNodes;
            o[t] && e.removeChild(o[t]), o.length ? e.insertBefore(i, o[t]) : e.appendChild(i);
          }
        }
        function _(e, t) {
          var n = t.css,
            a = t.media,
            r = t.sourceMap;
          if (
            (a && e.setAttribute("media", a),
            p.ssrId && e.setAttribute(d, t.id),
            r &&
              ((n += "\n/*# sourceURL=" + r.sources[0] + " */"),
              (n +=
                "\n/*# sourceMappingURL=data:application/json;base64," +
                btoa(unescape(encodeURIComponent(JSON.stringify(r)))) +
                " */")),
            e.styleSheet)
          )
            e.styleSheet.cssText = n;
          else {
            for (; e.firstChild; ) e.removeChild(e.firstChild);
            e.appendChild(document.createTextNode(n));
          }
        }
      },
      722: (e, t, n) => {
        var a = n(732);
        a.__esModule && (a = a.default),
          "string" == typeof a && (a = [[e.id, a, ""]]),
          a.locals && (e.exports = a.locals),
          (0, n(665).A)("99082dcc", a, !1, {});
      },
      732: (e, t, n) => {
        "use strict";
        n.r(t), n.d(t, { default: () => s });
        var a = n(895),
          r = n.n(a),
          i = n(240),
          o = n.n(i)()(r());
        o.push([
          e.id,
          "@import url(https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap);",
        ]),
          o.push([e.id, "\nhtml,\nbody {\n  font-family: 'Source Code Pro', monospace;\n}\n", ""]);
        const s = o;
      },
      895: (e) => {
        "use strict";
        e.exports = (e) => e[1];
      },
    },
    t = {};
  function n(a) {
    var r = t[a];
    if (void 0 !== r) return r.exports;
    var i = (t[a] = { id: a, exports: {} });
    return e[a](i, i.exports, n), i.exports;
  }
  (n.n = (e) => {
    var t = e && e.__esModule ? () => e.default : () => e;
    return n.d(t, { a: t }), t;
  }),
    (n.d = (e, t) => {
      for (var a in t)
        n.o(t, a) && !n.o(e, a) && Object.defineProperty(e, a, { enumerable: !0, get: t[a] });
    }),
    (n.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (n.o = (e, t) => Object.hasOwn(e, t)),
    (n.r = (e) => {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (() => {
      "use strict";
      var e = Object.freeze({}),
        t = Array.isArray;
      function a(e) {
        return null == e;
      }
      function r(e) {
        return null != e;
      }
      function i(e) {
        return !0 === e;
      }
      function o(e) {
        return (
          "string" == typeof e ||
          "number" == typeof e ||
          "symbol" == typeof e ||
          "boolean" == typeof e
        );
      }
      function s(e) {
        return "function" == typeof e;
      }
      function u(e) {
        return null !== e && "object" == typeof e;
      }
      var c = Object.prototype.toString;
      function l(e) {
        return "[object Object]" === c.call(e);
      }
      function p(e) {
        var t = parseFloat(String(e));
        return t >= 0 && Math.floor(t) === t && isFinite(e);
      }
      function d(e) {
        return r(e) && "function" == typeof e.then && "function" == typeof e.catch;
      }
      function y(e) {
        return null == e
          ? ""
          : Array.isArray(e) || (l(e) && e.toString === c)
            ? JSON.stringify(e, f, 2)
            : String(e);
      }
      function f(e, t) {
        return t && t.__v_isRef ? t.value : t;
      }
      function m(e) {
        var t = parseFloat(e);
        return isNaN(t) ? e : t;
      }
      function v(e, t) {
        for (var n = Object.create(null), a = e.split(","), r = 0; r < a.length; r++) n[a[r]] = !0;
        return t ? (e) => n[e.toLowerCase()] : (e) => n[e];
      }
      var h = v("slot,component", !0),
        b = v("key,ref,slot,slot-scope,is");
      function g(e, t) {
        var n = e.length;
        if (n) {
          if (t === e[n - 1]) return void (e.length = n - 1);
          var a = e.indexOf(t);
          if (a > -1) return e.splice(a, 1);
        }
      }
      var T = Object.prototype.hasOwnProperty;
      function _(e, t) {
        return T.call(e, t);
      }
      function w(e) {
        var t = Object.create(null);
        return (n) => t[n] || (t[n] = e(n));
      }
      var x = /-(\w)/g,
        C = w((e) => e.replace(x, (e, t) => (t ? t.toUpperCase() : ""))),
        k = w((e) => e.charAt(0).toUpperCase() + e.slice(1)),
        E = /\B([A-Z])/g,
        S = w((e) => e.replace(E, "-$1").toLowerCase()),
        R = Function.prototype.bind
          ? (e, t) => e.bind(t)
          : (e, t) => {
              function n(n) {
                var a = arguments.length;
                return a ? (a > 1 ? e.apply(t, arguments) : e.call(t, n)) : e.call(t);
              }
              return (n._length = e.length), n;
            };
      function $(e, t) {
        t = t || 0;
        for (var n = e.length - t, a = new Array(n); n--; ) a[n] = e[n + t];
        return a;
      }
      function M(e, t) {
        for (var n in t) e[n] = t[n];
        return e;
      }
      function O(e) {
        for (var t = {}, n = 0; n < e.length; n++) e[n] && M(t, e[n]);
        return t;
      }
      function A(e, t, n) {}
      var P = (e, t, n) => !1,
        L = (e) => e;
      function j(e, t) {
        if (e === t) return !0;
        var n = u(e),
          a = u(t);
        if (!n || !a) return !n && !a && String(e) === String(t);
        try {
          var r = Array.isArray(e),
            i = Array.isArray(t);
          if (r && i) return e.length === t.length && e.every((e, n) => j(e, t[n]));
          if (e instanceof Date && t instanceof Date) return e.getTime() === t.getTime();
          if (r || i) return !1;
          var o = Object.keys(e),
            s = Object.keys(t);
          return o.length === s.length && o.every((n) => j(e[n], t[n]));
        } catch (e) {
          return !1;
        }
      }
      function I(e, t) {
        for (var n = 0; n < e.length; n++) if (j(e[n], t)) return n;
        return -1;
      }
      function D(e) {
        var t = !1;
        return function () {
          t || ((t = !0), e.apply(this, arguments));
        };
      }
      var B = "data-server-rendered",
        N = ["component", "directive", "filter"],
        F = [
          "beforeCreate",
          "created",
          "beforeMount",
          "mounted",
          "beforeUpdate",
          "updated",
          "beforeDestroy",
          "destroyed",
          "activated",
          "deactivated",
          "errorCaptured",
          "serverPrefetch",
          "renderTracked",
          "renderTriggered",
        ],
        U = {
          optionMergeStrategies: Object.create(null),
          silent: !1,
          productionTip: !1,
          devtools: !1,
          performance: !1,
          errorHandler: null,
          warnHandler: null,
          ignoredElements: [],
          keyCodes: Object.create(null),
          isReservedTag: P,
          isReservedAttr: P,
          isUnknownElement: P,
          getTagNamespace: A,
          parsePlatformTagName: L,
          mustUseProp: P,
          async: !0,
          _lifecycleHooks: F,
        },
        q =
          /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
      function H(e) {
        var t = (e + "").charCodeAt(0);
        return 36 === t || 95 === t;
      }
      function V(e, t, n, a) {
        Object.defineProperty(e, t, { value: n, enumerable: !!a, writable: !0, configurable: !0 });
      }
      var z = new RegExp("[^".concat(q.source, ".$_\\d]")),
        G = "__proto__" in {},
        K = "undefined" != typeof window,
        J = K && window.navigator.userAgent.toLowerCase(),
        W = J && /msie|trident/.test(J),
        X = J && J.indexOf("msie 9.0") > 0,
        Z = J && J.indexOf("edge/") > 0;
      J && J.indexOf("android");
      var Y = J && /iphone|ipad|ipod|ios/.test(J);
      J && /chrome\/\d+/.test(J), J && /phantomjs/.test(J);
      var Q,
        ee = J && J.match(/firefox\/(\d+)/),
        te = {}.watch,
        ne = !1;
      if (K)
        try {
          var ae = {};
          Object.defineProperty(ae, "passive", {
            get: () => {
              ne = !0;
            },
          }),
            window.addEventListener("test-passive", null, ae);
        } catch (e) {}
      var re = () => (
          void 0 === Q &&
            (Q = !K && void 0 !== n.g && n.g.process && "server" === n.g.process.env.VUE_ENV),
          Q
        ),
        ie = K && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
      function oe(e) {
        return "function" == typeof e && /native code/.test(e.toString());
      }
      var se,
        ue =
          "undefined" != typeof Symbol &&
          oe(Symbol) &&
          "undefined" != typeof Reflect &&
          oe(Reflect.ownKeys);
      se =
        "undefined" != typeof Set && oe(Set)
          ? Set
          : (() => {
              function e() {
                this.set = Object.create(null);
              }
              return (
                (e.prototype.has = function (e) {
                  return !0 === this.set[e];
                }),
                (e.prototype.add = function (e) {
                  this.set[e] = !0;
                }),
                (e.prototype.clear = function () {
                  this.set = Object.create(null);
                }),
                e
              );
            })();
      var ce = null;
      function le(e) {
        void 0 === e && (e = null), e || (ce && ce._scope.off()), (ce = e), e && e._scope.on();
      }
      var pe = (() => {
          function e(e, t, n, a, r, i, o, s) {
            (this.tag = e),
              (this.data = t),
              (this.children = n),
              (this.text = a),
              (this.elm = r),
              (this.ns = void 0),
              (this.context = i),
              (this.fnContext = void 0),
              (this.fnOptions = void 0),
              (this.fnScopeId = void 0),
              (this.key = t && t.key),
              (this.componentOptions = o),
              (this.componentInstance = void 0),
              (this.parent = void 0),
              (this.raw = !1),
              (this.isStatic = !1),
              (this.isRootInsert = !0),
              (this.isComment = !1),
              (this.isCloned = !1),
              (this.isOnce = !1),
              (this.asyncFactory = s),
              (this.asyncMeta = void 0),
              (this.isAsyncPlaceholder = !1);
          }
          return (
            Object.defineProperty(e.prototype, "child", {
              get: function () {
                return this.componentInstance;
              },
              enumerable: !1,
              configurable: !0,
            }),
            e
          );
        })(),
        de = (e) => {
          void 0 === e && (e = "");
          var t = new pe();
          return (t.text = e), (t.isComment = !0), t;
        };
      function ye(e) {
        return new pe(void 0, void 0, void 0, String(e));
      }
      function fe(e) {
        var t = new pe(
          e.tag,
          e.data,
          e.children && e.children.slice(),
          e.text,
          e.elm,
          e.context,
          e.componentOptions,
          e.asyncFactory
        );
        return (
          (t.ns = e.ns),
          (t.isStatic = e.isStatic),
          (t.key = e.key),
          (t.isComment = e.isComment),
          (t.fnContext = e.fnContext),
          (t.fnOptions = e.fnOptions),
          (t.fnScopeId = e.fnScopeId),
          (t.asyncMeta = e.asyncMeta),
          (t.isCloned = !0),
          t
        );
      }
      "function" == typeof SuppressedError && SuppressedError;
      var me = 0,
        ve = [],
        he = (() => {
          function e() {
            (this._pending = !1), (this.id = me++), (this.subs = []);
          }
          return (
            (e.prototype.addSub = function (e) {
              this.subs.push(e);
            }),
            (e.prototype.removeSub = function (e) {
              (this.subs[this.subs.indexOf(e)] = null),
                this._pending || ((this._pending = !0), ve.push(this));
            }),
            (e.prototype.depend = function (t) {
              e.target && e.target.addDep(this);
            }),
            (e.prototype.notify = function (e) {
              for (var t = this.subs.filter((e) => e), n = 0, a = t.length; n < a; n++)
                t[n].update();
            }),
            e
          );
        })();
      he.target = null;
      var be = [];
      function ge(e) {
        be.push(e), (he.target = e);
      }
      function Te() {
        be.pop(), (he.target = be[be.length - 1]);
      }
      var _e = Array.prototype,
        we = Object.create(_e);
      ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach((e) => {
        var t = _e[e];
        V(we, e, function () {
          for (var n = [], a = 0; a < arguments.length; a++) n[a] = arguments[a];
          var r,
            i = t.apply(this, n),
            o = this.__ob__;
          switch (e) {
            case "push":
            case "unshift":
              r = n;
              break;
            case "splice":
              r = n.slice(2);
          }
          return r && o.observeArray(r), o.dep.notify(), i;
        });
      });
      var xe = Object.getOwnPropertyNames(we),
        Ce = {},
        ke = !0;
      function Ee(e) {
        ke = e;
      }
      var Se = { notify: A, depend: A, addSub: A, removeSub: A },
        Re = (() => {
          function e(e, n, a) {
            if (
              (void 0 === n && (n = !1),
              void 0 === a && (a = !1),
              (this.value = e),
              (this.shallow = n),
              (this.mock = a),
              (this.dep = a ? Se : new he()),
              (this.vmCount = 0),
              V(e, "__ob__", this),
              t(e))
            ) {
              if (!a)
                if (G) e.__proto__ = we;
                else for (var r = 0, i = xe.length; r < i; r++) V(e, (s = xe[r]), we[s]);
              n || this.observeArray(e);
            } else {
              var o = Object.keys(e);
              for (r = 0; r < o.length; r++) {
                var s;
                Me(e, (s = o[r]), Ce, void 0, n, a);
              }
            }
          }
          return (
            (e.prototype.observeArray = function (e) {
              for (var t = 0, n = e.length; t < n; t++) $e(e[t], !1, this.mock);
            }),
            e
          );
        })();
      function $e(e, n, a) {
        return e && _(e, "__ob__") && e.__ob__ instanceof Re
          ? e.__ob__
          : !ke ||
              (!a && re()) ||
              (!t(e) && !l(e)) ||
              !Object.isExtensible(e) ||
              e.__v_skip ||
              Ie(e) ||
              e instanceof pe
            ? void 0
            : new Re(e, n, a);
      }
      function Me(e, n, a, r, i, o, s) {
        void 0 === s && (s = !1);
        var u = new he(),
          c = Object.getOwnPropertyDescriptor(e, n);
        if (!c || !1 !== c.configurable) {
          var l = c && c.get,
            p = c && c.set;
          (l && !p) || (a !== Ce && 2 !== arguments.length) || (a = e[n]);
          var d = i ? a && a.__ob__ : $e(a, !1, o);
          return (
            Object.defineProperty(e, n, {
              enumerable: !0,
              configurable: !0,
              get: () => {
                var n = l ? l.call(e) : a;
                return (
                  he.target && (u.depend(), d && (d.dep.depend(), t(n) && Pe(n))),
                  Ie(n) && !i ? n.value : n
                );
              },
              set: (t) => {
                var n,
                  r,
                  s = l ? l.call(e) : a;
                if ((n = s) === (r = t) ? 0 === n && 1 / n != 1 / r : n == n || r == r) {
                  if (p) p.call(e, t);
                  else {
                    if (l) return;
                    if (!i && Ie(s) && !Ie(t)) return void (s.value = t);
                    a = t;
                  }
                  (d = i ? t && t.__ob__ : $e(t, !1, o)), u.notify();
                }
              },
            }),
            u
          );
        }
      }
      function Oe(e, n, a) {
        if (!je(e)) {
          var r = e.__ob__;
          return t(e) && p(n)
            ? ((e.length = Math.max(e.length, n)),
              e.splice(n, 1, a),
              r && !r.shallow && r.mock && $e(a, !1, !0),
              a)
            : n in e && !(n in Object.prototype)
              ? ((e[n] = a), a)
              : e._isVue || (r && r.vmCount)
                ? a
                : r
                  ? (Me(r.value, n, a, void 0, r.shallow, r.mock), r.dep.notify(), a)
                  : ((e[n] = a), a);
        }
      }
      function Ae(e, n) {
        if (t(e) && p(n)) e.splice(n, 1);
        else {
          var a = e.__ob__;
          e._isVue || (a && a.vmCount) || je(e) || (_(e, n) && (delete e[n], a && a.dep.notify()));
        }
      }
      function Pe(e) {
        for (var n = void 0, a = 0, r = e.length; a < r; a++)
          (n = e[a]) && n.__ob__ && n.__ob__.dep.depend(), t(n) && Pe(n);
      }
      function Le(e) {
        return (
          ((e, t) => {
            je(e) || $e(e, t, re());
          })(e, !0),
          V(e, "__v_isShallow", !0),
          e
        );
      }
      function je(e) {
        return !(!e || !e.__v_isReadonly);
      }
      function Ie(e) {
        return !(!e || !0 !== e.__v_isRef);
      }
      function De(e, t, n) {
        Object.defineProperty(e, n, {
          enumerable: !0,
          configurable: !0,
          get: () => {
            var e = t[n];
            if (Ie(e)) return e.value;
            var a = e && e.__ob__;
            return a && a.dep.depend(), e;
          },
          set: (e) => {
            var a = t[n];
            Ie(a) && !Ie(e) ? (a.value = e) : (t[n] = e);
          },
        });
      }
      var Be = w((e) => {
        var t = "&" === e.charAt(0),
          n = "~" === (e = t ? e.slice(1) : e).charAt(0),
          a = "!" === (e = n ? e.slice(1) : e).charAt(0);
        return { name: (e = a ? e.slice(1) : e), once: n, capture: a, passive: t };
      });
      function Ne(e, n) {
        function a() {
          var e = a.fns;
          if (!t(e)) return Kt(e, null, arguments, n, "v-on handler");
          for (var r = e.slice(), i = 0; i < r.length; i++)
            Kt(r[i], null, arguments, n, "v-on handler");
        }
        return (a.fns = e), a;
      }
      function Fe(e, t, n, r, o, s) {
        var u, c, l, p;
        for (u in e)
          (c = e[u]),
            (l = t[u]),
            (p = Be(u)),
            a(c) ||
              (a(l)
                ? (a(c.fns) && (c = e[u] = Ne(c, s)),
                  i(p.once) && (c = e[u] = o(p.name, c, p.capture)),
                  n(p.name, c, p.capture, p.passive, p.params))
                : c !== l && ((l.fns = c), (e[u] = l)));
        for (u in t) a(e[u]) && r((p = Be(u)).name, t[u], p.capture);
      }
      function Ue(e, t, n) {
        var o;
        e instanceof pe && (e = e.data.hook || (e.data.hook = {}));
        var s = e[t];
        function u() {
          n.apply(this, arguments), g(o.fns, u);
        }
        a(s) ? (o = Ne([u])) : r(s.fns) && i(s.merged) ? (o = s).fns.push(u) : (o = Ne([s, u])),
          (o.merged = !0),
          (e[t] = o);
      }
      function qe(e, t, n, a, i) {
        if (r(t)) {
          if (_(t, n)) return (e[n] = t[n]), i || delete t[n], !0;
          if (_(t, a)) return (e[n] = t[a]), i || delete t[a], !0;
        }
        return !1;
      }
      function He(e) {
        return o(e) ? [ye(e)] : t(e) ? ze(e) : void 0;
      }
      function Ve(e) {
        return r(e) && r(e.text) && !1 === e.isComment;
      }
      function ze(e, n) {
        var s,
          u,
          c,
          l,
          p = [];
        for (s = 0; s < e.length; s++)
          a((u = e[s])) ||
            "boolean" == typeof u ||
            ((l = p[(c = p.length - 1)]),
            t(u)
              ? u.length > 0 &&
                (Ve((u = ze(u, "".concat(n || "", "_").concat(s)))[0]) &&
                  Ve(l) &&
                  ((p[c] = ye(l.text + u[0].text)), u.shift()),
                p.push.apply(p, u))
              : o(u)
                ? Ve(l)
                  ? (p[c] = ye(l.text + u))
                  : "" !== u && p.push(ye(u))
                : Ve(u) && Ve(l)
                  ? (p[c] = ye(l.text + u.text))
                  : (i(e._isVList) &&
                      r(u.tag) &&
                      a(u.key) &&
                      r(n) &&
                      (u.key = "__vlist".concat(n, "_").concat(s, "__")),
                    p.push(u)));
        return p;
      }
      function Ge(e, n, a, c, l, p) {
        return (
          (t(a) || o(a)) && ((l = c), (c = a), (a = void 0)),
          i(p) && (l = 2),
          ((e, n, a, i, o) => {
            if (r(a) && r(a.__ob__)) return de();
            if ((r(a) && r(a.is) && (n = a.is), !n)) return de();
            var c, l;
            if (
              (t(i) && s(i[0]) && (((a = a || {}).scopedSlots = { default: i[0] }), (i.length = 0)),
              2 === o
                ? (i = He(i))
                : 1 === o &&
                  (i = ((e) => {
                    for (var n = 0; n < e.length; n++)
                      if (t(e[n])) return Array.prototype.concat.apply([], e);
                    return e;
                  })(i)),
              "string" == typeof n)
            ) {
              var p = void 0;
              (l = (e.$vnode && e.$vnode.ns) || U.getTagNamespace(n)),
                (c = U.isReservedTag(n)
                  ? new pe(U.parsePlatformTagName(n), a, i, void 0, void 0, e)
                  : (a && a.pre) || !r((p = Fn(e.$options, "components", n)))
                    ? new pe(n, a, i, void 0, void 0, e)
                    : Mn(p, a, e, i, n));
            } else c = Mn(n, a, e, i);
            return t(c)
              ? c
              : r(c)
                ? (r(l) && Ke(c, l),
                  r(a) &&
                    ((e) => {
                      u(e.style) && cn(e.style), u(e.class) && cn(e.class);
                    })(a),
                  c)
                : de();
          })(e, n, a, c, l)
        );
      }
      function Ke(e, t, n) {
        if (((e.ns = t), "foreignObject" === e.tag && ((t = void 0), (n = !0)), r(e.children)))
          for (var o = 0, s = e.children.length; o < s; o++) {
            var u = e.children[o];
            r(u.tag) && (a(u.ns) || (i(n) && "svg" !== u.tag)) && Ke(u, t, n);
          }
      }
      function Je(e, n) {
        var a,
          i,
          o,
          s,
          c = null;
        if (t(e) || "string" == typeof e)
          for (c = new Array(e.length), a = 0, i = e.length; a < i; a++) c[a] = n(e[a], a);
        else if ("number" == typeof e) for (c = new Array(e), a = 0; a < e; a++) c[a] = n(a + 1, a);
        else if (u(e))
          if (ue && e[Symbol.iterator]) {
            c = [];
            for (var l = e[Symbol.iterator](), p = l.next(); !p.done; )
              c.push(n(p.value, c.length)), (p = l.next());
          } else
            for (o = Object.keys(e), c = new Array(o.length), a = 0, i = o.length; a < i; a++)
              (s = o[a]), (c[a] = n(e[s], s, a));
        return r(c) || (c = []), (c._isVList = !0), c;
      }
      function We(e, t, n, a) {
        var r,
          i = this.$scopedSlots[e];
        i
          ? ((n = n || {}), a && (n = M(M({}, a), n)), (r = i(n) || (s(t) ? t() : t)))
          : (r = this.$slots[e] || (s(t) ? t() : t));
        var o = n && n.slot;
        return o ? this.$createElement("template", { slot: o }, r) : r;
      }
      function Xe(e) {
        return Fn(this.$options, "filters", e) || L;
      }
      function Ze(e, n) {
        return t(e) ? -1 === e.indexOf(n) : e !== n;
      }
      function Ye(e, t, n, a, r) {
        var i = U.keyCodes[t] || n;
        return r && a && !U.keyCodes[t] ? Ze(r, a) : i ? Ze(i, e) : a ? S(a) !== t : void 0 === e;
      }
      function Qe(e, n, a, r, i) {
        if (a && u(a)) {
          t(a) && (a = O(a));
          var o = void 0,
            s = (t) => {
              if ("class" === t || "style" === t || b(t)) o = e;
              else {
                var s = e.attrs && e.attrs.type;
                o =
                  r || U.mustUseProp(n, s, t)
                    ? e.domProps || (e.domProps = {})
                    : e.attrs || (e.attrs = {});
              }
              var u = C(t),
                c = S(t);
              u in o ||
                c in o ||
                ((o[t] = a[t]),
                i &&
                  ((e.on || (e.on = {}))["update:".concat(t)] = (e) => {
                    a[t] = e;
                  }));
            };
          for (var c in a) s(c);
        }
        return e;
      }
      function et(e, t) {
        var n = this._staticTrees || (this._staticTrees = []),
          a = n[e];
        return (
          (a && !t) ||
            nt(
              (a = n[e] = this.$options.staticRenderFns[e].call(this._renderProxy, this._c, this)),
              "__static__".concat(e),
              !1
            ),
          a
        );
      }
      function tt(e, t, n) {
        return nt(e, "__once__".concat(t).concat(n ? "_".concat(n) : ""), !0), e;
      }
      function nt(e, n, a) {
        if (t(e))
          for (var r = 0; r < e.length; r++)
            e[r] && "string" != typeof e[r] && at(e[r], "".concat(n, "_").concat(r), a);
        else at(e, n, a);
      }
      function at(e, t, n) {
        (e.isStatic = !0), (e.key = t), (e.isOnce = n);
      }
      function rt(e, t) {
        if (t && l(t)) {
          var n = (e.on = e.on ? M({}, e.on) : {});
          for (var a in t) {
            var r = n[a],
              i = t[a];
            n[a] = r ? [].concat(r, i) : i;
          }
        }
        return e;
      }
      function it(e, n, a, r) {
        n = n || { $stable: !a };
        for (var i = 0; i < e.length; i++) {
          var o = e[i];
          t(o) ? it(o, n, a) : o && (o.proxy && (o.fn.proxy = !0), (n[o.key] = o.fn));
        }
        return r && (n.$key = r), n;
      }
      function ot(e, t) {
        for (var n = 0; n < t.length; n += 2) {
          var a = t[n];
          "string" == typeof a && a && (e[t[n]] = t[n + 1]);
        }
        return e;
      }
      function st(e, t) {
        return "string" == typeof e ? t + e : e;
      }
      function ut(e) {
        (e._o = tt),
          (e._n = m),
          (e._s = y),
          (e._l = Je),
          (e._t = We),
          (e._q = j),
          (e._i = I),
          (e._m = et),
          (e._f = Xe),
          (e._k = Ye),
          (e._b = Qe),
          (e._v = ye),
          (e._e = de),
          (e._u = it),
          (e._g = rt),
          (e._d = ot),
          (e._p = st);
      }
      function ct(e, t) {
        if (!e || !e.length) return {};
        for (var n = {}, a = 0, r = e.length; a < r; a++) {
          var i = e[a],
            o = i.data;
          if (
            (o && o.attrs && o.attrs.slot && delete o.attrs.slot,
            (i.context !== t && i.fnContext !== t) || !o || null == o.slot)
          )
            (n.default || (n.default = [])).push(i);
          else {
            var s = o.slot,
              u = n[s] || (n[s] = []);
            "template" === i.tag ? u.push.apply(u, i.children || []) : u.push(i);
          }
        }
        for (var c in n) n[c].every(lt) && delete n[c];
        return n;
      }
      function lt(e) {
        return (e.isComment && !e.asyncFactory) || " " === e.text;
      }
      function pt(e) {
        return e.isComment && e.asyncFactory;
      }
      function dt(t, n, a, r) {
        var i,
          o = Object.keys(a).length > 0,
          s = n ? !!n.$stable : !o,
          u = n && n.$key;
        if (n) {
          if (n._normalized) return n._normalized;
          if (s && r && r !== e && u === r.$key && !o && !r.$hasNormal) return r;
          for (var c in ((i = {}), n)) n[c] && "$" !== c[0] && (i[c] = yt(t, a, c, n[c]));
        } else i = {};
        for (var l in a) l in i || (i[l] = ft(a, l));
        return (
          n && Object.isExtensible(n) && (n._normalized = i),
          V(i, "$stable", s),
          V(i, "$key", u),
          V(i, "$hasNormal", o),
          i
        );
      }
      function yt(e, n, a, r) {
        var i = () => {
          var n = ce;
          le(e);
          var a = arguments.length ? r.apply(null, arguments) : r({}),
            i = (a = a && "object" == typeof a && !t(a) ? [a] : He(a)) && a[0];
          return le(n), a && (!i || (1 === a.length && i.isComment && !pt(i))) ? void 0 : a;
        };
        return (
          r.proxy && Object.defineProperty(n, a, { get: i, enumerable: !0, configurable: !0 }), i
        );
      }
      function ft(e, t) {
        return () => e[t];
      }
      function mt(e, t, n, a, r) {
        var i = !1;
        for (var o in t) o in e ? t[o] !== n[o] && (i = !0) : ((i = !0), vt(e, o, a, r));
        for (var o in e) o in t || ((i = !0), delete e[o]);
        return i;
      }
      function vt(e, t, n, a) {
        Object.defineProperty(e, t, {
          enumerable: !0,
          configurable: !0,
          get: () => n[a][t],
        });
      }
      function ht(e, t) {
        for (var n in t) e[n] = t[n];
        for (var n in e) n in t || delete e[n];
      }
      var bt,
        gt,
        Tt = null;
      function _t(e, t) {
        return (
          (e.__esModule || (ue && "Module" === e[Symbol.toStringTag])) && (e = e.default),
          u(e) ? t.extend(e) : e
        );
      }
      function wt(e) {
        if (t(e))
          for (var n = 0; n < e.length; n++) {
            var a = e[n];
            if (r(a) && (r(a.componentOptions) || pt(a))) return a;
          }
      }
      function xt(e, t) {
        bt.$on(e, t);
      }
      function Ct(e, t) {
        bt.$off(e, t);
      }
      function kt(e, t) {
        var n = bt;
        return function a() {
          null !== t.apply(null, arguments) && n.$off(e, a);
        };
      }
      function Et(e, t, n) {
        (bt = e), Fe(t, n || {}, xt, Ct, kt, e), (bt = void 0);
      }
      var St = (() => {
          function e(e) {
            void 0 === e && (e = !1),
              (this.detached = e),
              (this.active = !0),
              (this.effects = []),
              (this.cleanups = []),
              (this.parent = gt),
              !e && gt && (this.index = (gt.scopes || (gt.scopes = [])).push(this) - 1);
          }
          return (
            (e.prototype.run = function (e) {
              if (this.active) {
                var t = gt;
                try {
                  return (gt = this), e();
                } finally {
                  gt = t;
                }
              }
            }),
            (e.prototype.on = function () {
              gt = this;
            }),
            (e.prototype.off = function () {
              gt = this.parent;
            }),
            (e.prototype.stop = function (e) {
              if (this.active) {
                var t = void 0,
                  n = void 0;
                for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].teardown();
                for (t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
                if (this.scopes)
                  for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].stop(!0);
                if (!this.detached && this.parent && !e) {
                  var a = this.parent.scopes.pop();
                  a && a !== this && ((this.parent.scopes[this.index] = a), (a.index = this.index));
                }
                (this.parent = void 0), (this.active = !1);
              }
            }),
            e
          );
        })(),
        Rt = null;
      function $t(e) {
        var t = Rt;
        return (
          (Rt = e),
          () => {
            Rt = t;
          }
        );
      }
      function Mt(e) {
        for (; e && (e = e.$parent); ) if (e._inactive) return !0;
        return !1;
      }
      function Ot(e, t) {
        if (t) {
          if (((e._directInactive = !1), Mt(e))) return;
        } else if (e._directInactive) return;
        if (e._inactive || null === e._inactive) {
          e._inactive = !1;
          for (var n = 0; n < e.$children.length; n++) Ot(e.$children[n]);
          Pt(e, "activated");
        }
      }
      function At(e, t) {
        if (!((t && ((e._directInactive = !0), Mt(e))) || e._inactive)) {
          e._inactive = !0;
          for (var n = 0; n < e.$children.length; n++) At(e.$children[n]);
          Pt(e, "deactivated");
        }
      }
      function Pt(e, t, n, a) {
        void 0 === a && (a = !0), ge();
        var r = ce,
          i = gt;
        a && le(e);
        var o = e.$options[t],
          s = "".concat(t, " hook");
        if (o) for (var u = 0, c = o.length; u < c; u++) Kt(o[u], e, n || null, e, s);
        e._hasHookEvent && e.$emit("hook:" + t), a && (le(r), i && i.on()), Te();
      }
      var Lt = [],
        jt = [],
        It = {},
        Dt = !1,
        Bt = !1,
        Nt = 0,
        Ft = 0,
        Ut = Date.now;
      if (K && !W) {
        var qt = window.performance;
        qt &&
          "function" == typeof qt.now &&
          Ut() > document.createEvent("Event").timeStamp &&
          (Ut = () => qt.now());
      }
      var Ht = (e, t) => {
        if (e.post) {
          if (!t.post) return 1;
        } else if (t.post) return -1;
        return e.id - t.id;
      };
      function Vt() {
        var e, t;
        for (Ft = Ut(), Bt = !0, Lt.sort(Ht), Nt = 0; Nt < Lt.length; Nt++)
          (e = Lt[Nt]).before && e.before(), (t = e.id), (It[t] = null), e.run();
        var n = jt.slice(),
          a = Lt.slice();
        (Nt = Lt.length = jt.length = 0),
          (It = {}),
          (Dt = Bt = !1),
          ((e) => {
            for (var t = 0; t < e.length; t++) (e[t]._inactive = !0), Ot(e[t], !0);
          })(n),
          ((e) => {
            for (var t = e.length; t--; ) {
              var n = e[t],
                a = n.vm;
              a && a._watcher === n && a._isMounted && !a._isDestroyed && Pt(a, "updated");
            }
          })(a),
          (() => {
            for (var e = 0; e < ve.length; e++) {
              var t = ve[e];
              (t.subs = t.subs.filter((e) => e)), (t._pending = !1);
            }
            ve.length = 0;
          })(),
          ie && U.devtools && ie.emit("flush");
      }
      var zt = "watcher";
      function Gt(e, t, n) {
        ge();
        try {
          if (t)
            for (var a = t; (a = a.$parent); ) {
              var r = a.$options.errorCaptured;
              if (r)
                for (var i = 0; i < r.length; i++)
                  try {
                    if (!1 === r[i].call(a, e, t, n)) return;
                  } catch (e) {
                    Jt(e, a, "errorCaptured hook");
                  }
            }
          Jt(e, t, n);
        } finally {
          Te();
        }
      }
      function Kt(e, t, n, a, r) {
        var i;
        try {
          (i = n ? e.apply(t, n) : e.call(t)) &&
            !i._isVue &&
            d(i) &&
            !i._handled &&
            (i.catch((e) => Gt(e, a, r + " (Promise/async)")), (i._handled = !0));
        } catch (e) {
          Gt(e, a, r);
        }
        return i;
      }
      function Jt(e, t, n) {
        if (U.errorHandler)
          try {
            return U.errorHandler.call(null, e, t, n);
          } catch (t) {
            t !== e && Wt(t);
          }
        Wt(e);
      }
      function Wt(e, t, n) {
        if (!K || "undefined" == typeof console) throw e;
        console.error(e);
      }
      "".concat(zt, " callback"), "".concat(zt, " getter"), "".concat(zt, " cleanup");
      var Xt,
        Zt = !1,
        Yt = [],
        Qt = !1;
      function en() {
        Qt = !1;
        var e = Yt.slice(0);
        Yt.length = 0;
        for (var t = 0; t < e.length; t++) e[t]();
      }
      if ("undefined" != typeof Promise && oe(Promise)) {
        var tn = Promise.resolve();
        (Xt = () => {
          tn.then(en), Y && setTimeout(A);
        }),
          (Zt = !0);
      } else if (
        W ||
        "undefined" == typeof MutationObserver ||
        (!oe(MutationObserver) &&
          "[object MutationObserverConstructor]" !== MutationObserver.toString())
      )
        Xt =
          "undefined" != typeof setImmediate && oe(setImmediate)
            ? () => {
                setImmediate(en);
              }
            : () => {
                setTimeout(en, 0);
              };
      else {
        var nn = 1,
          an = new MutationObserver(en),
          rn = document.createTextNode(String(nn));
        an.observe(rn, { characterData: !0 }),
          (Xt = () => {
            (nn = (nn + 1) % 2), (rn.data = String(nn));
          }),
          (Zt = !0);
      }
      function on(e, t) {
        var n;
        if (
          (Yt.push(() => {
            if (e)
              try {
                e.call(t);
              } catch (e) {
                Gt(e, t, "nextTick");
              }
            else n && n(t);
          }),
          Qt || ((Qt = !0), Xt()),
          !e && "undefined" != typeof Promise)
        )
          return new Promise((e) => {
            n = e;
          });
      }
      function sn(e) {
        return (t, n) => {
          if ((void 0 === n && (n = ce), n))
            return ((e, t, n) => {
              var a = e.$options;
              a[t] = In(a[t], n);
            })(n, e, t);
        };
      }
      sn("beforeMount"),
        sn("mounted"),
        sn("beforeUpdate"),
        sn("updated"),
        sn("beforeDestroy"),
        sn("destroyed"),
        sn("activated"),
        sn("deactivated"),
        sn("serverPrefetch"),
        sn("renderTracked"),
        sn("renderTriggered"),
        sn("errorCaptured");
      var un = new se();
      function cn(e) {
        return ln(e, un), un.clear(), e;
      }
      function ln(e, n) {
        var a,
          r,
          i = t(e);
        if (!((!i && !u(e)) || e.__v_skip || Object.isFrozen(e) || e instanceof pe)) {
          if (e.__ob__) {
            var o = e.__ob__.dep.id;
            if (n.has(o)) return;
            n.add(o);
          }
          if (i) for (a = e.length; a--; ) ln(e[a], n);
          else if (Ie(e)) ln(e.value, n);
          else for (a = (r = Object.keys(e)).length; a--; ) ln(e[r[a]], n);
        }
      }
      var pn = 0,
        dn = (() => {
          function e(e, t, n, a, r) {
            var i;
            void 0 === (i = gt && !gt._vm ? gt : e ? e._scope : void 0) && (i = gt),
              i && i.active && i.effects.push(this),
              (this.vm = e) && r && (e._watcher = this),
              a
                ? ((this.deep = !!a.deep),
                  (this.user = !!a.user),
                  (this.lazy = !!a.lazy),
                  (this.sync = !!a.sync),
                  (this.before = a.before))
                : (this.deep = this.user = this.lazy = this.sync = !1),
              (this.cb = n),
              (this.id = ++pn),
              (this.active = !0),
              (this.post = !1),
              (this.dirty = this.lazy),
              (this.deps = []),
              (this.newDeps = []),
              (this.depIds = new se()),
              (this.newDepIds = new se()),
              (this.expression = ""),
              s(t)
                ? (this.getter = t)
                : ((this.getter = ((e) => {
                    if (!z.test(e)) {
                      var t = e.split(".");
                      return (e) => {
                        for (var n = 0; n < t.length; n++) {
                          if (!e) return;
                          e = e[t[n]];
                        }
                        return e;
                      };
                    }
                  })(t)),
                  this.getter || (this.getter = A)),
              (this.value = this.lazy ? void 0 : this.get());
          }
          return (
            (e.prototype.get = function () {
              var e;
              ge(this);
              var t = this.vm;
              try {
                e = this.getter.call(t, t);
              } catch (e) {
                if (!this.user) throw e;
                Gt(e, t, 'getter for watcher "'.concat(this.expression, '"'));
              } finally {
                this.deep && cn(e), Te(), this.cleanupDeps();
              }
              return e;
            }),
            (e.prototype.addDep = function (e) {
              var t = e.id;
              this.newDepIds.has(t) ||
                (this.newDepIds.add(t), this.newDeps.push(e), this.depIds.has(t) || e.addSub(this));
            }),
            (e.prototype.cleanupDeps = function () {
              for (var e = this.deps.length; e--; ) {
                var t = this.deps[e];
                this.newDepIds.has(t.id) || t.removeSub(this);
              }
              var n = this.depIds;
              (this.depIds = this.newDepIds),
                (this.newDepIds = n),
                this.newDepIds.clear(),
                (n = this.deps),
                (this.deps = this.newDeps),
                (this.newDeps = n),
                (this.newDeps.length = 0);
            }),
            (e.prototype.update = function () {
              this.lazy
                ? (this.dirty = !0)
                : this.sync
                  ? this.run()
                  : ((e) => {
                      var t = e.id;
                      if (null == It[t] && (e !== he.target || !e.noRecurse)) {
                        if (((It[t] = !0), Bt)) {
                          for (var n = Lt.length - 1; n > Nt && Lt[n].id > e.id; ) n--;
                          Lt.splice(n + 1, 0, e);
                        } else Lt.push(e);
                        Dt || ((Dt = !0), on(Vt));
                      }
                    })(this);
            }),
            (e.prototype.run = function () {
              if (this.active) {
                var e = this.get();
                if (e !== this.value || u(e) || this.deep) {
                  var t = this.value;
                  if (((this.value = e), this.user)) {
                    var n = 'callback for watcher "'.concat(this.expression, '"');
                    Kt(this.cb, this.vm, [e, t], this.vm, n);
                  } else this.cb.call(this.vm, e, t);
                }
              }
            }),
            (e.prototype.evaluate = function () {
              (this.value = this.get()), (this.dirty = !1);
            }),
            (e.prototype.depend = function () {
              for (var e = this.deps.length; e--; ) this.deps[e].depend();
            }),
            (e.prototype.teardown = function () {
              if (
                (this.vm && !this.vm._isBeingDestroyed && g(this.vm._scope.effects, this),
                this.active)
              ) {
                for (var e = this.deps.length; e--; ) this.deps[e].removeSub(this);
                (this.active = !1), this.onStop && this.onStop();
              }
            }),
            e
          );
        })(),
        yn = { enumerable: !0, configurable: !0, get: A, set: A };
      function fn(e, t, n) {
        (yn.get = function () {
          return this[t][n];
        }),
          (yn.set = function (e) {
            this[t][n] = e;
          }),
          Object.defineProperty(e, n, yn);
      }
      function mn(n) {
        var a = n.$options;
        if (
          (a.props &&
            ((e, t) => {
              var n = e.$options.propsData || {},
                a = (e._props = Le({})),
                r = (e.$options._propKeys = []);
              !e.$parent || Ee(!1);
              var i = (i) => {
                r.push(i);
                var o = Un(i, t, n, e);
                Me(a, i, o, void 0, !0), i in e || fn(e, "_props", i);
              };
              for (var o in t) i(o);
              Ee(!0);
            })(n, a.props),
          ((t) => {
            var n = t.$options,
              a = n.setup;
            if (a) {
              var r = (t._setupContext = ((t) => ({
                get attrs() {
                  if (!t._attrsProxy) {
                    var n = (t._attrsProxy = {});
                    V(n, "_v_attr_proxy", !0), mt(n, t.$attrs, e, t, "$attrs");
                  }
                  return t._attrsProxy;
                },
                get listeners() {
                  return (
                    t._listenersProxy ||
                      mt((t._listenersProxy = {}), t.$listeners, e, t, "$listeners"),
                    t._listenersProxy
                  );
                },
                get slots() {
                  return ((e) => (
                    e._slotsProxy || ht((e._slotsProxy = {}), e.$scopedSlots), e._slotsProxy
                  ))(t);
                },
                emit: R(t.$emit, t),
                expose: (e) => {
                  e && Object.keys(e).forEach((n) => De(t, e, n));
                },
              }))(t));
              le(t), ge();
              var i = Kt(a, null, [t._props || Le({}), r], t, "setup");
              if ((Te(), le(), s(i))) n.render = i;
              else if (u(i))
                if (((t._setupState = i), i.__sfc)) {
                  var o = (t._setupProxy = {});
                  for (var c in i) "__sfc" !== c && De(o, i, c);
                } else for (var c in i) H(c) || De(t, i, c);
            }
          })(n),
          a.methods &&
            ((e, t) => {
              for (var n in (e.$options.props, t))
                e[n] = "function" != typeof t[n] ? A : R(t[n], e);
            })(n, a.methods),
          a.data)
        )
          !((e) => {
            var t = e.$options.data;
            l(
              (t = e._data =
                s(t)
                  ? ((e, t) => {
                      ge();
                      try {
                        return e.call(t, t);
                      } catch (e) {
                        return Gt(e, t, "data()"), {};
                      } finally {
                        Te();
                      }
                    })(t, e)
                  : t || {})
            ) || (t = {});
            for (
              var n = Object.keys(t), a = e.$options.props, r = (e.$options.methods, n.length);
              r--;
            ) {
              var i = n[r];
              (a && _(a, i)) || H(i) || fn(e, "_data", i);
            }
            var o = $e(t);
            o && o.vmCount++;
          })(n);
        else {
          var r = $e((n._data = {}));
          r && r.vmCount++;
        }
        a.computed &&
          ((e, t) => {
            var n = (e._computedWatchers = Object.create(null)),
              a = re();
            for (var r in t) {
              var i = t[r],
                o = s(i) ? i : i.get;
              a || (n[r] = new dn(e, o || A, A, vn)), r in e || hn(e, r, i);
            }
          })(n, a.computed),
          a.watch &&
            a.watch !== te &&
            ((e, n) => {
              for (var a in n) {
                var r = n[a];
                if (t(r)) for (var i = 0; i < r.length; i++) Tn(e, a, r[i]);
                else Tn(e, a, r);
              }
            })(n, a.watch);
      }
      var vn = { lazy: !0 };
      function hn(e, t, n) {
        var a = !re();
        s(n)
          ? ((yn.get = a ? bn(t) : gn(n)), (yn.set = A))
          : ((yn.get = n.get ? (a && !1 !== n.cache ? bn(t) : gn(n.get)) : A),
            (yn.set = n.set || A)),
          Object.defineProperty(e, t, yn);
      }
      function bn(e) {
        return function () {
          var t = this._computedWatchers && this._computedWatchers[e];
          if (t) return t.dirty && t.evaluate(), he.target && t.depend(), t.value;
        };
      }
      function gn(e) {
        return function () {
          return e.call(this, this);
        };
      }
      function Tn(e, t, n, a) {
        return (
          l(n) && ((a = n), (n = n.handler)), "string" == typeof n && (n = e[n]), e.$watch(t, n, a)
        );
      }
      function _n(e, t) {
        if (e) {
          for (
            var n = Object.create(null), a = ue ? Reflect.ownKeys(e) : Object.keys(e), r = 0;
            r < a.length;
            r++
          ) {
            var i = a[r];
            if ("__ob__" !== i) {
              var o = e[i].from;
              if (o in t._provided) n[i] = t._provided[o];
              else if ("default" in e[i]) {
                var u = e[i].default;
                n[i] = s(u) ? u.call(t) : u;
              }
            }
          }
          return n;
        }
      }
      var wn = 0;
      function xn(e) {
        var t = e.options;
        if (e.super) {
          var n = xn(e.super);
          if (n !== e.superOptions) {
            e.superOptions = n;
            var a = ((e) => {
              var t,
                n = e.options,
                a = e.sealedOptions;
              for (var r in n) n[r] !== a[r] && (t || (t = {}), (t[r] = n[r]));
              return t;
            })(e);
            a && M(e.extendOptions, a),
              (t = e.options = Nn(n, e.extendOptions)).name && (t.components[t.name] = e);
          }
        }
        return t;
      }
      function Cn(n, a, r, o, s) {
        var u,
          l = s.options;
        _(o, "_uid") ? ((u = Object.create(o))._original = o) : ((u = o), (o = o._original));
        var p = i(l._compiled),
          d = !p;
        (this.data = n),
          (this.props = a),
          (this.children = r),
          (this.parent = o),
          (this.listeners = n.on || e),
          (this.injections = _n(l.inject, o)),
          (this.slots = () => (
            this.$slots || dt(o, n.scopedSlots, (this.$slots = ct(r, o))), this.$slots
          )),
          Object.defineProperty(this, "scopedSlots", {
            enumerable: !0,
            get: function () {
              return dt(o, n.scopedSlots, this.slots());
            },
          }),
          p &&
            ((this.$options = l),
            (this.$slots = this.slots()),
            (this.$scopedSlots = dt(o, n.scopedSlots, this.$slots))),
          l._scopeId
            ? (this._c = (e, n, a, r) => {
                var i = Ge(u, e, n, a, r, d);
                return i && !t(i) && ((i.fnScopeId = l._scopeId), (i.fnContext = o)), i;
              })
            : (this._c = (e, t, n, a) => Ge(u, e, t, n, a, d));
      }
      function kn(e, t, n, a, r) {
        var i = fe(e);
        return (
          (i.fnContext = n),
          (i.fnOptions = a),
          t.slot && ((i.data || (i.data = {})).slot = t.slot),
          i
        );
      }
      function En(e, t) {
        for (var n in t) e[C(n)] = t[n];
      }
      function Sn(e) {
        return e.name || e.__name || e._componentTag;
      }
      ut(Cn.prototype);
      var Rn = {
          init: (e, t) => {
            if (e.componentInstance && !e.componentInstance._isDestroyed && e.data.keepAlive) {
              var n = e;
              Rn.prepatch(n, n);
            } else
              (e.componentInstance = ((e, t) => {
                var n = { _isComponent: !0, _parentVnode: e, parent: t },
                  a = e.data.inlineTemplate;
                return (
                  r(a) && ((n.render = a.render), (n.staticRenderFns = a.staticRenderFns)),
                  new e.componentOptions.Ctor(n)
                );
              })(e, Rt)).$mount(t ? e.elm : void 0, t);
          },
          prepatch: (t, n) => {
            var a = n.componentOptions;
            !((t, n, a, r, i) => {
              var o = r.data.scopedSlots,
                s = t.$scopedSlots,
                u = !!(
                  (o && !o.$stable) ||
                  (s !== e && !s.$stable) ||
                  (o && t.$scopedSlots.$key !== o.$key) ||
                  (!o && t.$scopedSlots.$key)
                ),
                c = !!(i || t.$options._renderChildren || u),
                l = t.$vnode;
              (t.$options._parentVnode = r),
                (t.$vnode = r),
                t._vnode && (t._vnode.parent = r),
                (t.$options._renderChildren = i);
              var p = r.data.attrs || e;
              t._attrsProxy &&
                mt(t._attrsProxy, p, (l.data && l.data.attrs) || e, t, "$attrs") &&
                (c = !0),
                (t.$attrs = p),
                (a = a || e);
              var d = t.$options._parentListeners;
              if (
                (t._listenersProxy && mt(t._listenersProxy, a, d || e, t, "$listeners"),
                (t.$listeners = t.$options._parentListeners = a),
                Et(t, a, d),
                n && t.$options.props)
              ) {
                Ee(!1);
                for (var y = t._props, f = t.$options._propKeys || [], m = 0; m < f.length; m++) {
                  var v = f[m],
                    h = t.$options.props;
                  y[v] = Un(v, h, n, t);
                }
                Ee(!0), (t.$options.propsData = n);
              }
              c && ((t.$slots = ct(i, r.context)), t.$forceUpdate());
            })(
              (n.componentInstance = t.componentInstance),
              a.propsData,
              a.listeners,
              n,
              a.children
            );
          },
          insert: (e) => {
            var t,
              n = e.context,
              a = e.componentInstance;
            a._isMounted || ((a._isMounted = !0), Pt(a, "mounted")),
              e.data.keepAlive &&
                (n._isMounted ? (((t = a)._inactive = !1), jt.push(t)) : Ot(a, !0));
          },
          destroy: (e) => {
            var t = e.componentInstance;
            t._isDestroyed || (e.data.keepAlive ? At(t, !0) : t.$destroy());
          },
        },
        $n = Object.keys(Rn);
      function Mn(n, o, s, c, l) {
        if (!a(n)) {
          var p = s.$options._base;
          if ((u(n) && (n = p.extend(n)), "function" == typeof n)) {
            var y;
            if (
              a(n.cid) &&
              ((n = ((e, t) => {
                if (i(e.error) && r(e.errorComp)) return e.errorComp;
                if (r(e.resolved)) return e.resolved;
                var n = Tt;
                if (
                  (n && r(e.owners) && -1 === e.owners.indexOf(n) && e.owners.push(n),
                  i(e.loading) && r(e.loadingComp))
                )
                  return e.loadingComp;
                if (n && !r(e.owners)) {
                  var o = (e.owners = [n]),
                    s = !0,
                    c = null,
                    l = null;
                  n.$on("hook:destroyed", () => g(o, n));
                  var p = (e) => {
                      for (var t = 0, n = o.length; t < n; t++) o[t].$forceUpdate();
                      e &&
                        ((o.length = 0),
                        null !== c && (clearTimeout(c), (c = null)),
                        null !== l && (clearTimeout(l), (l = null)));
                    },
                    y = D((n) => {
                      (e.resolved = _t(n, t)), s ? (o.length = 0) : p(!0);
                    }),
                    f = D((t) => {
                      r(e.errorComp) && ((e.error = !0), p(!0));
                    }),
                    m = e(y, f);
                  return (
                    u(m) &&
                      (d(m)
                        ? a(e.resolved) && m.then(y, f)
                        : d(m.component) &&
                          (m.component.then(y, f),
                          r(m.error) && (e.errorComp = _t(m.error, t)),
                          r(m.loading) &&
                            ((e.loadingComp = _t(m.loading, t)),
                            0 === m.delay
                              ? (e.loading = !0)
                              : (c = setTimeout(() => {
                                  (c = null),
                                    a(e.resolved) && a(e.error) && ((e.loading = !0), p(!1));
                                }, m.delay || 200))),
                          r(m.timeout) &&
                            (l = setTimeout(() => {
                              (l = null), a(e.resolved) && f(null);
                            }, m.timeout)))),
                    (s = !1),
                    e.loading ? e.loadingComp : e.resolved
                  );
                }
              })((y = n), p)),
              void 0 === n)
            )
              return ((e, t, n, a, r) => {
                var i = de();
                return (
                  (i.asyncFactory = e),
                  (i.asyncMeta = { data: t, context: n, children: a, tag: r }),
                  i
                );
              })(y, o, s, c, l);
            (o = o || {}),
              xn(n),
              r(o.model) &&
                ((e, n) => {
                  var a = (e.model && e.model.prop) || "value",
                    i = (e.model && e.model.event) || "input";
                  (n.attrs || (n.attrs = {}))[a] = n.model.value;
                  var o = n.on || (n.on = {}),
                    s = o[i],
                    u = n.model.callback;
                  r(s)
                    ? (t(s) ? -1 === s.indexOf(u) : s !== u) && (o[i] = [u].concat(s))
                    : (o[i] = u);
                })(n.options, o);
            var f = ((e, t) => {
              var n = t.options.props;
              if (!a(n)) {
                var i = {},
                  o = e.attrs,
                  s = e.props;
                if (r(o) || r(s))
                  for (var u in n) {
                    var c = S(u);
                    qe(i, s, u, c, !0) || qe(i, o, u, c, !1);
                  }
                return i;
              }
            })(o, n);
            if (i(n.options.functional))
              return ((n, a, i, o, s) => {
                var u = n.options,
                  c = {},
                  l = u.props;
                if (r(l)) for (var p in l) c[p] = Un(p, l, a || e);
                else r(i.attrs) && En(c, i.attrs), r(i.props) && En(c, i.props);
                var d = new Cn(i, c, s, o, n),
                  y = u.render.call(null, d._c, d);
                if (y instanceof pe) return kn(y, i, d.parent, u);
                if (t(y)) {
                  for (var f = He(y) || [], m = new Array(f.length), v = 0; v < f.length; v++)
                    m[v] = kn(f[v], i, d.parent, u);
                  return m;
                }
              })(n, f, o, s, c);
            var m = o.on;
            if (((o.on = o.nativeOn), i(n.options.abstract))) {
              var v = o.slot;
              (o = {}), v && (o.slot = v);
            }
            !((e) => {
              for (var t = e.hook || (e.hook = {}), n = 0; n < $n.length; n++) {
                var a = $n[n],
                  r = t[a],
                  i = Rn[a];
                r === i || (r && r._merged) || (t[a] = r ? On(i, r) : i);
              }
            })(o);
            var h = Sn(n.options) || l;
            return new pe(
              "vue-component-".concat(n.cid).concat(h ? "-".concat(h) : ""),
              o,
              void 0,
              void 0,
              void 0,
              s,
              { Ctor: n, propsData: f, listeners: m, tag: l, children: c },
              y
            );
          }
        }
      }
      function On(e, t) {
        var n = (n, a) => {
          e(n, a), t(n, a);
        };
        return (n._merged = !0), n;
      }
      var An = A,
        Pn = U.optionMergeStrategies;
      function Ln(e, t, n) {
        if ((void 0 === n && (n = !0), !t)) return e;
        for (var a, r, i, o = ue ? Reflect.ownKeys(t) : Object.keys(t), s = 0; s < o.length; s++)
          "__ob__" !== (a = o[s]) &&
            ((r = e[a]),
            (i = t[a]),
            n && _(e, a) ? r !== i && l(r) && l(i) && Ln(r, i) : Oe(e, a, i));
        return e;
      }
      function jn(e, t, n) {
        return n
          ? () => {
              var a = s(t) ? t.call(n, n) : t,
                r = s(e) ? e.call(n, n) : e;
              return a ? Ln(a, r) : r;
            }
          : t
            ? e
              ? function () {
                  return Ln(s(t) ? t.call(this, this) : t, s(e) ? e.call(this, this) : e);
                }
              : t
            : e;
      }
      function In(e, n) {
        var a = n ? (e ? e.concat(n) : t(n) ? n : [n]) : e;
        return a
          ? ((e) => {
              for (var t = [], n = 0; n < e.length; n++) -1 === t.indexOf(e[n]) && t.push(e[n]);
              return t;
            })(a)
          : a;
      }
      function Dn(e, t, n, a) {
        var r = Object.create(e || null);
        return t ? M(r, t) : r;
      }
      (Pn.data = (e, t, n) => (n ? jn(e, t, n) : t && "function" != typeof t ? e : jn(e, t))),
        F.forEach((e) => {
          Pn[e] = In;
        }),
        N.forEach((e) => {
          Pn[e + "s"] = Dn;
        }),
        (Pn.watch = (e, n, a, r) => {
          if ((e === te && (e = void 0), n === te && (n = void 0), !n))
            return Object.create(e || null);
          if (!e) return n;
          var i = {};
          for (var o in (M(i, e), n)) {
            var s = i[o],
              u = n[o];
            s && !t(s) && (s = [s]), (i[o] = s ? s.concat(u) : t(u) ? u : [u]);
          }
          return i;
        }),
        (Pn.props =
          Pn.methods =
          Pn.inject =
          Pn.computed =
            (e, t, n, a) => {
              if (!e) return t;
              var r = Object.create(null);
              return M(r, e), t && M(r, t), r;
            }),
        (Pn.provide = (e, t) =>
          e
            ? function () {
                var n = Object.create(null);
                return Ln(n, s(e) ? e.call(this) : e), t && Ln(n, s(t) ? t.call(this) : t, !1), n;
              }
            : t);
      var Bn = (e, t) => (void 0 === t ? e : t);
      function Nn(e, n, a) {
        if (
          (s(n) && (n = n.options),
          ((e) => {
            var n = e.props;
            if (n) {
              var a,
                r,
                i = {};
              if (t(n))
                for (a = n.length; a--; )
                  "string" == typeof (r = n[a]) && (i[C(r)] = { type: null });
              else if (l(n)) for (var o in n) (r = n[o]), (i[C(o)] = l(r) ? r : { type: r });
              e.props = i;
            }
          })(n),
          ((e) => {
            var n = e.inject;
            if (n) {
              var a = (e.inject = {});
              if (t(n)) for (var r = 0; r < n.length; r++) a[n[r]] = { from: n[r] };
              else if (l(n))
                for (var i in n) {
                  var o = n[i];
                  a[i] = l(o) ? M({ from: i }, o) : { from: o };
                }
            }
          })(n),
          ((e) => {
            var t = e.directives;
            if (t)
              for (var n in t) {
                var a = t[n];
                s(a) && (t[n] = { bind: a, update: a });
              }
          })(n),
          !n._base && (n.extends && (e = Nn(e, n.extends, a)), n.mixins))
        )
          for (var r = 0, i = n.mixins.length; r < i; r++) e = Nn(e, n.mixins[r], a);
        var o,
          u = {};
        for (o in e) c(o);
        for (o in n) _(e, o) || c(o);
        function c(t) {
          var r = Pn[t] || Bn;
          u[t] = r(e[t], n[t], a, t);
        }
        return u;
      }
      function Fn(e, t, n, a) {
        if ("string" == typeof n) {
          var r = e[t];
          if (_(r, n)) return r[n];
          var i = C(n);
          if (_(r, i)) return r[i];
          var o = k(i);
          return _(r, o) ? r[o] : r[n] || r[i] || r[o];
        }
      }
      function Un(e, t, n, a) {
        var r = t[e],
          i = !_(n, e),
          o = n[e],
          u = zn(Boolean, r.type);
        if (u > -1)
          if (i && !_(r, "default")) o = !1;
          else if ("" === o || o === S(e)) {
            var c = zn(String, r.type);
            (c < 0 || u < c) && (o = !0);
          }
        if (void 0 === o) {
          o = ((e, t, n) => {
            if (_(t, "default")) {
              var a = t.default;
              return e &&
                e.$options.propsData &&
                void 0 === e.$options.propsData[n] &&
                void 0 !== e._props[n]
                ? e._props[n]
                : s(a) && "Function" !== Hn(t.type)
                  ? a.call(e)
                  : a;
            }
          })(a, r, e);
          var l = ke;
          Ee(!0), $e(o), Ee(l);
        }
        return o;
      }
      var qn = /^\s*function (\w+)/;
      function Hn(e) {
        var t = e && e.toString().match(qn);
        return t ? t[1] : "";
      }
      function Vn(e, t) {
        return Hn(e) === Hn(t);
      }
      function zn(e, n) {
        if (!t(n)) return Vn(n, e) ? 0 : -1;
        for (var a = 0, r = n.length; a < r; a++) if (Vn(n[a], e)) return a;
        return -1;
      }
      function Gn(e) {
        this._init(e);
      }
      function Kn(e) {
        return e && (Sn(e.Ctor.options) || e.tag);
      }
      function Jn(e, n) {
        return t(e)
          ? e.indexOf(n) > -1
          : "string" == typeof e
            ? e.split(",").indexOf(n) > -1
            : ((a = e), !("[object RegExp]" !== c.call(a)) && e.test(n));
        var a;
      }
      function Wn(e, t) {
        var n = e.cache,
          a = e.keys,
          r = e._vnode,
          i = e.$vnode;
        for (var o in n) {
          var s = n[o];
          if (s) {
            var u = s.name;
            u && !t(u) && Xn(n, o, a, r);
          }
        }
        i.componentOptions.children = void 0;
      }
      function Xn(e, t, n, a) {
        var r = e[t];
        !r || (a && r.tag === a.tag) || r.componentInstance.$destroy(), (e[t] = null), g(n, t);
      }
      !((t) => {
        t.prototype._init = function (t) {
          (this._uid = wn++),
            (this._isVue = !0),
            (this.__v_skip = !0),
            (this._scope = new St(!0)),
            (this._scope.parent = void 0),
            (this._scope._vm = !0),
            t && t._isComponent
              ? ((e, t) => {
                  var n = (e.$options = Object.create(e.constructor.options)),
                    a = t._parentVnode;
                  (n.parent = t.parent), (n._parentVnode = a);
                  var r = a.componentOptions;
                  (n.propsData = r.propsData),
                    (n._parentListeners = r.listeners),
                    (n._renderChildren = r.children),
                    (n._componentTag = r.tag),
                    t.render && ((n.render = t.render), (n.staticRenderFns = t.staticRenderFns));
                })(this, t)
              : (this.$options = Nn(xn(this.constructor), t || {}, this)),
            (this._renderProxy = this),
            (this._self = this),
            ((e) => {
              var t = e.$options,
                n = t.parent;
              if (n && !t.abstract) {
                for (; n.$options.abstract && n.$parent; ) n = n.$parent;
                n.$children.push(e);
              }
              (e.$parent = n),
                (e.$root = n ? n.$root : e),
                (e.$children = []),
                (e.$refs = {}),
                (e._provided = n ? n._provided : Object.create(null)),
                (e._watcher = null),
                (e._inactive = null),
                (e._directInactive = !1),
                (e._isMounted = !1),
                (e._isDestroyed = !1),
                (e._isBeingDestroyed = !1);
            })(this),
            ((e) => {
              (e._events = Object.create(null)), (e._hasHookEvent = !1);
              var t = e.$options._parentListeners;
              t && Et(e, t);
            })(this),
            ((t) => {
              (t._vnode = null), (t._staticTrees = null);
              var n = t.$options,
                a = (t.$vnode = n._parentVnode),
                r = a && a.context;
              (t.$slots = ct(n._renderChildren, r)),
                (t.$scopedSlots = a ? dt(t.$parent, a.data.scopedSlots, t.$slots) : e),
                (t._c = (e, n, a, r) => Ge(t, e, n, a, r, !1)),
                (t.$createElement = (e, n, a, r) => Ge(t, e, n, a, r, !0));
              var i = a && a.data;
              Me(t, "$attrs", (i && i.attrs) || e, null, !0),
                Me(t, "$listeners", n._parentListeners || e, null, !0);
            })(this),
            Pt(this, "beforeCreate", void 0, !1),
            ((e) => {
              var t = _n(e.$options.inject, e);
              t &&
                (Ee(!1),
                Object.keys(t).forEach((n) => {
                  Me(e, n, t[n]);
                }),
                Ee(!0));
            })(this),
            mn(this),
            ((e) => {
              var t = e.$options.provide;
              if (t) {
                var n = s(t) ? t.call(e) : t;
                if (!u(n)) return;
                for (
                  var a = ((e) => {
                      var t = e._provided,
                        n = e.$parent && e.$parent._provided;
                      return n === t ? (e._provided = Object.create(n)) : t;
                    })(e),
                    r = ue ? Reflect.ownKeys(n) : Object.keys(n),
                    i = 0;
                  i < r.length;
                  i++
                ) {
                  var o = r[i];
                  Object.defineProperty(a, o, Object.getOwnPropertyDescriptor(n, o));
                }
              }
            })(this),
            Pt(this, "created"),
            this.$options.el && this.$mount(this.$options.el);
        };
      })(Gn),
        ((e) => {
          Object.defineProperty(e.prototype, "$data", {
            get: function () {
              return this._data;
            },
          }),
            Object.defineProperty(e.prototype, "$props", {
              get: function () {
                return this._props;
              },
            }),
            (e.prototype.$set = Oe),
            (e.prototype.$delete = Ae),
            (e.prototype.$watch = function (e, t, n) {
              if (l(t)) return Tn(this, e, t, n);
              (n = n || {}).user = !0;
              var r = new dn(this, e, t, n);
              if (n.immediate) {
                var i = 'callback for immediate watcher "'.concat(r.expression, '"');
                ge(), Kt(t, this, [r.value], this, i), Te();
              }
              return () => {
                r.teardown();
              };
            });
        })(Gn),
        ((e) => {
          var n = /^hook:/;
          (e.prototype.$on = function (e, a) {
            if (t(e)) for (var i = 0, o = e.length; i < o; i++) this.$on(e[i], a);
            else
              (this._events[e] || (this._events[e] = [])).push(a),
                n.test(e) && (this._hasHookEvent = !0);
            return this;
          }),
            (e.prototype.$once = function (e, t) {
              var n = this;
              function a() {
                n.$off(e, a), t.apply(n, arguments);
              }
              return (a.fn = t), n.$on(e, a), n;
            }),
            (e.prototype.$off = function (e, n) {
              if (!arguments.length) return (this._events = Object.create(null)), this;
              if (t(e)) {
                for (var r = 0, i = e.length; r < i; r++) this.$off(e[r], n);
                return this;
              }
              var o,
                s = this._events[e];
              if (!s) return this;
              if (!n) return (this._events[e] = null), this;
              for (var u = s.length; u--; )
                if ((o = s[u]) === n || o.fn === n) {
                  s.splice(u, 1);
                  break;
                }
              return this;
            }),
            (e.prototype.$emit = function (e) {
              var n = this._events[e];
              if (n) {
                n = n.length > 1 ? $(n) : n;
                for (
                  var a = $(arguments, 1),
                    r = 'event handler for "'.concat(e, '"'),
                    i = 0,
                    o = n.length;
                  i < o;
                  i++
                )
                  Kt(n[i], this, a, this, r);
              }
              return this;
            });
        })(Gn),
        ((e) => {
          (e.prototype._update = function (e, t) {
            var a = this.$el,
              r = this._vnode,
              i = $t(this);
            (this._vnode = e),
              (this.$el = r ? this.__patch__(r, e) : this.__patch__(this.$el, e, t, !1)),
              i(),
              a && (a.__vue__ = null),
              this.$el && (this.$el.__vue__ = this);
            for (var o = this; o && o.$vnode && o.$parent && o.$vnode === o.$parent._vnode; )
              (o.$parent.$el = o.$el), (o = o.$parent);
          }),
            (e.prototype.$forceUpdate = function () {
              this._watcher && this._watcher.update();
            }),
            (e.prototype.$destroy = function () {
              if (!this._isBeingDestroyed) {
                Pt(this, "beforeDestroy"), (this._isBeingDestroyed = !0);
                var t = this.$parent;
                !t || t._isBeingDestroyed || this.$options.abstract || g(t.$children, this),
                  this._scope.stop(),
                  this._data.__ob__ && this._data.__ob__.vmCount--,
                  (this._isDestroyed = !0),
                  this.__patch__(this._vnode, null),
                  Pt(this, "destroyed"),
                  this.$off(),
                  this.$el && (this.$el.__vue__ = null),
                  this.$vnode && (this.$vnode.parent = null);
              }
            });
        })(Gn),
        ((e) => {
          ut(e.prototype),
            (e.prototype.$nextTick = function (e) {
              return on(e, this);
            }),
            (e.prototype._render = function () {
              var n = this.$options,
                a = n.render,
                r = n._parentVnode;
              r &&
                this._isMounted &&
                ((this.$scopedSlots = dt(
                  this.$parent,
                  r.data.scopedSlots,
                  this.$slots,
                  this.$scopedSlots
                )),
                this._slotsProxy && ht(this._slotsProxy, this.$scopedSlots)),
                (this.$vnode = r);
              var i,
                o = ce,
                s = Tt;
              try {
                le(this), (Tt = this), (i = a.call(this._renderProxy, this.$createElement));
              } catch (t) {
                Gt(t, this, "render"), (i = this._vnode);
              } finally {
                (Tt = s), le(o);
              }
              return (
                t(i) && 1 === i.length && (i = i[0]),
                i instanceof pe || (i = de()),
                (i.parent = r),
                i
              );
            });
        })(Gn);
      var Zn = [String, RegExp, Array],
        Yn = {
          KeepAlive: {
            name: "keep-alive",
            abstract: !0,
            props: { include: Zn, exclude: Zn, max: [String, Number] },
            methods: {
              cacheVNode: function () {
                var t = this.cache,
                  n = this.keys,
                  a = this.vnodeToCache,
                  r = this.keyToCache;
                if (a) {
                  var i = a.tag,
                    o = a.componentInstance,
                    s = a.componentOptions;
                  (t[r] = { name: Kn(s), tag: i, componentInstance: o }),
                    n.push(r),
                    this.max && n.length > parseInt(this.max) && Xn(t, n[0], n, this._vnode),
                    (this.vnodeToCache = null);
                }
              },
            },
            created: function () {
              (this.cache = Object.create(null)), (this.keys = []);
            },
            destroyed: function () {
              for (var e in this.cache) Xn(this.cache, e, this.keys);
            },
            mounted: function () {
              this.cacheVNode(),
                this.$watch("include", (t) => {
                  Wn(this, (e) => Jn(t, e));
                }),
                this.$watch("exclude", (t) => {
                  Wn(this, (e) => !Jn(t, e));
                });
            },
            updated: function () {
              this.cacheVNode();
            },
            render: function () {
              var e = this.$slots.default,
                t = wt(e),
                n = t && t.componentOptions;
              if (n) {
                var a = Kn(n),
                  r = this.include,
                  i = this.exclude;
                if ((r && (!a || !Jn(r, a))) || (i && a && Jn(i, a))) return t;
                var o = this.cache,
                  s = this.keys,
                  u = null == t.key ? n.Ctor.cid + (n.tag ? "::".concat(n.tag) : "") : t.key;
                o[u]
                  ? ((t.componentInstance = o[u].componentInstance), g(s, u), s.push(u))
                  : ((this.vnodeToCache = t), (this.keyToCache = u)),
                  (t.data.keepAlive = !0);
              }
              return t || (e && e[0]);
            },
          },
        };
      !((e) => {
        var t = {
          get: () => U,
        };
        Object.defineProperty(e, "config", t),
          (e.util = { warn: An, extend: M, mergeOptions: Nn, defineReactive: Me }),
          (e.set = Oe),
          (e.delete = Ae),
          (e.nextTick = on),
          (e.observable = (e) => ($e(e), e)),
          (e.options = Object.create(null)),
          N.forEach((t) => {
            e.options[t + "s"] = Object.create(null);
          }),
          (e.options._base = e),
          M(e.options.components, Yn),
          ((e) => {
            e.use = function (e) {
              var t = this._installedPlugins || (this._installedPlugins = []);
              if (t.indexOf(e) > -1) return this;
              var n = $(arguments, 1);
              return (
                n.unshift(this),
                s(e.install) ? e.install.apply(e, n) : s(e) && e.apply(null, n),
                t.push(e),
                this
              );
            };
          })(e),
          ((e) => {
            e.mixin = function (e) {
              return (this.options = Nn(this.options, e)), this;
            };
          })(e),
          ((e) => {
            e.cid = 0;
            var t = 1;
            e.extend = function (e) {
              e = e || {};
              var a = this.cid,
                r = e._Ctor || (e._Ctor = {});
              if (r[a]) return r[a];
              var i = Sn(e) || Sn(this.options),
                o = function (e) {
                  this._init(e);
                };
              return (
                ((o.prototype = Object.create(this.prototype)).constructor = o),
                (o.cid = t++),
                (o.options = Nn(this.options, e)),
                (o.super = this),
                o.options.props &&
                  ((e) => {
                    var t = e.options.props;
                    for (var n in t) fn(e.prototype, "_props", n);
                  })(o),
                o.options.computed &&
                  ((e) => {
                    var t = e.options.computed;
                    for (var n in t) hn(e.prototype, n, t[n]);
                  })(o),
                (o.extend = this.extend),
                (o.mixin = this.mixin),
                (o.use = this.use),
                N.forEach((e) => {
                  o[e] = this[e];
                }),
                i && (o.options.components[i] = o),
                (o.superOptions = this.options),
                (o.extendOptions = e),
                (o.sealedOptions = M({}, o.options)),
                (r[a] = o),
                o
              );
            };
          })(e),
          ((e) => {
            N.forEach((t) => {
              e[t] = function (e, n) {
                return n
                  ? ("component" === t &&
                      l(n) &&
                      ((n.name = n.name || e), (n = this.options._base.extend(n))),
                    "directive" === t && s(n) && (n = { bind: n, update: n }),
                    (this.options[t + "s"][e] = n),
                    n)
                  : this.options[t + "s"][e];
              };
            });
          })(e);
      })(Gn),
        Object.defineProperty(Gn.prototype, "$isServer", { get: re }),
        Object.defineProperty(Gn.prototype, "$ssrContext", {
          get: function () {
            return this.$vnode && this.$vnode.ssrContext;
          },
        }),
        Object.defineProperty(Gn, "FunctionalRenderContext", { value: Cn }),
        (Gn.version = "2.7.16");
      var Qn = v("style,class"),
        ea = v("input,textarea,option,select,progress"),
        ta = (e, t, n) =>
          ("value" === n && ea(e) && "button" !== t) ||
          ("selected" === n && "option" === e) ||
          ("checked" === n && "input" === e) ||
          ("muted" === n && "video" === e),
        na = v("contenteditable,draggable,spellcheck"),
        aa = v("events,caret,typing,plaintext-only"),
        ra = v(
          "allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,truespeed,typemustmatch,visible"
        ),
        ia = "http://www.w3.org/1999/xlink",
        oa = (e) => ":" === e.charAt(5) && "xlink" === e.slice(0, 5),
        sa = (e) => (oa(e) ? e.slice(6, e.length) : ""),
        ua = (e) => null == e || !1 === e;
      function ca(e, t) {
        return {
          staticClass: la(e.staticClass, t.staticClass),
          class: r(e.class) ? [e.class, t.class] : t.class,
        };
      }
      function la(e, t) {
        return e ? (t ? e + " " + t : e) : t || "";
      }
      function pa(e) {
        return Array.isArray(e)
          ? ((e) => {
              for (var t, n = "", a = 0, i = e.length; a < i; a++)
                r((t = pa(e[a]))) && "" !== t && (n && (n += " "), (n += t));
              return n;
            })(e)
          : u(e)
            ? ((e) => {
                var t = "";
                for (var n in e) e[n] && (t && (t += " "), (t += n));
                return t;
              })(e)
            : "string" == typeof e
              ? e
              : "";
      }
      var da = { svg: "http://www.w3.org/2000/svg", math: "http://www.w3.org/1998/Math/MathML" },
        ya = v(
          "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot"
        ),
        fa = v(
          "svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view",
          !0
        ),
        ma = (e) => ya(e) || fa(e);
      function va(e) {
        return fa(e) ? "svg" : "math" === e ? "math" : void 0;
      }
      var ha = Object.create(null),
        ba = v("text,number,password,search,email,tel,url");
      function ga(e) {
        return "string" == typeof e
          ? document.querySelector(e) || document.createElement("div")
          : e;
      }
      var Ta = Object.freeze({
          __proto__: null,
          createElement: (e, t) => {
            var n = document.createElement(e);
            return (
              "select" !== e ||
                (t.data &&
                  t.data.attrs &&
                  void 0 !== t.data.attrs.multiple &&
                  n.setAttribute("multiple", "multiple")),
              n
            );
          },
          createElementNS: (e, t) => document.createElementNS(da[e], t),
          createTextNode: (e) => document.createTextNode(e),
          createComment: (e) => document.createComment(e),
          insertBefore: (e, t, n) => {
            e.insertBefore(t, n);
          },
          removeChild: (e, t) => {
            e.removeChild(t);
          },
          appendChild: (e, t) => {
            e.appendChild(t);
          },
          parentNode: (e) => e.parentNode,
          nextSibling: (e) => e.nextSibling,
          tagName: (e) => e.tagName,
          setTextContent: (e, t) => {
            e.textContent = t;
          },
          setStyleScope: (e, t) => {
            e.setAttribute(t, "");
          },
        }),
        _a = {
          create: (e, t) => {
            wa(t);
          },
          update: (e, t) => {
            e.data.ref !== t.data.ref && (wa(e, !0), wa(t));
          },
          destroy: (e) => {
            wa(e, !0);
          },
        };
      function wa(e, n) {
        var a = e.data.ref;
        if (r(a)) {
          var i = e.context,
            o = e.componentInstance || e.elm,
            u = n ? null : o,
            c = n ? void 0 : o;
          if (s(a)) Kt(a, i, [u], i, "template ref function");
          else {
            var l = e.data.refInFor,
              p = "string" == typeof a || "number" == typeof a,
              d = Ie(a),
              y = i.$refs;
            if (p || d)
              if (l) {
                var f = p ? y[a] : a.value;
                n
                  ? t(f) && g(f, o)
                  : t(f)
                    ? f.includes(o) || f.push(o)
                    : p
                      ? ((y[a] = [o]), xa(i, a, y[a]))
                      : (a.value = [o]);
              } else if (p) {
                if (n && y[a] !== o) return;
                (y[a] = c), xa(i, a, u);
              } else if (d) {
                if (n && a.value !== o) return;
                a.value = u;
              }
          }
        }
      }
      function xa(e, t, n) {
        var a = e._setupState;
        a && _(a, t) && (Ie(a[t]) ? (a[t].value = n) : (a[t] = n));
      }
      var Ca = new pe("", {}, []),
        ka = ["create", "activate", "update", "remove", "destroy"];
      function Ea(e, t) {
        return (
          e.key === t.key &&
          e.asyncFactory === t.asyncFactory &&
          ((e.tag === t.tag &&
            e.isComment === t.isComment &&
            r(e.data) === r(t.data) &&
            ((e, t) => {
              if ("input" !== e.tag) return !0;
              var n,
                a = r((n = e.data)) && r((n = n.attrs)) && n.type,
                i = r((n = t.data)) && r((n = n.attrs)) && n.type;
              return a === i || (ba(a) && ba(i));
            })(e, t)) ||
            (i(e.isAsyncPlaceholder) && a(t.asyncFactory.error)))
        );
      }
      function Sa(e, t, n) {
        var a,
          i,
          o = {};
        for (a = t; a <= n; ++a) r((i = e[a].key)) && (o[i] = a);
        return o;
      }
      var Ra = {
        create: $a,
        update: $a,
        destroy: (e) => {
          $a(e, Ca);
        },
      };
      function $a(e, t) {
        (e.data.directives || t.data.directives) &&
          ((e, t) => {
            var n,
              a,
              r,
              i = e === Ca,
              o = t === Ca,
              s = Oa(e.data.directives, e.context),
              u = Oa(t.data.directives, t.context),
              c = [],
              l = [];
            for (n in u)
              (a = s[n]),
                (r = u[n]),
                a
                  ? ((r.oldValue = a.value),
                    (r.oldArg = a.arg),
                    Pa(r, "update", t, e),
                    r.def && r.def.componentUpdated && l.push(r))
                  : (Pa(r, "bind", t, e), r.def && r.def.inserted && c.push(r));
            if (c.length) {
              var p = () => {
                for (var n = 0; n < c.length; n++) Pa(c[n], "inserted", t, e);
              };
              i ? Ue(t, "insert", p) : p();
            }
            if (
              (l.length &&
                Ue(t, "postpatch", () => {
                  for (var n = 0; n < l.length; n++) Pa(l[n], "componentUpdated", t, e);
                }),
              !i)
            )
              for (n in s) u[n] || Pa(s[n], "unbind", e, e, o);
          })(e, t);
      }
      var Ma = Object.create(null);
      function Oa(e, t) {
        var n,
          a,
          r = Object.create(null);
        if (!e) return r;
        for (n = 0; n < e.length; n++) {
          if (
            ((a = e[n]).modifiers || (a.modifiers = Ma),
            (r[Aa(a)] = a),
            t._setupState && t._setupState.__sfc)
          ) {
            var i = a.def || Fn(t, "_setupState", "v-" + a.name);
            a.def = "function" == typeof i ? { bind: i, update: i } : i;
          }
          a.def = a.def || Fn(t.$options, "directives", a.name);
        }
        return r;
      }
      function Aa(e) {
        return e.rawName || "".concat(e.name, ".").concat(Object.keys(e.modifiers || {}).join("."));
      }
      function Pa(e, t, n, a, r) {
        var i = e.def && e.def[t];
        if (i)
          try {
            i(n.elm, e, n, a, r);
          } catch (a) {
            Gt(a, n.context, "directive ".concat(e.name, " ").concat(t, " hook"));
          }
      }
      var La = [_a, Ra];
      function ja(e, t) {
        var n = t.componentOptions;
        if (
          !((r(n) && !1 === n.Ctor.options.inheritAttrs) || (a(e.data.attrs) && a(t.data.attrs)))
        ) {
          var o,
            s,
            u = t.elm,
            c = e.data.attrs || {},
            l = t.data.attrs || {};
          for (o in ((r(l.__ob__) || i(l._v_attr_proxy)) && (l = t.data.attrs = M({}, l)), l))
            (s = l[o]), c[o] !== s && Ia(u, o, s, t.data.pre);
          for (o in ((W || Z) && l.value !== c.value && Ia(u, "value", l.value), c))
            a(l[o]) && (oa(o) ? u.removeAttributeNS(ia, sa(o)) : na(o) || u.removeAttribute(o));
        }
      }
      function Ia(e, t, n, a) {
        a || e.tagName.indexOf("-") > -1
          ? Da(e, t, n)
          : ra(t)
            ? ua(n)
              ? e.removeAttribute(t)
              : ((n = "allowfullscreen" === t && "EMBED" === e.tagName ? "true" : t),
                e.setAttribute(t, n))
            : na(t)
              ? e.setAttribute(
                  t,
                  ((e, t) =>
                    ua(t) || "false" === t
                      ? "false"
                      : "contenteditable" === e && aa(t)
                        ? t
                        : "true")(t, n)
                )
              : oa(t)
                ? ua(n)
                  ? e.removeAttributeNS(ia, sa(t))
                  : e.setAttributeNS(ia, t, n)
                : Da(e, t, n);
      }
      function Da(e, t, n) {
        if (ua(n)) e.removeAttribute(t);
        else {
          if (W && !X && "TEXTAREA" === e.tagName && "placeholder" === t && "" !== n && !e.__ieph) {
            var a = (t) => {
              t.stopImmediatePropagation(), e.removeEventListener("input", a);
            };
            e.addEventListener("input", a), (e.__ieph = !0);
          }
          e.setAttribute(t, n);
        }
      }
      var Ba = { create: ja, update: ja };
      function Na(e, t) {
        var n = t.elm,
          i = t.data,
          o = e.data;
        if (!(a(i.staticClass) && a(i.class) && (a(o) || (a(o.staticClass) && a(o.class))))) {
          var s = ((e) => {
              for (var t = e.data, n = e, a = e; r(a.componentInstance); )
                (a = a.componentInstance._vnode) && a.data && (t = ca(a.data, t));
              for (; r((n = n.parent)); ) n && n.data && (t = ca(t, n.data));
              return (i = t.staticClass), (o = t.class), r(i) || r(o) ? la(i, pa(o)) : "";
              var i, o;
            })(t),
            u = n._transitionClasses;
          r(u) && (s = la(s, pa(u))),
            s !== n._prevClass && (n.setAttribute("class", s), (n._prevClass = s));
        }
      }
      var Fa,
        Ua,
        qa,
        Ha,
        Va,
        za,
        Ga = { create: Na, update: Na },
        Ka = /[\w).+\-_$\]]/;
      function Ja(e) {
        var t,
          n,
          a,
          r,
          i,
          o = !1,
          s = !1,
          u = !1,
          c = !1,
          l = 0,
          p = 0,
          d = 0,
          y = 0;
        for (a = 0; a < e.length; a++)
          if (((n = t), (t = e.charCodeAt(a)), o)) 39 === t && 92 !== n && (o = !1);
          else if (s) 34 === t && 92 !== n && (s = !1);
          else if (u) 96 === t && 92 !== n && (u = !1);
          else if (c) 47 === t && 92 !== n && (c = !1);
          else if (
            124 !== t ||
            124 === e.charCodeAt(a + 1) ||
            124 === e.charCodeAt(a - 1) ||
            l ||
            p ||
            d
          ) {
            switch (t) {
              case 34:
                s = !0;
                break;
              case 39:
                o = !0;
                break;
              case 96:
                u = !0;
                break;
              case 40:
                d++;
                break;
              case 41:
                d--;
                break;
              case 91:
                p++;
                break;
              case 93:
                p--;
                break;
              case 123:
                l++;
                break;
              case 125:
                l--;
            }
            if (47 === t) {
              for (var f = a - 1, m = void 0; f >= 0 && " " === (m = e.charAt(f)); f--);
              (m && Ka.test(m)) || (c = !0);
            }
          } else void 0 === r ? ((y = a + 1), (r = e.slice(0, a).trim())) : v();
        function v() {
          (i || (i = [])).push(e.slice(y, a).trim()), (y = a + 1);
        }
        if ((void 0 === r ? (r = e.slice(0, a).trim()) : 0 !== y && v(), i))
          for (a = 0; a < i.length; a++) r = Wa(r, i[a]);
        return r;
      }
      function Wa(e, t) {
        var n = t.indexOf("(");
        if (n < 0) return '_f("'.concat(t, '")(').concat(e, ")");
        var a = t.slice(0, n),
          r = t.slice(n + 1);
        return '_f("'
          .concat(a, '")(')
          .concat(e)
          .concat(")" !== r ? "," + r : r);
      }
      function Xa(e, t) {
        console.error("[Vue compiler]: ".concat(e));
      }
      function Za(e, t) {
        return e ? e.map((e) => e[t]).filter((e) => e) : [];
      }
      function Ya(e, t, n, a, r) {
        (e.props || (e.props = [])).push(sr({ name: t, value: n, dynamic: r }, a)), (e.plain = !1);
      }
      function Qa(e, t, n, a, r) {
        (r ? e.dynamicAttrs || (e.dynamicAttrs = []) : e.attrs || (e.attrs = [])).push(
          sr({ name: t, value: n, dynamic: r }, a)
        ),
          (e.plain = !1);
      }
      function er(e, t, n, a) {
        (e.attrsMap[t] = n), e.attrsList.push(sr({ name: t, value: n }, a));
      }
      function tr(e, t, n, a, r, i, o, s) {
        (e.directives || (e.directives = [])).push(
          sr({ name: t, rawName: n, value: a, arg: r, isDynamicArg: i, modifiers: o }, s)
        ),
          (e.plain = !1);
      }
      function nr(e, t, n) {
        return n ? "_p(".concat(t, ',"').concat(e, '")') : e + t;
      }
      function ar(t, n, a, r, i, o, s, u) {
        var c;
        (r = r || e).right
          ? u
            ? (n = "(".concat(n, ")==='click'?'contextmenu':(").concat(n, ")"))
            : "click" === n && ((n = "contextmenu"), delete r.right)
          : r.middle &&
            (u
              ? (n = "(".concat(n, ")==='click'?'mouseup':(").concat(n, ")"))
              : "click" === n && (n = "mouseup")),
          r.capture && (delete r.capture, (n = nr("!", n, u))),
          r.once && (delete r.once, (n = nr("~", n, u))),
          r.passive && (delete r.passive, (n = nr("&", n, u))),
          r.native
            ? (delete r.native, (c = t.nativeEvents || (t.nativeEvents = {})))
            : (c = t.events || (t.events = {}));
        var l = sr({ value: a.trim(), dynamic: u }, s);
        r !== e && (l.modifiers = r);
        var p = c[n];
        Array.isArray(p) ? (i ? p.unshift(l) : p.push(l)) : (c[n] = p ? (i ? [l, p] : [p, l]) : l),
          (t.plain = !1);
      }
      function rr(e, t, n) {
        var a = ir(e, ":" + t) || ir(e, "v-bind:" + t);
        if (null != a) return Ja(a);
        if (!1 !== n) {
          var r = ir(e, t);
          if (null != r) return JSON.stringify(r);
        }
      }
      function ir(e, t, n) {
        var a;
        if (null != (a = e.attrsMap[t]))
          for (var r = e.attrsList, i = 0, o = r.length; i < o; i++)
            if (r[i].name === t) {
              r.splice(i, 1);
              break;
            }
        return n && delete e.attrsMap[t], a;
      }
      function or(e, t) {
        for (var n = e.attrsList, a = 0, r = n.length; a < r; a++) {
          var i = n[a];
          if (t.test(i.name)) return n.splice(a, 1), i;
        }
      }
      function sr(e, t) {
        return t && (null != t.start && (e.start = t.start), null != t.end && (e.end = t.end)), e;
      }
      function ur(e, t, n) {
        var a = n || {},
          r = a.number,
          i = "$$v",
          o = i;
        a.trim &&
          (o =
            "(typeof ".concat(i, " === 'string'") +
            "? ".concat(i, ".trim()") +
            ": ".concat(i, ")")),
          r && (o = "_n(".concat(o, ")"));
        var s = cr(t, o);
        e.model = {
          value: "(".concat(t, ")"),
          expression: JSON.stringify(t),
          callback: "function (".concat(i, ") {").concat(s, "}"),
        };
      }
      function cr(e, t) {
        var n = ((e) => {
          if (((e = e.trim()), (Fa = e.length), e.indexOf("[") < 0 || e.lastIndexOf("]") < Fa - 1))
            return (Ha = e.lastIndexOf(".")) > -1
              ? { exp: e.slice(0, Ha), key: '"' + e.slice(Ha + 1) + '"' }
              : { exp: e, key: null };
          for (Ua = e, Ha = Va = za = 0; !pr(); ) dr((qa = lr())) ? fr(qa) : 91 === qa && yr(qa);
          return { exp: e.slice(0, Va), key: e.slice(Va + 1, za) };
        })(e);
        return null === n.key
          ? "".concat(e, "=").concat(t)
          : "$set(".concat(n.exp, ", ").concat(n.key, ", ").concat(t, ")");
      }
      function lr() {
        return Ua.charCodeAt(++Ha);
      }
      function pr() {
        return Ha >= Fa;
      }
      function dr(e) {
        return 34 === e || 39 === e;
      }
      function yr(e) {
        var t = 1;
        for (Va = Ha; !pr(); )
          if (dr((e = lr()))) fr(e);
          else if ((91 === e && t++, 93 === e && t--, 0 === t)) {
            za = Ha;
            break;
          }
      }
      function fr(e) {
        for (var t = e; !pr() && (e = lr()) !== t; );
      }
      var mr,
        vr = "__r",
        hr = "__c";
      function br(e, t, n) {
        var a = mr;
        return function r() {
          null !== t.apply(null, arguments) && _r(e, r, n, a);
        };
      }
      var gr = Zt && !(ee && Number(ee[1]) <= 53);
      function Tr(e, t, n, a) {
        if (gr) {
          var r = Ft,
            i = t;
          t = i._wrapper = function (e) {
            if (
              e.target === e.currentTarget ||
              e.timeStamp >= r ||
              e.timeStamp <= 0 ||
              e.target.ownerDocument !== document
            )
              return i.apply(this, arguments);
          };
        }
        mr.addEventListener(e, t, ne ? { capture: n, passive: a } : n);
      }
      function _r(e, t, n, a) {
        (a || mr).removeEventListener(e, t._wrapper || t, n);
      }
      function wr(e, t) {
        if (!a(e.data.on) || !a(t.data.on)) {
          var n = t.data.on || {},
            i = e.data.on || {};
          (mr = t.elm || e.elm),
            ((e) => {
              if (r(e[vr])) {
                var t = W ? "change" : "input";
                (e[t] = [].concat(e[vr], e[t] || [])), delete e[vr];
              }
              r(e[hr]) && ((e.change = [].concat(e[hr], e.change || [])), delete e[hr]);
            })(n),
            Fe(n, i, Tr, _r, br, t.context),
            (mr = void 0);
        }
      }
      var xr,
        Cr = {
          create: wr,
          update: wr,
          destroy: (e) => wr(e, Ca),
        };
      function kr(e, t) {
        if (!a(e.data.domProps) || !a(t.data.domProps)) {
          var n,
            o,
            s = t.elm,
            u = e.data.domProps || {},
            c = t.data.domProps || {};
          for (n in ((r(c.__ob__) || i(c._v_attr_proxy)) && (c = t.data.domProps = M({}, c)), u))
            n in c || (s[n] = "");
          for (n in c) {
            if (((o = c[n]), "textContent" === n || "innerHTML" === n)) {
              if ((t.children && (t.children.length = 0), o === u[n])) continue;
              1 === s.childNodes.length && s.removeChild(s.childNodes[0]);
            }
            if ("value" === n && "PROGRESS" !== s.tagName) {
              s._value = o;
              var l = a(o) ? "" : String(o);
              Er(s, l) && (s.value = l);
            } else if ("innerHTML" === n && fa(s.tagName) && a(s.innerHTML)) {
              (xr = xr || document.createElement("div")).innerHTML = "<svg>".concat(o, "</svg>");
              for (var p = xr.firstChild; s.firstChild; ) s.removeChild(s.firstChild);
              for (; p.firstChild; ) s.appendChild(p.firstChild);
            } else if (o !== u[n])
              try {
                s[n] = o;
              } catch (e) {}
          }
        }
      }
      function Er(e, t) {
        return (
          !e.composing &&
          ("OPTION" === e.tagName ||
            ((e, t) => {
              var n = !0;
              try {
                n = document.activeElement !== e;
              } catch (e) {}
              return n && e.value !== t;
            })(e, t) ||
            ((e, t) => {
              var n = e.value,
                a = e._vModifiers;
              if (r(a)) {
                if (a.number) return m(n) !== m(t);
                if (a.trim) return n.trim() !== t.trim();
              }
              return n !== t;
            })(e, t))
        );
      }
      var Sr = { create: kr, update: kr },
        Rr = w((e) => {
          var t = {},
            n = /:(.+)/;
          return (
            e.split(/;(?![^(]*\))/g).forEach((e) => {
              if (e) {
                var a = e.split(n);
                a.length > 1 && (t[a[0].trim()] = a[1].trim());
              }
            }),
            t
          );
        });
      function $r(e) {
        var t = Mr(e.style);
        return e.staticStyle ? M(e.staticStyle, t) : t;
      }
      function Mr(e) {
        return Array.isArray(e) ? O(e) : "string" == typeof e ? Rr(e) : e;
      }
      var Or,
        Ar = /^--/,
        Pr = /\s*!important$/,
        Lr = (e, t, n) => {
          if (Ar.test(t)) e.style.setProperty(t, n);
          else if (Pr.test(n)) e.style.setProperty(S(t), n.replace(Pr, ""), "important");
          else {
            var a = Ir(t);
            if (Array.isArray(n)) for (var r = 0, i = n.length; r < i; r++) e.style[a] = n[r];
            else e.style[a] = n;
          }
        },
        jr = ["Webkit", "Moz", "ms"],
        Ir = w((e) => {
          if (
            ((Or = Or || document.createElement("div").style), "filter" !== (e = C(e)) && e in Or)
          )
            return e;
          for (var t = e.charAt(0).toUpperCase() + e.slice(1), n = 0; n < jr.length; n++) {
            var a = jr[n] + t;
            if (a in Or) return a;
          }
        });
      function Dr(e, t) {
        var n = t.data,
          i = e.data;
        if (!(a(n.staticStyle) && a(n.style) && a(i.staticStyle) && a(i.style))) {
          var o,
            s,
            u = t.elm,
            c = i.staticStyle,
            l = i.normalizedStyle || i.style || {},
            p = c || l,
            d = Mr(t.data.style) || {};
          t.data.normalizedStyle = r(d.__ob__) ? M({}, d) : d;
          var y = ((e) => {
            for (var t, n = {}, a = e; a.componentInstance; )
              (a = a.componentInstance._vnode) && a.data && (t = $r(a.data)) && M(n, t);
            (t = $r(e.data)) && M(n, t);
            for (var r = e; (r = r.parent); ) r.data && (t = $r(r.data)) && M(n, t);
            return n;
          })(t);
          for (s in p) a(y[s]) && Lr(u, s, "");
          for (s in y) (o = y[s]), Lr(u, s, null == o ? "" : o);
        }
      }
      var Br = { create: Dr, update: Dr },
        Nr = /\s+/;
      function Fr(e, t) {
        if (t && (t = t.trim()))
          if (e.classList)
            t.indexOf(" ") > -1
              ? t.split(Nr).forEach((t) => e.classList.add(t))
              : e.classList.add(t);
          else {
            var n = " ".concat(e.getAttribute("class") || "", " ");
            n.indexOf(" " + t + " ") < 0 && e.setAttribute("class", (n + t).trim());
          }
      }
      function Ur(e, t) {
        if (t && (t = t.trim()))
          if (e.classList)
            t.indexOf(" ") > -1
              ? t.split(Nr).forEach((t) => e.classList.remove(t))
              : e.classList.remove(t),
              e.classList.length || e.removeAttribute("class");
          else {
            for (
              var n = " ".concat(e.getAttribute("class") || "", " "), a = " " + t + " ";
              n.indexOf(a) >= 0;
            )
              n = n.replace(a, " ");
            (n = n.trim()) ? e.setAttribute("class", n) : e.removeAttribute("class");
          }
      }
      function qr(e) {
        if (e) {
          if ("object" == typeof e) {
            var t = {};
            return !1 !== e.css && M(t, Hr(e.name || "v")), M(t, e), t;
          }
          return "string" == typeof e ? Hr(e) : void 0;
        }
      }
      var Hr = w((e) => ({
          enterClass: "".concat(e, "-enter"),
          enterToClass: "".concat(e, "-enter-to"),
          enterActiveClass: "".concat(e, "-enter-active"),
          leaveClass: "".concat(e, "-leave"),
          leaveToClass: "".concat(e, "-leave-to"),
          leaveActiveClass: "".concat(e, "-leave-active"),
        })),
        Vr = K && !X,
        zr = "transition",
        Gr = "animation",
        Kr = "transition",
        Jr = "transitionend",
        Wr = "animation",
        Xr = "animationend";
      Vr &&
        (void 0 === window.ontransitionend &&
          void 0 !== window.onwebkittransitionend &&
          ((Kr = "WebkitTransition"), (Jr = "webkitTransitionEnd")),
        void 0 === window.onanimationend &&
          void 0 !== window.onwebkitanimationend &&
          ((Wr = "WebkitAnimation"), (Xr = "webkitAnimationEnd")));
      var Zr = K
        ? window.requestAnimationFrame
          ? window.requestAnimationFrame.bind(window)
          : setTimeout
        : (e) => e();
      function Yr(e) {
        Zr(() => {
          Zr(e);
        });
      }
      function Qr(e, t) {
        var n = e._transitionClasses || (e._transitionClasses = []);
        n.indexOf(t) < 0 && (n.push(t), Fr(e, t));
      }
      function ei(e, t) {
        e._transitionClasses && g(e._transitionClasses, t), Ur(e, t);
      }
      function ti(e, t, n) {
        var a = ai(e, t),
          r = a.type,
          i = a.timeout,
          o = a.propCount;
        if (!r) return n();
        var s = r === zr ? Jr : Xr,
          u = 0,
          c = () => {
            e.removeEventListener(s, l), n();
          },
          l = (t) => {
            t.target === e && ++u >= o && c();
          };
        setTimeout(() => {
          u < o && c();
        }, i + 1),
          e.addEventListener(s, l);
      }
      var ni = /\b(transform|all)(,|$)/;
      function ai(e, t) {
        var n,
          a = window.getComputedStyle(e),
          r = (a[Kr + "Delay"] || "").split(", "),
          i = (a[Kr + "Duration"] || "").split(", "),
          o = ri(r, i),
          s = (a[Wr + "Delay"] || "").split(", "),
          u = (a[Wr + "Duration"] || "").split(", "),
          c = ri(s, u),
          l = 0,
          p = 0;
        return (
          t === zr
            ? o > 0 && ((n = zr), (l = o), (p = i.length))
            : t === Gr
              ? c > 0 && ((n = Gr), (l = c), (p = u.length))
              : (p = (n = (l = Math.max(o, c)) > 0 ? (o > c ? zr : Gr) : null)
                  ? n === zr
                    ? i.length
                    : u.length
                  : 0),
          {
            type: n,
            timeout: l,
            propCount: p,
            hasTransform: n === zr && ni.test(a[Kr + "Property"]),
          }
        );
      }
      function ri(e, t) {
        for (; e.length < t.length; ) e = e.concat(e);
        return Math.max.apply(
          null,
          t.map((t, n) => ii(t) + ii(e[n]))
        );
      }
      function ii(e) {
        return 1e3 * Number(e.slice(0, -1).replace(",", "."));
      }
      function oi(e, t) {
        var n = e.elm;
        r(n._leaveCb) && ((n._leaveCb.cancelled = !0), n._leaveCb());
        var i = qr(e.data.transition);
        if (!a(i) && !r(n._enterCb) && 1 === n.nodeType) {
          for (
            var o = i.css,
              c = i.type,
              l = i.enterClass,
              p = i.enterToClass,
              d = i.enterActiveClass,
              y = i.appearClass,
              f = i.appearToClass,
              v = i.appearActiveClass,
              h = i.beforeEnter,
              b = i.enter,
              g = i.afterEnter,
              T = i.enterCancelled,
              _ = i.beforeAppear,
              w = i.appear,
              x = i.afterAppear,
              C = i.appearCancelled,
              k = i.duration,
              E = Rt,
              S = Rt.$vnode;
            S && S.parent;
          )
            (E = S.context), (S = S.parent);
          var R = !E._isMounted || !e.isRootInsert;
          if (!R || w || "" === w) {
            var $ = R && y ? y : l,
              M = R && v ? v : d,
              O = R && f ? f : p,
              A = (R && _) || h,
              P = R && s(w) ? w : b,
              L = (R && x) || g,
              j = (R && C) || T,
              I = m(u(k) ? k.enter : k),
              B = !1 !== o && !X,
              N = ci(P),
              F = (n._enterCb = D(() => {
                B && (ei(n, O), ei(n, M)),
                  F.cancelled ? (B && ei(n, $), j && j(n)) : L && L(n),
                  (n._enterCb = null);
              }));
            e.data.show ||
              Ue(e, "insert", () => {
                var t = n.parentNode,
                  a = t && t._pending && t._pending[e.key];
                a && a.tag === e.tag && a.elm._leaveCb && a.elm._leaveCb(), P && P(n, F);
              }),
              A && A(n),
              B &&
                (Qr(n, $),
                Qr(n, M),
                Yr(() => {
                  ei(n, $),
                    F.cancelled || (Qr(n, O), N || (ui(I) ? setTimeout(F, I) : ti(n, c, F)));
                })),
              e.data.show && (t && t(), P && P(n, F)),
              B || N || F();
          }
        }
      }
      function si(e, t) {
        var n = e.elm;
        r(n._enterCb) && ((n._enterCb.cancelled = !0), n._enterCb());
        var i = qr(e.data.transition);
        if (a(i) || 1 !== n.nodeType) return t();
        if (!r(n._leaveCb)) {
          var o = i.css,
            s = i.type,
            c = i.leaveClass,
            l = i.leaveToClass,
            p = i.leaveActiveClass,
            d = i.beforeLeave,
            y = i.leave,
            f = i.afterLeave,
            v = i.leaveCancelled,
            h = i.delayLeave,
            b = i.duration,
            g = !1 !== o && !X,
            T = ci(y),
            _ = m(u(b) ? b.leave : b),
            w = (n._leaveCb = D(() => {
              n.parentNode && n.parentNode._pending && (n.parentNode._pending[e.key] = null),
                g && (ei(n, l), ei(n, p)),
                w.cancelled ? (g && ei(n, c), v && v(n)) : (t(), f && f(n)),
                (n._leaveCb = null);
            }));
          h ? h(x) : x();
        }
        function x() {
          w.cancelled ||
            (!e.data.show &&
              n.parentNode &&
              ((n.parentNode._pending || (n.parentNode._pending = {}))[e.key] = e),
            d && d(n),
            g &&
              (Qr(n, c),
              Qr(n, p),
              Yr(() => {
                ei(n, c), w.cancelled || (Qr(n, l), T || (ui(_) ? setTimeout(w, _) : ti(n, s, w)));
              })),
            y && y(n, w),
            g || T || w());
        }
      }
      function ui(e) {
        return "number" == typeof e && !isNaN(e);
      }
      function ci(e) {
        if (a(e)) return !1;
        var t = e.fns;
        return r(t) ? ci(Array.isArray(t) ? t[0] : t) : (e._length || e.length) > 1;
      }
      function li(e, t) {
        !0 !== t.data.show && oi(t);
      }
      var pi = ((e) => {
        var n,
          s,
          u = {},
          c = e.modules,
          l = e.nodeOps;
        for (n = 0; n < ka.length; ++n)
          for (u[ka[n]] = [], s = 0; s < c.length; ++s)
            r(c[s][ka[n]]) && u[ka[n]].push(c[s][ka[n]]);
        function p(e) {
          var t = l.parentNode(e);
          r(t) && l.removeChild(t, e);
        }
        function d(e, t, n, a, o, s, c) {
          if (
            (r(e.elm) && r(s) && (e = s[c] = fe(e)),
            (e.isRootInsert = !o),
            !((e, t, n, a) => {
              var o = e.data;
              if (r(o)) {
                var s = r(e.componentInstance) && o.keepAlive;
                if ((r((o = o.hook)) && r((o = o.init)) && o(e, !1), r(e.componentInstance)))
                  return (
                    y(e, t),
                    f(n, e.elm, a),
                    i(s) &&
                      ((e, t, n, a) => {
                        for (var i, o = e; o.componentInstance; )
                          if (
                            r((i = (o = o.componentInstance._vnode).data)) &&
                            r((i = i.transition))
                          ) {
                            for (i = 0; i < u.activate.length; ++i) u.activate[i](Ca, o);
                            t.push(o);
                            break;
                          }
                        f(n, e.elm, a);
                      })(e, t, n, a),
                    !0
                  );
              }
            })(e, t, n, a))
          ) {
            var p = e.data,
              d = e.children,
              v = e.tag;
            r(v)
              ? ((e.elm = e.ns ? l.createElementNS(e.ns, v) : l.createElement(v, e)),
                g(e),
                m(e, d, t),
                r(p) && b(e, t),
                f(n, e.elm, a))
              : i(e.isComment)
                ? ((e.elm = l.createComment(e.text)), f(n, e.elm, a))
                : ((e.elm = l.createTextNode(e.text)), f(n, e.elm, a));
          }
        }
        function y(e, t) {
          r(e.data.pendingInsert) &&
            (t.push.apply(t, e.data.pendingInsert), (e.data.pendingInsert = null)),
            (e.elm = e.componentInstance.$el),
            h(e) ? (b(e, t), g(e)) : (wa(e), t.push(e));
        }
        function f(e, t, n) {
          r(e) && (r(n) ? l.parentNode(n) === e && l.insertBefore(e, t, n) : l.appendChild(e, t));
        }
        function m(e, n, a) {
          if (t(n)) for (var r = 0; r < n.length; ++r) d(n[r], a, e.elm, null, !0, n, r);
          else o(e.text) && l.appendChild(e.elm, l.createTextNode(String(e.text)));
        }
        function h(e) {
          for (; e.componentInstance; ) e = e.componentInstance._vnode;
          return r(e.tag);
        }
        function b(e, t) {
          for (var a = 0; a < u.create.length; ++a) u.create[a](Ca, e);
          r((n = e.data.hook)) && (r(n.create) && n.create(Ca, e), r(n.insert) && t.push(e));
        }
        function g(e) {
          var t;
          if (r((t = e.fnScopeId))) l.setStyleScope(e.elm, t);
          else
            for (var n = e; n; )
              r((t = n.context)) && r((t = t.$options._scopeId)) && l.setStyleScope(e.elm, t),
                (n = n.parent);
          r((t = Rt)) &&
            t !== e.context &&
            t !== e.fnContext &&
            r((t = t.$options._scopeId)) &&
            l.setStyleScope(e.elm, t);
        }
        function T(e, t, n, a, r, i) {
          for (; a <= r; ++a) d(n[a], i, e, t, !1, n, a);
        }
        function _(e) {
          var t,
            n,
            a = e.data;
          if (r(a))
            for (r((t = a.hook)) && r((t = t.destroy)) && t(e), t = 0; t < u.destroy.length; ++t)
              u.destroy[t](e);
          if (r((t = e.children))) for (n = 0; n < e.children.length; ++n) _(e.children[n]);
        }
        function w(e, t, n) {
          for (; t <= n; ++t) {
            var a = e[t];
            r(a) && (r(a.tag) ? (x(a), _(a)) : p(a.elm));
          }
        }
        function x(e, t) {
          if (r(t) || r(e.data)) {
            var n,
              a = u.remove.length + 1;
            for (
              r(t)
                ? (t.listeners += a)
                : (t = ((e, t) => {
                    function n() {
                      0 === --n.listeners && p(e);
                    }
                    return (n.listeners = t), n;
                  })(e.elm, a)),
                r((n = e.componentInstance)) && r((n = n._vnode)) && r(n.data) && x(n, t),
                n = 0;
              n < u.remove.length;
              ++n
            )
              u.remove[n](e, t);
            r((n = e.data.hook)) && r((n = n.remove)) ? n(e, t) : t();
          } else p(e.elm);
        }
        function C(e, t, n, a) {
          for (var i = n; i < a; i++) {
            var o = t[i];
            if (r(o) && Ea(e, o)) return i;
          }
        }
        function k(e, t, n, o, s, c) {
          if (e !== t) {
            r(t.elm) && r(o) && (t = o[s] = fe(t));
            var p = (t.elm = e.elm);
            if (i(e.isAsyncPlaceholder))
              r(t.asyncFactory.resolved) ? R(e.elm, t, n) : (t.isAsyncPlaceholder = !0);
            else if (
              i(t.isStatic) &&
              i(e.isStatic) &&
              t.key === e.key &&
              (i(t.isCloned) || i(t.isOnce))
            )
              t.componentInstance = e.componentInstance;
            else {
              var y,
                f = t.data;
              r(f) && r((y = f.hook)) && r((y = y.prepatch)) && y(e, t);
              var m = e.children,
                v = t.children;
              if (r(f) && h(t)) {
                for (y = 0; y < u.update.length; ++y) u.update[y](e, t);
                r((y = f.hook)) && r((y = y.update)) && y(e, t);
              }
              a(t.text)
                ? r(m) && r(v)
                  ? m !== v &&
                    ((e, t, n, i, o) => {
                      for (
                        var s,
                          u,
                          c,
                          p = 0,
                          y = 0,
                          f = t.length - 1,
                          m = t[0],
                          v = t[f],
                          h = n.length - 1,
                          b = n[0],
                          g = n[h],
                          _ = !o;
                        p <= f && y <= h;
                      )
                        a(m)
                          ? (m = t[++p])
                          : a(v)
                            ? (v = t[--f])
                            : Ea(m, b)
                              ? (k(m, b, i, n, y), (m = t[++p]), (b = n[++y]))
                              : Ea(v, g)
                                ? (k(v, g, i, n, h), (v = t[--f]), (g = n[--h]))
                                : Ea(m, g)
                                  ? (k(m, g, i, n, h),
                                    _ && l.insertBefore(e, m.elm, l.nextSibling(v.elm)),
                                    (m = t[++p]),
                                    (g = n[--h]))
                                  : Ea(v, b)
                                    ? (k(v, b, i, n, y),
                                      _ && l.insertBefore(e, v.elm, m.elm),
                                      (v = t[--f]),
                                      (b = n[++y]))
                                    : (a(s) && (s = Sa(t, p, f)),
                                      a((u = r(b.key) ? s[b.key] : C(b, t, p, f)))
                                        ? d(b, i, e, m.elm, !1, n, y)
                                        : Ea((c = t[u]), b)
                                          ? (k(c, b, i, n, y),
                                            (t[u] = void 0),
                                            _ && l.insertBefore(e, c.elm, m.elm))
                                          : d(b, i, e, m.elm, !1, n, y),
                                      (b = n[++y]));
                      p > f
                        ? T(e, a(n[h + 1]) ? null : n[h + 1].elm, n, y, h, i)
                        : y > h && w(t, p, f);
                    })(p, m, v, n, c)
                  : r(v)
                    ? (r(e.text) && l.setTextContent(p, ""), T(p, null, v, 0, v.length - 1, n))
                    : r(m)
                      ? w(m, 0, m.length - 1)
                      : r(e.text) && l.setTextContent(p, "")
                : e.text !== t.text && l.setTextContent(p, t.text),
                r(f) && r((y = f.hook)) && r((y = y.postpatch)) && y(e, t);
            }
          }
        }
        function E(e, t, n) {
          if (i(n) && r(e.parent)) e.parent.data.pendingInsert = t;
          else for (var a = 0; a < t.length; ++a) t[a].data.hook.insert(t[a]);
        }
        var S = v("attrs,class,staticClass,staticStyle,key");
        function R(e, t, n, a) {
          var o,
            s = t.tag,
            u = t.data,
            c = t.children;
          if (((a = a || (u && u.pre)), (t.elm = e), i(t.isComment) && r(t.asyncFactory)))
            return (t.isAsyncPlaceholder = !0), !0;
          if (
            r(u) &&
            (r((o = u.hook)) && r((o = o.init)) && o(t, !0), r((o = t.componentInstance)))
          )
            return y(t, n), !0;
          if (r(s)) {
            if (r(c))
              if (e.hasChildNodes())
                if (r((o = u)) && r((o = o.domProps)) && r((o = o.innerHTML))) {
                  if (o !== e.innerHTML) return !1;
                } else {
                  for (var l = !0, p = e.firstChild, d = 0; d < c.length; d++) {
                    if (!p || !R(p, c[d], n, a)) {
                      l = !1;
                      break;
                    }
                    p = p.nextSibling;
                  }
                  if (!l || p) return !1;
                }
              else m(t, c, n);
            if (r(u)) {
              var f = !1;
              for (var v in u)
                if (!S(v)) {
                  (f = !0), b(t, n);
                  break;
                }
              !f && u.class && cn(u.class);
            }
          } else e.data !== t.text && (e.data = t.text);
          return !0;
        }
        return (e, t, n, o) => {
          if (!a(t)) {
            var s,
              c = !1,
              p = [];
            if (a(e)) (c = !0), d(t, p);
            else {
              var y = r(e.nodeType);
              if (!y && Ea(e, t)) k(e, t, p, null, null, o);
              else {
                if (y) {
                  if (
                    (1 === e.nodeType && e.hasAttribute(B) && (e.removeAttribute(B), (n = !0)),
                    i(n) && R(e, t, p))
                  )
                    return E(t, p, !0), e;
                  (s = e), (e = new pe(l.tagName(s).toLowerCase(), {}, [], void 0, s));
                }
                var f = e.elm,
                  m = l.parentNode(f);
                if ((d(t, p, f._leaveCb ? null : m, l.nextSibling(f)), r(t.parent)))
                  for (var v = t.parent, b = h(t); v; ) {
                    for (var g = 0; g < u.destroy.length; ++g) u.destroy[g](v);
                    if (((v.elm = t.elm), b)) {
                      for (var T = 0; T < u.create.length; ++T) u.create[T](Ca, v);
                      var x = v.data.hook.insert;
                      if (x.merged) for (var C = x.fns.slice(1), S = 0; S < C.length; S++) C[S]();
                    } else wa(v);
                    v = v.parent;
                  }
                r(m) ? w([e], 0, 0) : r(e.tag) && _(e);
              }
            }
            return E(t, p, c), t.elm;
          }
          r(e) && _(e);
        };
      })({
        nodeOps: Ta,
        modules: [
          Ba,
          Ga,
          Cr,
          Sr,
          Br,
          K
            ? {
                create: li,
                activate: li,
                remove: (e, t) => {
                  !0 !== e.data.show ? si(e, t) : t();
                },
              }
            : {},
        ].concat(La),
      });
      X &&
        document.addEventListener("selectionchange", () => {
          var e = document.activeElement;
          e && e.vmodel && gi(e, "input");
        });
      var di = {
        inserted: (e, t, n, a) => {
          "select" === n.tag
            ? (a.elm && !a.elm._vOptions
                ? Ue(n, "postpatch", () => {
                    di.componentUpdated(e, t, n);
                  })
                : yi(e, t, n.context),
              (e._vOptions = [].map.call(e.options, vi)))
            : ("textarea" === n.tag || ba(e.type)) &&
              ((e._vModifiers = t.modifiers),
              t.modifiers.lazy ||
                (e.addEventListener("compositionstart", hi),
                e.addEventListener("compositionend", bi),
                e.addEventListener("change", bi),
                X && (e.vmodel = !0)));
        },
        componentUpdated: (e, t, n) => {
          if ("select" === n.tag) {
            yi(e, t, n.context);
            var a = e._vOptions,
              r = (e._vOptions = [].map.call(e.options, vi));
            r.some((e, t) => !j(e, a[t])) &&
              (e.multiple
                ? t.value.some((e) => mi(e, r))
                : t.value !== t.oldValue && mi(t.value, r)) &&
              gi(e, "change");
          }
        },
      };
      function yi(e, t, n) {
        fi(e, t),
          (W || Z) &&
            setTimeout(() => {
              fi(e, t);
            }, 0);
      }
      function fi(e, t, n) {
        var a = t.value,
          r = e.multiple;
        if (!r || Array.isArray(a)) {
          for (var i, o, s = 0, u = e.options.length; s < u; s++)
            if (((o = e.options[s]), r))
              (i = I(a, vi(o)) > -1), o.selected !== i && (o.selected = i);
            else if (j(vi(o), a)) return void (e.selectedIndex !== s && (e.selectedIndex = s));
          r || (e.selectedIndex = -1);
        }
      }
      function mi(e, t) {
        return t.every((t) => !j(t, e));
      }
      function vi(e) {
        return "_value" in e ? e._value : e.value;
      }
      function hi(e) {
        e.target.composing = !0;
      }
      function bi(e) {
        e.target.composing && ((e.target.composing = !1), gi(e.target, "input"));
      }
      function gi(e, t) {
        var n = document.createEvent("HTMLEvents");
        n.initEvent(t, !0, !0), e.dispatchEvent(n);
      }
      function Ti(e) {
        return !e.componentInstance || (e.data && e.data.transition)
          ? e
          : Ti(e.componentInstance._vnode);
      }
      var _i = {
          model: di,
          show: {
            bind: (e, t, n) => {
              var a = t.value,
                r = (n = Ti(n)).data && n.data.transition,
                i = (e.__vOriginalDisplay = "none" === e.style.display ? "" : e.style.display);
              a && r
                ? ((n.data.show = !0),
                  oi(n, () => {
                    e.style.display = i;
                  }))
                : (e.style.display = a ? i : "none");
            },
            update: (e, t, n) => {
              var a = t.value;
              !a != !t.oldValue &&
                ((n = Ti(n)).data && n.data.transition
                  ? ((n.data.show = !0),
                    a
                      ? oi(n, () => {
                          e.style.display = e.__vOriginalDisplay;
                        })
                      : si(n, () => {
                          e.style.display = "none";
                        }))
                  : (e.style.display = a ? e.__vOriginalDisplay : "none"));
            },
            unbind: (e, t, n, a, r) => {
              r || (e.style.display = e.__vOriginalDisplay);
            },
          },
        },
        wi = {
          name: String,
          appear: Boolean,
          css: Boolean,
          mode: String,
          type: String,
          enterClass: String,
          leaveClass: String,
          enterToClass: String,
          leaveToClass: String,
          enterActiveClass: String,
          leaveActiveClass: String,
          appearClass: String,
          appearActiveClass: String,
          appearToClass: String,
          duration: [Number, String, Object],
        };
      function xi(e) {
        var t = e && e.componentOptions;
        return t && t.Ctor.options.abstract ? xi(wt(t.children)) : e;
      }
      function Ci(e) {
        var t = {},
          n = e.$options;
        for (var a in n.propsData) t[a] = e[a];
        var r = n._parentListeners;
        for (var a in r) t[C(a)] = r[a];
        return t;
      }
      function ki(e, t) {
        if (/\d-keep-alive$/.test(t.tag))
          return e("keep-alive", { props: t.componentOptions.propsData });
      }
      var Ei = (e) => e.tag || pt(e),
        Si = (e) => "show" === e.name,
        Ri = {
          name: "transition",
          props: wi,
          abstract: !0,
          render: function (e) {
            var n = this.$slots.default;
            if (n && (n = n.filter(Ei)).length) {
              var a = this.mode,
                r = n[0];
              if (
                ((e) => {
                  for (; (e = e.parent); ) if (e.data.transition) return !0;
                })(this.$vnode)
              )
                return r;
              var i = xi(r);
              if (!i) return r;
              if (this._leaving) return ki(e, r);
              var s = "__transition-".concat(this._uid, "-");
              i.key =
                null == i.key
                  ? i.isComment
                    ? s + "comment"
                    : s + i.tag
                  : o(i.key)
                    ? 0 === String(i.key).indexOf(s)
                      ? i.key
                      : s + i.key
                    : i.key;
              var u = ((i.data || (i.data = {})).transition = Ci(this)),
                c = this._vnode,
                l = xi(c);
              if (
                (i.data.directives && i.data.directives.some(Si) && (i.data.show = !0),
                l &&
                  l.data &&
                  !((e, t) => t.key === e.key && t.tag === e.tag)(i, l) &&
                  !pt(l) &&
                  (!l.componentInstance || !l.componentInstance._vnode.isComment))
              ) {
                var p = (l.data.transition = M({}, u));
                if ("out-in" === a)
                  return (
                    (this._leaving = !0),
                    Ue(p, "afterLeave", () => {
                      (this._leaving = !1), this.$forceUpdate();
                    }),
                    ki(e, r)
                  );
                if ("in-out" === a) {
                  if (pt(i)) return c;
                  var d,
                    y = () => {
                      d();
                    };
                  Ue(u, "afterEnter", y),
                    Ue(u, "enterCancelled", y),
                    Ue(p, "delayLeave", (e) => {
                      d = e;
                    });
                }
              }
              return r;
            }
          },
        },
        $i = M({ tag: String, moveClass: String }, wi);
      delete $i.mode;
      var Mi = {
        props: $i,
        beforeMount: function () {
          var t = this._update;
          this._update = (n, a) => {
            var r = $t(this);
            this.__patch__(this._vnode, this.kept, !1, !0),
              (this._vnode = this.kept),
              r(),
              t.call(this, n, a);
          };
        },
        render: function (e) {
          for (
            var t = this.tag || this.$vnode.data.tag || "span",
              n = Object.create(null),
              a = (this.prevChildren = this.children),
              r = this.$slots.default || [],
              i = (this.children = []),
              o = Ci(this),
              s = 0;
            s < r.length;
            s++
          )
            (l = r[s]).tag &&
              null != l.key &&
              0 !== String(l.key).indexOf("__vlist") &&
              (i.push(l), (n[l.key] = l), ((l.data || (l.data = {})).transition = o));
          if (a) {
            var u = [],
              c = [];
            for (s = 0; s < a.length; s++) {
              var l;
              ((l = a[s]).data.transition = o),
                (l.data.pos = l.elm.getBoundingClientRect()),
                n[l.key] ? u.push(l) : c.push(l);
            }
            (this.kept = e(t, null, u)), (this.removed = c);
          }
          return e(t, null, i);
        },
        updated: function () {
          var e = this.prevChildren,
            t = this.moveClass || (this.name || "v") + "-move";
          e.length &&
            this.hasMove(e[0].elm, t) &&
            (e.forEach(Oi),
            e.forEach(Ai),
            e.forEach(Pi),
            (this._reflow = document.body.offsetHeight),
            e.forEach((e) => {
              if (e.data.moved) {
                var n = e.elm,
                  a = n.style;
                Qr(n, t),
                  (a.transform = a.WebkitTransform = a.transitionDuration = ""),
                  n.addEventListener(
                    Jr,
                    (n._moveCb = function e(a) {
                      (a && a.target !== n) ||
                        (a && !/transform$/.test(a.propertyName)) ||
                        (n.removeEventListener(Jr, e), (n._moveCb = null), ei(n, t));
                    })
                  );
              }
            }));
        },
        methods: {
          hasMove: function (e, t) {
            if (!Vr) return !1;
            if (this._hasMove) return this._hasMove;
            var n = e.cloneNode();
            e._transitionClasses &&
              e._transitionClasses.forEach((e) => {
                Ur(n, e);
              }),
              Fr(n, t),
              (n.style.display = "none"),
              this.$el.appendChild(n);
            var a = ai(n);
            return this.$el.removeChild(n), (this._hasMove = a.hasTransform);
          },
        },
      };
      function Oi(e) {
        e.elm._moveCb && e.elm._moveCb(), e.elm._enterCb && e.elm._enterCb();
      }
      function Ai(e) {
        e.data.newPos = e.elm.getBoundingClientRect();
      }
      function Pi(e) {
        var t = e.data.pos,
          n = e.data.newPos,
          a = t.left - n.left,
          r = t.top - n.top;
        if (a || r) {
          e.data.moved = !0;
          var i = e.elm.style;
          (i.transform = i.WebkitTransform = "translate(".concat(a, "px,").concat(r, "px)")),
            (i.transitionDuration = "0s");
        }
      }
      var Li = { Transition: Ri, TransitionGroup: Mi };
      (Gn.config.mustUseProp = ta),
        (Gn.config.isReservedTag = ma),
        (Gn.config.isReservedAttr = Qn),
        (Gn.config.getTagNamespace = va),
        (Gn.config.isUnknownElement = (e) => {
          if (!K) return !0;
          if (ma(e)) return !1;
          if (((e = e.toLowerCase()), null != ha[e])) return ha[e];
          var t = document.createElement(e);
          return e.indexOf("-") > -1
            ? (ha[e] =
                t.constructor === window.HTMLUnknownElement || t.constructor === window.HTMLElement)
            : (ha[e] = /HTMLUnknownElement/.test(t.toString()));
        }),
        M(Gn.options.directives, _i),
        M(Gn.options.components, Li),
        (Gn.prototype.__patch__ = K ? pi : A),
        (Gn.prototype.$mount = function (e, t) {
          return ((e, t, n) => {
            var a;
            (e.$el = t),
              e.$options.render || (e.$options.render = de),
              Pt(e, "beforeMount"),
              (a = () => {
                e._update(e._render(), n);
              }),
              new dn(
                e,
                a,
                A,
                {
                  before: () => {
                    e._isMounted && !e._isDestroyed && Pt(e, "beforeUpdate");
                  },
                },
                !0
              ),
              (n = !1);
            var r = e._preWatchers;
            if (r) for (var i = 0; i < r.length; i++) r[i].run();
            return null == e.$vnode && ((e._isMounted = !0), Pt(e, "mounted")), e;
          })(this, (e = e && K ? ga(e) : void 0), t);
        }),
        K &&
          setTimeout(() => {
            U.devtools && ie && ie.emit("init", Gn);
          }, 0);
      var ji,
        Ii = /\{\{((?:.|\r?\n)+?)\}\}/g,
        Di = /[-.*+?^${}()|[\]/\\]/g,
        Bi = w((e) => {
          var t = e[0].replace(Di, "\\$&"),
            n = e[1].replace(Di, "\\$&");
          return new RegExp(t + "((?:.|\\n)+?)" + n, "g");
        }),
        Ni = {
          staticKeys: ["staticClass"],
          transformNode: (e, t) => {
            t.warn;
            var n = ir(e, "class");
            n && (e.staticClass = JSON.stringify(n.replace(/\s+/g, " ").trim()));
            var a = rr(e, "class", !1);
            a && (e.classBinding = a);
          },
          genData: (e) => {
            var t = "";
            return (
              e.staticClass && (t += "staticClass:".concat(e.staticClass, ",")),
              e.classBinding && (t += "class:".concat(e.classBinding, ",")),
              t
            );
          },
        },
        Fi = {
          staticKeys: ["staticStyle"],
          transformNode: (e, t) => {
            t.warn;
            var n = ir(e, "style");
            n && (e.staticStyle = JSON.stringify(Rr(n)));
            var a = rr(e, "style", !1);
            a && (e.styleBinding = a);
          },
          genData: (e) => {
            var t = "";
            return (
              e.staticStyle && (t += "staticStyle:".concat(e.staticStyle, ",")),
              e.styleBinding && (t += "style:(".concat(e.styleBinding, "),")),
              t
            );
          },
        },
        Ui = v(
          "area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr"
        ),
        qi = v("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source"),
        Hi = v(
          "address,article,aside,base,blockquote,body,caption,col,colgroup,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,title,tr,track"
        ),
        Vi = /^\s*([^\s"'<>/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
        zi =
          /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
        Gi = "[a-zA-Z_][\\-\\.0-9_a-zA-Z".concat(q.source, "]*"),
        Ki = "((?:".concat(Gi, "\\:)?").concat(Gi, ")"),
        Ji = new RegExp("^<".concat(Ki)),
        Wi = /^\s*(\/?)>/,
        Xi = new RegExp("^<\\/".concat(Ki, "[^>]*>")),
        Zi = /^<!DOCTYPE [^>]+>/i,
        Yi = /^<!--/,
        Qi = /^<!\[/,
        eo = v("script,style,textarea", !0),
        to = {},
        no = {
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&amp;": "&",
          "&#10;": "\n",
          "&#9;": "\t",
          "&#39;": "'",
        },
        ao = /&(?:lt|gt|quot|amp|#39);/g,
        ro = /&(?:lt|gt|quot|amp|#39|#10|#9);/g,
        io = v("pre,textarea", !0),
        oo = (e, t) => e && io(e) && "\n" === t[0];
      function so(e, t) {
        var n = t ? ro : ao;
        return e.replace(n, (e) => no[e]);
      }
      var uo,
        co,
        lo,
        po,
        yo,
        fo,
        mo,
        vo,
        ho = /^@|^v-on:/,
        bo = /^v-|^@|^:|^#/,
        go = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
        To = /,([^,}\]]*)(?:,([^,}\]]*))?$/,
        _o = /^\(|\)$/g,
        wo = /^\[.*\]$/,
        xo = /:(.*)$/,
        Co = /^:|^\.|^v-bind:/,
        ko = /\.[^.\]]+(?=[^\]]*$)/g,
        Eo = /^v-slot(:|$)|^#/,
        So = /[\r\n]/,
        Ro = /[ \f\t\r\n]+/g,
        $o = w((e) => (((ji = ji || document.createElement("div")).innerHTML = e), ji.textContent)),
        Mo = "_empty_";
      function Oo(e, t, n) {
        return {
          type: 1,
          tag: e,
          attrsList: t,
          attrsMap: Bo(t),
          rawAttrsMap: {},
          parent: n,
          children: [],
        };
      }
      function Ao(e, t) {
        (uo = t.warn || Xa),
          (fo = t.isPreTag || P),
          (mo = t.mustUseProp || P),
          (vo = t.getTagNamespace || P);
        t.isReservedTag;
        (lo = Za(t.modules, "transformNode")),
          (po = Za(t.modules, "preTransformNode")),
          (yo = Za(t.modules, "postTransformNode")),
          (co = t.delimiters);
        var n,
          a,
          r = [],
          i = !1 !== t.preserveWhitespace,
          o = t.whitespace,
          s = !1,
          u = !1;
        function c(e) {
          if (
            (l(e),
            s || e.processed || (e = Po(e, t)),
            r.length ||
              e === n ||
              (n.if && (e.elseif || e.else) && jo(n, { exp: e.elseif, block: e })),
            a && !e.forbidden)
          )
            if (e.elseif || e.else)
              (o = e),
                (c = ((e) => {
                  for (var t = e.length; t--; ) {
                    if (1 === e[t].type) return e[t];
                    e.pop();
                  }
                })(a.children)),
                c && c.if && jo(c, { exp: o.elseif, block: o });
            else {
              if (e.slotScope) {
                var i = e.slotTarget || '"default"';
                (a.scopedSlots || (a.scopedSlots = {}))[i] = e;
              }
              a.children.push(e), (e.parent = a);
            }
          var o, c;
          (e.children = e.children.filter((e) => !e.slotScope)),
            l(e),
            e.pre && (s = !1),
            fo(e.tag) && (u = !1);
          for (var p = 0; p < yo.length; p++) yo[p](e, t);
        }
        function l(e) {
          if (!u)
            for (
              var t = void 0;
              (t = e.children[e.children.length - 1]) && 3 === t.type && " " === t.text;
            )
              e.children.pop();
        }
        return (
          ((e, t) => {
            for (
              var n,
                a,
                r = [],
                i = t.expectHTML,
                o = t.isUnaryTag || P,
                s = t.canBeLeftOpenTag || P,
                u = 0,
                c = () => {
                  if (((n = e), a && eo(a))) {
                    var c = 0,
                      d = a.toLowerCase(),
                      y = to[d] || (to[d] = new RegExp("([\\s\\S]*?)(</" + d + "[^>]*>)", "i"));
                    (w = e.replace(
                      y,
                      (e, n, a) => (
                        (c = a.length),
                        eo(d) ||
                          "noscript" === d ||
                          (n = n
                            .replace(/<!--([\s\S]*?)-->/g, "$1")
                            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, "$1")),
                        oo(d, n) && (n = n.slice(1)),
                        t.chars && t.chars(n),
                        ""
                      )
                    )),
                      (u += e.length - w.length),
                      (e = w),
                      p(d, u - c, u);
                  } else {
                    var f = e.indexOf("<");
                    if (0 === f) {
                      if (Yi.test(e)) {
                        var m = e.indexOf("--\x3e");
                        if (m >= 0)
                          return (
                            t.shouldKeepComment &&
                              t.comment &&
                              t.comment(e.substring(4, m), u, u + m + 3),
                            l(m + 3),
                            "continue"
                          );
                      }
                      if (Qi.test(e)) {
                        var v = e.indexOf("]>");
                        if (v >= 0) return l(v + 2), "continue";
                      }
                      var h = e.match(Zi);
                      if (h) return l(h[0].length), "continue";
                      var b = e.match(Xi);
                      if (b) {
                        var g = u;
                        return l(b[0].length), p(b[1], g, u), "continue";
                      }
                      var T = (() => {
                        var t = e.match(Ji);
                        if (t) {
                          var n = { tagName: t[1], attrs: [], start: u };
                          l(t[0].length);
                          for (
                            var a = void 0, r = void 0;
                            !(a = e.match(Wi)) && (r = e.match(zi) || e.match(Vi));
                          )
                            (r.start = u), l(r[0].length), (r.end = u), n.attrs.push(r);
                          if (a) return (n.unarySlash = a[1]), l(a[0].length), (n.end = u), n;
                        }
                      })();
                      if (T)
                        return (
                          ((e) => {
                            var n = e.tagName,
                              u = e.unarySlash;
                            i && ("p" === a && Hi(n) && p(a), s(n) && a === n && p(n));
                            for (
                              var c = o(n) || !!u, l = e.attrs.length, d = new Array(l), y = 0;
                              y < l;
                              y++
                            ) {
                              var f = e.attrs[y],
                                m = f[3] || f[4] || f[5] || "",
                                v =
                                  "a" === n && "href" === f[1]
                                    ? t.shouldDecodeNewlinesForHref
                                    : t.shouldDecodeNewlines;
                              d[y] = { name: f[1], value: so(m, v) };
                            }
                            c ||
                              (r.push({
                                tag: n,
                                lowerCasedTag: n.toLowerCase(),
                                attrs: d,
                                start: e.start,
                                end: e.end,
                              }),
                              (a = n)),
                              t.start && t.start(n, d, c, e.start, e.end);
                          })(T),
                          oo(T.tagName, e) && l(1),
                          "continue"
                        );
                    }
                    var _ = void 0,
                      w = void 0,
                      x = void 0;
                    if (f >= 0) {
                      for (
                        w = e.slice(f);
                        !(
                          Xi.test(w) ||
                          Ji.test(w) ||
                          Yi.test(w) ||
                          Qi.test(w) ||
                          (x = w.indexOf("<", 1)) < 0
                        );
                      )
                        (f += x), (w = e.slice(f));
                      _ = e.substring(0, f);
                    }
                    f < 0 && (_ = e), _ && l(_.length), t.chars && _ && t.chars(_, u - _.length, u);
                  }
                  if (e === n) return t.chars && t.chars(e), "break";
                };
              e && "break" !== c();
            );
            function l(t) {
              (u += t), (e = e.substring(t));
            }
            function p(e, n, i) {
              var o, s;
              if ((null == n && (n = u), null == i && (i = u), e))
                for (
                  s = e.toLowerCase(), o = r.length - 1;
                  o >= 0 && r[o].lowerCasedTag !== s;
                  o--
                );
              else o = 0;
              if (o >= 0) {
                for (var c = r.length - 1; c >= o; c--) t.end && t.end(r[c].tag, n, i);
                (r.length = o), (a = o && r[o - 1].tag);
              } else
                "br" === s
                  ? t.start && t.start(e, [], !0, n, i)
                  : "p" === s && (t.start && t.start(e, [], !1, n, i), t.end && t.end(e, n, i));
            }
            p();
          })(e, {
            warn: uo,
            expectHTML: t.expectHTML,
            isUnaryTag: t.isUnaryTag,
            canBeLeftOpenTag: t.canBeLeftOpenTag,
            shouldDecodeNewlines: t.shouldDecodeNewlines,
            shouldDecodeNewlinesForHref: t.shouldDecodeNewlinesForHref,
            shouldKeepComment: t.comments,
            outputSourceRange: t.outputSourceRange,
            start: (e, i, o, l, p) => {
              var d = (a && a.ns) || vo(e);
              W &&
                "svg" === d &&
                (i = ((e) => {
                  for (var t = [], n = 0; n < e.length; n++) {
                    var a = e[n];
                    No.test(a.name) || ((a.name = a.name.replace(Fo, "")), t.push(a));
                  }
                  return t;
                })(i));
              var y,
                f = Oo(e, i, a);
              d && (f.ns = d),
                ("style" !== (y = f).tag &&
                  ("script" !== y.tag ||
                    (y.attrsMap.type && "text/javascript" !== y.attrsMap.type))) ||
                  re() ||
                  (f.forbidden = !0);
              for (var m = 0; m < po.length; m++) f = po[m](f, t) || f;
              s ||
                (((e) => {
                  null != ir(e, "v-pre") && (e.pre = !0);
                })(f),
                f.pre && (s = !0)),
                fo(f.tag) && (u = !0),
                s
                  ? ((e) => {
                      var t = e.attrsList,
                        n = t.length;
                      if (n)
                        for (var a = (e.attrs = new Array(n)), r = 0; r < n; r++)
                          (a[r] = { name: t[r].name, value: JSON.stringify(t[r].value) }),
                            null != t[r].start &&
                              ((a[r].start = t[r].start), (a[r].end = t[r].end));
                      else e.pre || (e.plain = !0);
                    })(f)
                  : f.processed ||
                    (Lo(f),
                    ((e) => {
                      var t = ir(e, "v-if");
                      if (t) (e.if = t), jo(e, { exp: t, block: e });
                      else {
                        null != ir(e, "v-else") && (e.else = !0);
                        var n = ir(e, "v-else-if");
                        n && (e.elseif = n);
                      }
                    })(f),
                    ((e) => {
                      null != ir(e, "v-once") && (e.once = !0);
                    })(f)),
                n || (n = f),
                o ? c(f) : ((a = f), r.push(f));
            },
            end: (e, t, n) => {
              var i = r[r.length - 1];
              (r.length -= 1), (a = r[r.length - 1]), c(i);
            },
            chars: (e, t, n) => {
              if (a && (!W || "textarea" !== a.tag || a.attrsMap.placeholder !== e)) {
                var r,
                  c = a.children;
                if (
                  (e =
                    u || e.trim()
                      ? "script" === (r = a).tag || "style" === r.tag
                        ? e
                        : $o(e)
                      : c.length
                        ? o
                          ? "condense" === o && So.test(e)
                            ? ""
                            : " "
                          : i
                            ? " "
                            : ""
                        : "")
                ) {
                  u || "condense" !== o || (e = e.replace(Ro, " "));
                  var l = void 0,
                    p = void 0;
                  !s &&
                  " " !== e &&
                  (l = ((e, t) => {
                    var n = t ? Bi(t) : Ii;
                    if (n.test(e)) {
                      for (var a, r, i, o = [], s = [], u = (n.lastIndex = 0); (a = n.exec(e)); ) {
                        (r = a.index) > u &&
                          (s.push((i = e.slice(u, r))), o.push(JSON.stringify(i)));
                        var c = Ja(a[1].trim());
                        o.push("_s(".concat(c, ")")),
                          s.push({ "@binding": c }),
                          (u = r + a[0].length);
                      }
                      return (
                        u < e.length && (s.push((i = e.slice(u))), o.push(JSON.stringify(i))),
                        { expression: o.join("+"), tokens: s }
                      );
                    }
                  })(e, co))
                    ? (p = { type: 2, expression: l.expression, tokens: l.tokens, text: e })
                    : (" " === e && c.length && " " === c[c.length - 1].text) ||
                      (p = { type: 3, text: e }),
                    p && c.push(p);
                }
              }
            },
            comment: (e, t, n) => {
              if (a) {
                var r = { type: 3, text: e, isComment: !0 };
                a.children.push(r);
              }
            },
          }),
          n
        );
      }
      function Po(e, t) {
        var n;
        !((e) => {
          var t = rr(e, "key");
          t && (e.key = t);
        })(e),
          (e.plain = !e.key && !e.scopedSlots && !e.attrsList.length),
          ((e) => {
            var t = rr(e, "ref");
            t &&
              ((e.ref = t),
              (e.refInFor = ((e) => {
                for (var t = e; t; ) {
                  if (void 0 !== t.for) return !0;
                  t = t.parent;
                }
                return !1;
              })(e)));
          })(e),
          ((e) => {
            var t;
            "template" === e.tag
              ? ((t = ir(e, "scope")), (e.slotScope = t || ir(e, "slot-scope")))
              : (t = ir(e, "slot-scope")) && (e.slotScope = t);
            var n,
              a = rr(e, "slot");
            if (
              (a &&
                ((e.slotTarget = '""' === a ? '"default"' : a),
                (e.slotTargetDynamic = !(!e.attrsMap[":slot"] && !e.attrsMap["v-bind:slot"])),
                "template" === e.tag ||
                  e.slotScope ||
                  Qa(
                    e,
                    "slot",
                    a,
                    ((e, t) =>
                      e.rawAttrsMap[":" + t] || e.rawAttrsMap["v-bind:" + t] || e.rawAttrsMap[t])(
                      e,
                      "slot"
                    )
                  )),
              "template" === e.tag)
            ) {
              if ((n = or(e, Eo))) {
                var r = Io(n),
                  i = r.name,
                  o = r.dynamic;
                (e.slotTarget = i), (e.slotTargetDynamic = o), (e.slotScope = n.value || Mo);
              }
            } else if ((n = or(e, Eo))) {
              var s = e.scopedSlots || (e.scopedSlots = {}),
                u = Io(n),
                c = u.name,
                l = ((o = u.dynamic), (s[c] = Oo("template", [], e)));
              (l.slotTarget = c),
                (l.slotTargetDynamic = o),
                (l.children = e.children.filter((e) => {
                  if (!e.slotScope) return (e.parent = l), !0;
                })),
                (l.slotScope = n.value || Mo),
                (e.children = []),
                (e.plain = !1);
            }
          })(e),
          "slot" === (n = e).tag && (n.slotName = rr(n, "name")),
          ((e) => {
            var t;
            (t = rr(e, "is")) && (e.component = t),
              null != ir(e, "inline-template") && (e.inlineTemplate = !0);
          })(e);
        for (var a = 0; a < lo.length; a++) e = lo[a](e, t) || e;
        return (
          ((e) => {
            var t,
              n,
              a,
              r,
              i,
              o,
              s,
              u,
              c = e.attrsList;
            for (t = 0, n = c.length; t < n; t++)
              if (((a = r = c[t].name), (i = c[t].value), bo.test(a)))
                if (
                  ((e.hasBindings = !0),
                  (o = Do(a.replace(bo, ""))) && (a = a.replace(ko, "")),
                  Co.test(a))
                )
                  (a = a.replace(Co, "")),
                    (i = Ja(i)),
                    (u = wo.test(a)) && (a = a.slice(1, -1)),
                    o &&
                      (o.prop && !u && "innerHtml" === (a = C(a)) && (a = "innerHTML"),
                      o.camel && !u && (a = C(a)),
                      o.sync &&
                        ((s = cr(i, "$event")),
                        u
                          ? ar(e, '"update:"+('.concat(a, ")"), s, null, !1, 0, c[t], !0)
                          : (ar(e, "update:".concat(C(a)), s, null, !1, 0, c[t]),
                            S(a) !== C(a) && ar(e, "update:".concat(S(a)), s, null, !1, 0, c[t])))),
                    (o && o.prop) || (!e.component && mo(e.tag, e.attrsMap.type, a))
                      ? Ya(e, a, i, c[t], u)
                      : Qa(e, a, i, c[t], u);
                else if (ho.test(a))
                  (a = a.replace(ho, "")),
                    (u = wo.test(a)) && (a = a.slice(1, -1)),
                    ar(e, a, i, o, !1, 0, c[t], u);
                else {
                  var l = (a = a.replace(bo, "")).match(xo),
                    p = l && l[1];
                  (u = !1),
                    p &&
                      ((a = a.slice(0, -(p.length + 1))),
                      wo.test(p) && ((p = p.slice(1, -1)), (u = !0))),
                    tr(e, a, r, i, p, u, o, c[t]);
                }
              else
                Qa(e, a, JSON.stringify(i), c[t]),
                  !e.component &&
                    "muted" === a &&
                    mo(e.tag, e.attrsMap.type, a) &&
                    Ya(e, a, "true", c[t]);
          })(e),
          e
        );
      }
      function Lo(e) {
        var t;
        if ((t = ir(e, "v-for"))) {
          var n = ((e) => {
            var t = e.match(go);
            if (t) {
              var n = {};
              n.for = t[2].trim();
              var a = t[1].trim().replace(_o, ""),
                r = a.match(To);
              return (
                r
                  ? ((n.alias = a.replace(To, "").trim()),
                    (n.iterator1 = r[1].trim()),
                    r[2] && (n.iterator2 = r[2].trim()))
                  : (n.alias = a),
                n
              );
            }
          })(t);
          n && M(e, n);
        }
      }
      function jo(e, t) {
        e.ifConditions || (e.ifConditions = []), e.ifConditions.push(t);
      }
      function Io(e) {
        var t = e.name.replace(Eo, "");
        return (
          t || ("#" !== e.name[0] && (t = "default")),
          wo.test(t)
            ? { name: t.slice(1, -1), dynamic: !0 }
            : { name: '"'.concat(t, '"'), dynamic: !1 }
        );
      }
      function Do(e) {
        var t = e.match(ko);
        if (t) {
          var n = {};
          return (
            t.forEach((e) => {
              n[e.slice(1)] = !0;
            }),
            n
          );
        }
      }
      function Bo(e) {
        for (var t = {}, n = 0, a = e.length; n < a; n++) t[e[n].name] = e[n].value;
        return t;
      }
      var No = /^xmlns:NS\d+/,
        Fo = /^NS\d+:/;
      function Uo(e) {
        return Oo(e.tag, e.attrsList.slice(), e.parent);
      }
      var qo,
        Ho,
        Vo = [
          Ni,
          Fi,
          {
            preTransformNode: (e, t) => {
              if ("input" === e.tag) {
                var n = e.attrsMap;
                if (!n["v-model"]) return;
                var a = void 0;
                if (
                  ((n[":type"] || n["v-bind:type"]) && (a = rr(e, "type")),
                  n.type || a || !n["v-bind"] || (a = "(".concat(n["v-bind"], ").type")),
                  a)
                ) {
                  var r = ir(e, "v-if", !0),
                    i = r ? "&&(".concat(r, ")") : "",
                    o = null != ir(e, "v-else", !0),
                    s = ir(e, "v-else-if", !0),
                    u = Uo(e);
                  Lo(u),
                    er(u, "type", "checkbox"),
                    Po(u, t),
                    (u.processed = !0),
                    (u.if = "(".concat(a, ")==='checkbox'") + i),
                    jo(u, { exp: u.if, block: u });
                  var c = Uo(e);
                  ir(c, "v-for", !0),
                    er(c, "type", "radio"),
                    Po(c, t),
                    jo(u, { exp: "(".concat(a, ")==='radio'") + i, block: c });
                  var l = Uo(e);
                  return (
                    ir(l, "v-for", !0),
                    er(l, ":type", a),
                    Po(l, t),
                    jo(u, { exp: r, block: l }),
                    o ? (u.else = !0) : s && (u.elseif = s),
                    u
                  );
                }
              }
            },
          },
        ],
        zo = {
          expectHTML: !0,
          modules: Vo,
          directives: {
            model: (e, t, n) => {
              var a = t.value,
                r = t.modifiers,
                i = e.tag,
                o = e.attrsMap.type;
              if (e.component) return ur(e, a, r), !1;
              if ("select" === i)
                !((e, t, n) => {
                  var a = n && n.number,
                    r =
                      'Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;' +
                      "return ".concat(a ? "_n(val)" : "val", "})"),
                    i = "var $$selectedVal = ".concat(r, ";");
                  ar(
                    e,
                    "change",
                    (i = ""
                      .concat(i, " ")
                      .concat(cr(t, "$event.target.multiple ? $$selectedVal : $$selectedVal[0]"))),
                    null,
                    !0
                  );
                })(e, a, r);
              else if ("input" === i && "checkbox" === o)
                !((e, t, n) => {
                  var a = n && n.number,
                    r = rr(e, "value") || "null",
                    i = rr(e, "true-value") || "true",
                    o = rr(e, "false-value") || "false";
                  Ya(
                    e,
                    "checked",
                    "Array.isArray(".concat(t, ")") +
                      "?_i(".concat(t, ",").concat(r, ")>-1") +
                      ("true" === i ? ":(".concat(t, ")") : ":_q(".concat(t, ",").concat(i, ")"))
                  ),
                    ar(
                      e,
                      "change",
                      "var $$a=".concat(t, ",") +
                        "$$el=$event.target," +
                        "$$c=$$el.checked?(".concat(i, "):(").concat(o, ");") +
                        "if(Array.isArray($$a)){" +
                        "var $$v=".concat(a ? "_n(" + r + ")" : r, ",") +
                        "$$i=_i($$a,$$v);" +
                        "if($$el.checked){$$i<0&&(".concat(cr(t, "$$a.concat([$$v])"), ")}") +
                        "else{$$i>-1&&(".concat(
                          cr(t, "$$a.slice(0,$$i).concat($$a.slice($$i+1))"),
                          ")}"
                        ) +
                        "}else{".concat(cr(t, "$$c"), "}"),
                      null,
                      !0
                    );
                })(e, a, r);
              else if ("input" === i && "radio" === o)
                !((e, t, n) => {
                  var a = n && n.number,
                    r = rr(e, "value") || "null";
                  (r = a ? "_n(".concat(r, ")") : r),
                    Ya(e, "checked", "_q(".concat(t, ",").concat(r, ")")),
                    ar(e, "change", cr(t, r), null, !0);
                })(e, a, r);
              else if ("input" === i || "textarea" === i)
                !((e, t, n) => {
                  var a = e.attrsMap.type,
                    r = n || {},
                    i = r.lazy,
                    o = r.number,
                    s = r.trim,
                    u = !i && "range" !== a,
                    c = i ? "change" : "range" === a ? vr : "input",
                    l = "$event.target.value";
                  s && (l = "$event.target.value.trim()"), o && (l = "_n(".concat(l, ")"));
                  var p = cr(t, l);
                  u && (p = "if($event.target.composing)return;".concat(p)),
                    Ya(e, "value", "(".concat(t, ")")),
                    ar(e, c, p, null, !0),
                    (s || o) && ar(e, "blur", "$forceUpdate()");
                })(e, a, r);
              else if (!U.isReservedTag(i)) return ur(e, a, r), !1;
              return !0;
            },
            text: (e, t) => {
              t.value && Ya(e, "textContent", "_s(".concat(t.value, ")"), t);
            },
            html: (e, t) => {
              t.value && Ya(e, "innerHTML", "_s(".concat(t.value, ")"), t);
            },
          },
          isPreTag: (e) => "pre" === e,
          isUnaryTag: Ui,
          mustUseProp: ta,
          canBeLeftOpenTag: qi,
          isReservedTag: ma,
          getTagNamespace: va,
          staticKeys: ((e) => e.reduce((e, t) => e.concat(t.staticKeys || []), []).join(","))(Vo),
        },
        Go = w((e) =>
          v(
            "type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap" +
              (e ? "," + e : "")
          )
        );
      function Ko(e, t) {
        e && ((qo = Go(t.staticKeys || "")), (Ho = t.isReservedTag || P), Jo(e), Wo(e, !1));
      }
      function Jo(e) {
        if (
          ((e.static = ((e) =>
            2 !== e.type &&
            (3 === e.type ||
              !(
                !e.pre &&
                (e.hasBindings ||
                  e.if ||
                  e.for ||
                  h(e.tag) ||
                  !Ho(e.tag) ||
                  ((e) => {
                    for (; e.parent; ) {
                      if ("template" !== (e = e.parent).tag) return !1;
                      if (e.for) return !0;
                    }
                    return !1;
                  })(e) ||
                  !Object.keys(e).every(qo))
              )))(e)),
          1 === e.type)
        ) {
          if (!Ho(e.tag) && "slot" !== e.tag && null == e.attrsMap["inline-template"]) return;
          for (var t = 0, n = e.children.length; t < n; t++) {
            var a = e.children[t];
            Jo(a), a.static || (e.static = !1);
          }
          if (e.ifConditions)
            for (t = 1, n = e.ifConditions.length; t < n; t++) {
              var r = e.ifConditions[t].block;
              Jo(r), r.static || (e.static = !1);
            }
        }
      }
      function Wo(e, t) {
        if (1 === e.type) {
          if (
            ((e.static || e.once) && (e.staticInFor = t),
            e.static && e.children.length && (1 !== e.children.length || 3 !== e.children[0].type))
          )
            return void (e.staticRoot = !0);
          if (((e.staticRoot = !1), e.children))
            for (var n = 0, a = e.children.length; n < a; n++) Wo(e.children[n], t || !!e.for);
          if (e.ifConditions)
            for (n = 1, a = e.ifConditions.length; n < a; n++) Wo(e.ifConditions[n].block, t);
        }
      }
      var Xo = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/,
        Zo = /\([^)]*?\);*$/,
        Yo =
          /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/,
        Qo = {
          esc: 27,
          tab: 9,
          enter: 13,
          space: 32,
          up: 38,
          left: 37,
          right: 39,
          down: 40,
          delete: [8, 46],
        },
        es = {
          esc: ["Esc", "Escape"],
          tab: "Tab",
          enter: "Enter",
          space: [" ", "Spacebar"],
          up: ["Up", "ArrowUp"],
          left: ["Left", "ArrowLeft"],
          right: ["Right", "ArrowRight"],
          down: ["Down", "ArrowDown"],
          delete: ["Backspace", "Delete", "Del"],
        },
        ts = (e) => "if(".concat(e, ")return null;"),
        ns = {
          stop: "$event.stopPropagation();",
          prevent: "$event.preventDefault();",
          self: ts("$event.target !== $event.currentTarget"),
          ctrl: ts("!$event.ctrlKey"),
          shift: ts("!$event.shiftKey"),
          alt: ts("!$event.altKey"),
          meta: ts("!$event.metaKey"),
          left: ts("'button' in $event && $event.button !== 0"),
          middle: ts("'button' in $event && $event.button !== 1"),
          right: ts("'button' in $event && $event.button !== 2"),
        };
      function as(e, t) {
        var n = t ? "nativeOn:" : "on:",
          a = "",
          r = "";
        for (var i in e) {
          var o = rs(e[i]);
          e[i] && e[i].dynamic
            ? (r += "".concat(i, ",").concat(o, ","))
            : (a += '"'.concat(i, '":').concat(o, ","));
        }
        return (
          (a = "{".concat(a.slice(0, -1), "}")),
          r ? n + "_d(".concat(a, ",[").concat(r.slice(0, -1), "])") : n + a
        );
      }
      function rs(e) {
        if (!e) return "function(){}";
        if (Array.isArray(e)) return "[".concat(e.map((e) => rs(e)).join(","), "]");
        var t = Yo.test(e.value),
          n = Xo.test(e.value),
          a = Yo.test(e.value.replace(Zo, ""));
        if (e.modifiers) {
          var r = "",
            i = "",
            o = [],
            s = (t) => {
              if (ns[t]) (i += ns[t]), Qo[t] && o.push(t);
              else if ("exact" === t) {
                var n = e.modifiers;
                i += ts(
                  ["ctrl", "shift", "alt", "meta"]
                    .filter((e) => !n[e])
                    .map((e) => "$event.".concat(e, "Key"))
                    .join("||")
                );
              } else o.push(t);
            };
          for (var u in e.modifiers) s(u);
          o.length &&
            (r += ((e) =>
              "if(!$event.type.indexOf('key')&&" +
              "".concat(e.map(is).join("&&"), ")return null;"))(o)),
            i && (r += i);
          var c = t
            ? "return ".concat(e.value, ".apply(null, arguments)")
            : n
              ? "return (".concat(e.value, ").apply(null, arguments)")
              : a
                ? "return ".concat(e.value)
                : e.value;
          return "function($event){".concat(r).concat(c, "}");
        }
        return t || n
          ? e.value
          : "function($event){".concat(a ? "return ".concat(e.value) : e.value, "}");
      }
      function is(e) {
        var t = parseInt(e, 10);
        if (t) return "$event.keyCode!==".concat(t);
        var n = Qo[e],
          a = es[e];
        return (
          "_k($event.keyCode," +
          "".concat(JSON.stringify(e), ",") +
          "".concat(JSON.stringify(n), ",") +
          "$event.key," +
          "".concat(JSON.stringify(a)) +
          ")"
        );
      }
      var os = {
          on: (e, t) => {
            e.wrapListeners = (e) => "_g(".concat(e, ",").concat(t.value, ")");
          },
          bind: (e, t) => {
            e.wrapData = (n) =>
              "_b("
                .concat(n, ",'")
                .concat(e.tag, "',")
                .concat(t.value, ",")
                .concat(t.modifiers && t.modifiers.prop ? "true" : "false")
                .concat(t.modifiers && t.modifiers.sync ? ",true" : "", ")");
          },
          cloak: A,
        },
        ss = function (e) {
          (this.options = e),
            (this.warn = e.warn || Xa),
            (this.transforms = Za(e.modules, "transformCode")),
            (this.dataGenFns = Za(e.modules, "genData")),
            (this.directives = M(M({}, os), e.directives));
          var t = e.isReservedTag || P;
          (this.maybeComponent = (e) => !!e.component || !t(e.tag)),
            (this.onceId = 0),
            (this.staticRenderFns = []),
            (this.pre = !1);
        };
      function us(e, t) {
        var n = new ss(t),
          a = e ? ("script" === e.tag ? "null" : cs(e, n)) : '_c("div")';
        return { render: "with(this){return ".concat(a, "}"), staticRenderFns: n.staticRenderFns };
      }
      function cs(e, t) {
        if ((e.parent && (e.pre = e.pre || e.parent.pre), e.staticRoot && !e.staticProcessed))
          return ls(e, t);
        if (e.once && !e.onceProcessed) return ps(e, t);
        if (e.for && !e.forProcessed) return fs(e, t);
        if (e.if && !e.ifProcessed) return ds(e, t);
        if ("template" !== e.tag || e.slotTarget || t.pre) {
          if ("slot" === e.tag)
            return ((e, t) => {
              var n = e.slotName || '"default"',
                a = bs(e, t),
                r = "_t(".concat(n).concat(a ? ",function(){return ".concat(a, "}") : ""),
                i =
                  e.attrs || e.dynamicAttrs
                    ? _s(
                        (e.attrs || [])
                          .concat(e.dynamicAttrs || [])
                          .map((e) => ({ name: C(e.name), value: e.value, dynamic: e.dynamic }))
                      )
                    : null,
                o = e.attrsMap["v-bind"];
              return (
                (!i && !o) || a || (r += ",null"),
                i && (r += ",".concat(i)),
                o && (r += "".concat(i ? "" : ",null", ",").concat(o)),
                r + ")"
              );
            })(e, t);
          var n = void 0;
          if (e.component)
            n = ((e, t, n) => {
              var a = t.inlineTemplate ? null : bs(t, n, !0);
              return "_c("
                .concat(e, ",")
                .concat(ms(t, n))
                .concat(a ? ",".concat(a) : "", ")");
            })(e.component, e, t);
          else {
            var a = void 0,
              r = t.maybeComponent(e);
            (!e.plain || (e.pre && r)) && (a = ms(e, t));
            var i = void 0,
              o = t.options.bindings;
            r &&
              o &&
              !1 !== o.__isScriptSetup &&
              (i = ((e, t) => {
                var n = C(t),
                  a = k(n),
                  r = (r) => (e[t] === r ? t : e[n] === r ? n : e[a] === r ? a : void 0),
                  i = r("setup-const") || r("setup-reactive-const");
                if (i) return i;
                var o = r("setup-let") || r("setup-ref") || r("setup-maybe-ref");
                return o || void 0;
              })(o, e.tag)),
              i || (i = "'".concat(e.tag, "'"));
            var s = e.inlineTemplate ? null : bs(e, t, !0);
            n = "_c("
              .concat(i)
              .concat(a ? ",".concat(a) : "")
              .concat(s ? ",".concat(s) : "", ")");
          }
          for (var u = 0; u < t.transforms.length; u++) n = t.transforms[u](e, n);
          return n;
        }
        return bs(e, t) || "void 0";
      }
      function ls(e, t) {
        e.staticProcessed = !0;
        var n = t.pre;
        return (
          e.pre && (t.pre = e.pre),
          t.staticRenderFns.push("with(this){return ".concat(cs(e, t), "}")),
          (t.pre = n),
          "_m(".concat(t.staticRenderFns.length - 1).concat(e.staticInFor ? ",true" : "", ")")
        );
      }
      function ps(e, t) {
        if (((e.onceProcessed = !0), e.if && !e.ifProcessed)) return ds(e, t);
        if (e.staticInFor) {
          for (var n = "", a = e.parent; a; ) {
            if (a.for) {
              n = a.key;
              break;
            }
            a = a.parent;
          }
          return n
            ? "_o("
                .concat(cs(e, t), ",")
                .concat(t.onceId++, ",")
                .concat(n, ")")
            : cs(e, t);
        }
        return ls(e, t);
      }
      function ds(e, t, n, a) {
        return (e.ifProcessed = !0), ys(e.ifConditions.slice(), t, n, a);
      }
      function ys(e, t, n, a) {
        if (!e.length) return a || "_e()";
        var r = e.shift();
        return r.exp
          ? "("
              .concat(r.exp, ")?")
              .concat(i(r.block), ":")
              .concat(ys(e, t, n, a))
          : "".concat(i(r.block));
        function i(e) {
          return n ? n(e, t) : e.once ? ps(e, t) : cs(e, t);
        }
      }
      function fs(e, t, n, a) {
        var r = e.for,
          i = e.alias,
          o = e.iterator1 ? ",".concat(e.iterator1) : "",
          s = e.iterator2 ? ",".concat(e.iterator2) : "";
        return (
          (e.forProcessed = !0),
          "".concat(a || "_l", "((").concat(r, "),") +
            "function(".concat(i).concat(o).concat(s, "){") +
            "return ".concat((n || cs)(e, t)) +
            "})"
        );
      }
      function ms(e, t) {
        var n = "{",
          a = ((e, t) => {
            var n = e.directives;
            if (n) {
              var a,
                r,
                i,
                o,
                s = "directives:[",
                u = !1;
              for (a = 0, r = n.length; a < r; a++) {
                (i = n[a]), (o = !0);
                var c = t.directives[i.name];
                c && (o = !!c(e, i, t.warn)),
                  o &&
                    ((u = !0),
                    (s += '{name:"'
                      .concat(i.name, '",rawName:"')
                      .concat(i.rawName, '"')
                      .concat(
                        i.value
                          ? ",value:("
                              .concat(i.value, "),expression:")
                              .concat(JSON.stringify(i.value))
                          : ""
                      )
                      .concat(
                        i.arg ? ",arg:".concat(i.isDynamicArg ? i.arg : '"'.concat(i.arg, '"')) : ""
                      )
                      .concat(
                        i.modifiers ? ",modifiers:".concat(JSON.stringify(i.modifiers)) : "",
                        "},"
                      )));
              }
              return u ? s.slice(0, -1) + "]" : void 0;
            }
          })(e, t);
        a && (n += a + ","),
          e.key && (n += "key:".concat(e.key, ",")),
          e.ref && (n += "ref:".concat(e.ref, ",")),
          e.refInFor && (n += "refInFor:true,"),
          e.pre && (n += "pre:true,"),
          e.component && (n += 'tag:"'.concat(e.tag, '",'));
        for (var r = 0; r < t.dataGenFns.length; r++) n += t.dataGenFns[r](e);
        if (
          (e.attrs && (n += "attrs:".concat(_s(e.attrs), ",")),
          e.props && (n += "domProps:".concat(_s(e.props), ",")),
          e.events && (n += "".concat(as(e.events, !1), ",")),
          e.nativeEvents && (n += "".concat(as(e.nativeEvents, !0), ",")),
          e.slotTarget && !e.slotScope && (n += "slot:".concat(e.slotTarget, ",")),
          e.scopedSlots &&
            (n += "".concat(
              ((e, t, n) => {
                var a =
                    e.for ||
                    Object.keys(t).some((e) => {
                      var n = t[e];
                      return n.slotTargetDynamic || n.if || n.for || vs(n);
                    }),
                  r = !!e.if;
                if (!a)
                  for (var i = e.parent; i; ) {
                    if ((i.slotScope && i.slotScope !== Mo) || i.for) {
                      a = !0;
                      break;
                    }
                    i.if && (r = !0), (i = i.parent);
                  }
                var o = Object.keys(t)
                  .map((e) => hs(t[e], n))
                  .join(",");
                return "scopedSlots:_u(["
                  .concat(o, "]")
                  .concat(a ? ",null,true" : "")
                  .concat(
                    !a && r
                      ? ",null,false,".concat(
                          ((e) => {
                            for (var t = 5381, n = e.length; n; ) t = (33 * t) ^ e.charCodeAt(--n);
                            return t >>> 0;
                          })(o)
                        )
                      : "",
                    ")"
                  );
              })(e, e.scopedSlots, t),
              ","
            )),
          e.model &&
            (n += "model:{value:"
              .concat(e.model.value, ",callback:")
              .concat(e.model.callback, ",expression:")
              .concat(e.model.expression, "},")),
          e.inlineTemplate)
        ) {
          var i = ((e, t) => {
            var n = e.children[0];
            if (n && 1 === n.type) {
              var a = us(n, t.options);
              return "inlineTemplate:{render:function(){"
                .concat(a.render, "},staticRenderFns:[")
                .concat(a.staticRenderFns.map((e) => "function(){".concat(e, "}")).join(","), "]}");
            }
          })(e, t);
          i && (n += "".concat(i, ","));
        }
        return (
          (n = n.replace(/,$/, "") + "}"),
          e.dynamicAttrs &&
            (n = "_b(".concat(n, ',"').concat(e.tag, '",').concat(_s(e.dynamicAttrs), ")")),
          e.wrapData && (n = e.wrapData(n)),
          e.wrapListeners && (n = e.wrapListeners(n)),
          n
        );
      }
      function vs(e) {
        return 1 === e.type && ("slot" === e.tag || e.children.some(vs));
      }
      function hs(e, t) {
        var n = e.attrsMap["slot-scope"];
        if (e.if && !e.ifProcessed && !n) return ds(e, t, hs, "null");
        if (e.for && !e.forProcessed) return fs(e, t, hs);
        var a = e.slotScope === Mo ? "" : String(e.slotScope),
          r =
            "function(".concat(a, "){") +
            "return ".concat(
              "template" === e.tag
                ? e.if && n
                  ? "(".concat(e.if, ")?").concat(bs(e, t) || "undefined", ":undefined")
                  : bs(e, t) || "undefined"
                : cs(e, t),
              "}"
            ),
          i = a ? "" : ",proxy:true";
        return "{key:"
          .concat(e.slotTarget || '"default"', ",fn:")
          .concat(r)
          .concat(i, "}");
      }
      function bs(e, t, n, a, r) {
        var i = e.children;
        if (i.length) {
          var o = i[0];
          if (1 === i.length && o.for && "template" !== o.tag && "slot" !== o.tag) {
            var s = n ? (t.maybeComponent(o) ? ",1" : ",0") : "";
            return "".concat((a || cs)(o, t)).concat(s);
          }
          var u = n
              ? ((e, t) => {
                  for (var n = 0, a = 0; a < e.length; a++) {
                    var r = e[a];
                    if (1 === r.type) {
                      if (gs(r) || (r.ifConditions && r.ifConditions.some((e) => gs(e.block)))) {
                        n = 2;
                        break;
                      }
                      (t(r) || (r.ifConditions && r.ifConditions.some((e) => t(e.block)))) &&
                        (n = 1);
                    }
                  }
                  return n;
                })(i, t.maybeComponent)
              : 0,
            c = r || Ts;
          return "[".concat(i.map((e) => c(e, t)).join(","), "]").concat(u ? ",".concat(u) : "");
        }
      }
      function gs(e) {
        return void 0 !== e.for || "template" === e.tag || "slot" === e.tag;
      }
      function Ts(e, t) {
        return 1 === e.type
          ? cs(e, t)
          : 3 === e.type && e.isComment
            ? ((e) => "_e(".concat(JSON.stringify(e.text), ")"))(e)
            : "_v(".concat(2 === (n = e).type ? n.expression : ws(JSON.stringify(n.text)), ")");
        var n;
      }
      function _s(e) {
        for (var t = "", n = "", a = 0; a < e.length; a++) {
          var r = e[a],
            i = ws(r.value);
          r.dynamic
            ? (n += "".concat(r.name, ",").concat(i, ","))
            : (t += '"'.concat(r.name, '":').concat(i, ","));
        }
        return (
          (t = "{".concat(t.slice(0, -1), "}")),
          n ? "_d(".concat(t, ",[").concat(n.slice(0, -1), "])") : t
        );
      }
      function ws(e) {
        return e.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
      }
      function xs(e, t) {
        try {
          return new Function(e);
        } catch (n) {
          return t.push({ err: n, code: e }), A;
        }
      }
      function Cs(e) {
        var t = Object.create(null);
        return (n, a, r) => {
          (a = M({}, a)).warn, delete a.warn;
          var i = a.delimiters ? String(a.delimiters) + n : n;
          if (t[i]) return t[i];
          var o = e(n, a),
            s = {},
            u = [];
          return (
            (s.render = xs(o.render, u)),
            (s.staticRenderFns = o.staticRenderFns.map((e) => xs(e, u))),
            (t[i] = s)
          );
        };
      }
      new RegExp(
        "\\b" +
          "do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,super,throw,while,yield,delete,export,import,return,switch,default,extends,finally,continue,debugger,function,arguments"
            .split(",")
            .join("\\b|\\b") +
          "\\b"
      ),
        new RegExp(
          "\\b" +
            "delete,typeof,void".split(",").join("\\s*\\([^\\)]*\\)|\\b") +
            "\\s*\\([^\\)]*\\)"
        );
      var ks,
        Es,
        Ss =
          ((ks = (e, t) => {
            var n = Ao(e.trim(), t);
            !1 !== t.optimize && Ko(n, t);
            var a = us(n, t);
            return { ast: n, render: a.render, staticRenderFns: a.staticRenderFns };
          }),
          (e) => {
            function t(t, n) {
              var a = Object.create(e),
                r = [],
                i = [];
              if (n)
                for (var o in (n.modules && (a.modules = (e.modules || []).concat(n.modules)),
                n.directives &&
                  (a.directives = M(Object.create(e.directives || null), n.directives)),
                n))
                  "modules" !== o && "directives" !== o && (a[o] = n[o]);
              a.warn = (e, t, n) => {
                (n ? i : r).push(e);
              };
              var s = ks(t.trim(), a);
              return (s.errors = r), (s.tips = i), s;
            }
            return { compile: t, compileToFunctions: Cs(t) };
          }),
        Rs = Ss(zo).compileToFunctions;
      function $s(e) {
        return (
          ((Es = Es || document.createElement("div")).innerHTML = e
            ? '<a href="\n"/>'
            : '<div a="\n"/>'),
          Es.innerHTML.indexOf("&#10;") > 0
        );
      }
      var Ms = !!K && $s(!1),
        Os = !!K && $s(!0),
        As = w((e) => {
          var t = ga(e);
          return t && t.innerHTML;
        }),
        Ps = Gn.prototype.$mount;
      function Ls(e, t) {
        for (var n in t) e[n] = t[n];
        return e;
      }
      (Gn.prototype.$mount = function (e, t) {
        if ((e = e && ga(e)) === document.body || e === document.documentElement) return this;
        var n = this.$options;
        if (!n.render) {
          var a = n.template;
          if (a)
            if ("string" == typeof a) "#" === a.charAt(0) && (a = As(a));
            else {
              if (!a.nodeType) return this;
              a = a.innerHTML;
            }
          else
            e &&
              (a = ((e) => {
                if (e.outerHTML) return e.outerHTML;
                var t = document.createElement("div");
                return t.appendChild(e.cloneNode(!0)), t.innerHTML;
              })(e));
          if (a) {
            var r = Rs(
                a,
                {
                  outputSourceRange: !1,
                  shouldDecodeNewlines: Ms,
                  shouldDecodeNewlinesForHref: Os,
                  delimiters: n.delimiters,
                  comments: n.comments,
                },
                this
              ),
              i = r.render,
              o = r.staticRenderFns;
            (n.render = i), (n.staticRenderFns = o);
          }
        }
        return Ps.call(this, e, t);
      }),
        (Gn.compile = Rs);
      var js = /[!'()*]/g,
        Is = (e) => "%" + e.charCodeAt(0).toString(16),
        Ds = /%2C/g,
        Bs = (e) => encodeURIComponent(e).replace(js, Is).replace(Ds, ",");
      function Ns(e) {
        try {
          return decodeURIComponent(e);
        } catch (e) {}
        return e;
      }
      var Fs = (e) => (null == e || "object" == typeof e ? e : String(e));
      function Us(e) {
        var t = {};
        return (e = e.trim().replace(/^(\?|#|&)/, ""))
          ? (e.split("&").forEach((e) => {
              var n = e.replace(/\+/g, " ").split("="),
                a = Ns(n.shift()),
                r = n.length > 0 ? Ns(n.join("=")) : null;
              void 0 === t[a]
                ? (t[a] = r)
                : Array.isArray(t[a])
                  ? t[a].push(r)
                  : (t[a] = [t[a], r]);
            }),
            t)
          : t;
      }
      function qs(e) {
        var t = e
          ? Object.keys(e)
              .map((t) => {
                var n = e[t];
                if (void 0 === n) return "";
                if (null === n) return Bs(t);
                if (Array.isArray(n)) {
                  var a = [];
                  return (
                    n.forEach((e) => {
                      void 0 !== e && (null === e ? a.push(Bs(t)) : a.push(Bs(t) + "=" + Bs(e)));
                    }),
                    a.join("&")
                  );
                }
                return Bs(t) + "=" + Bs(n);
              })
              .filter((e) => e.length > 0)
              .join("&")
          : null;
        return t ? "?" + t : "";
      }
      var Hs = /\/?$/;
      function Vs(e, t, n, a) {
        var r = a && a.options.stringifyQuery,
          i = t.query || {};
        try {
          i = zs(i);
        } catch (e) {}
        var o = {
          name: t.name || (e && e.name),
          meta: (e && e.meta) || {},
          path: t.path || "/",
          hash: t.hash || "",
          query: i,
          params: t.params || {},
          fullPath: Js(t, r),
          matched: e ? Ks(e) : [],
        };
        return n && (o.redirectedFrom = Js(n, r)), Object.freeze(o);
      }
      function zs(e) {
        if (Array.isArray(e)) return e.map(zs);
        if (e && "object" == typeof e) {
          var t = {};
          for (var n in e) t[n] = zs(e[n]);
          return t;
        }
        return e;
      }
      var Gs = Vs(null, { path: "/" });
      function Ks(e) {
        for (var t = []; e; ) t.unshift(e), (e = e.parent);
        return t;
      }
      function Js(e, t) {
        var n = e.path,
          a = e.query;
        void 0 === a && (a = {});
        var r = e.hash;
        return void 0 === r && (r = ""), (n || "/") + (t || qs)(a) + r;
      }
      function Ws(e, t, n) {
        return t === Gs
          ? e === t
          : !!t &&
              (e.path && t.path
                ? e.path.replace(Hs, "") === t.path.replace(Hs, "") &&
                  (n || (e.hash === t.hash && Xs(e.query, t.query)))
                : !(!e.name || !t.name) &&
                  e.name === t.name &&
                  (n || (e.hash === t.hash && Xs(e.query, t.query) && Xs(e.params, t.params))));
      }
      function Xs(e, t) {
        if ((void 0 === e && (e = {}), void 0 === t && (t = {}), !e || !t)) return e === t;
        var n = Object.keys(e).sort(),
          a = Object.keys(t).sort();
        return (
          n.length === a.length &&
          n.every((n, r) => {
            var i = e[n];
            if (a[r] !== n) return !1;
            var o = t[n];
            return null == i || null == o
              ? i === o
              : "object" == typeof i && "object" == typeof o
                ? Xs(i, o)
                : String(i) === String(o);
          })
        );
      }
      function Zs(e) {
        for (var t = 0; t < e.matched.length; t++) {
          var n = e.matched[t];
          for (var a in n.instances) {
            var r = n.instances[a],
              i = n.enteredCbs[a];
            if (r && i) {
              delete n.enteredCbs[a];
              for (var o = 0; o < i.length; o++) r._isBeingDestroyed || i[o](r);
            }
          }
        }
      }
      var Ys = {
        name: "RouterView",
        functional: !0,
        props: { name: { type: String, default: "default" } },
        render: (e, t) => {
          var n = t.props,
            a = t.children,
            r = t.parent,
            i = t.data;
          i.routerView = !0;
          for (
            var o = r.$createElement,
              s = n.name,
              u = r.$route,
              c = r._routerViewCache || (r._routerViewCache = {}),
              l = 0,
              p = !1;
            r && r._routerRoot !== r;
          ) {
            var d = r.$vnode ? r.$vnode.data : {};
            d.routerView && l++,
              d.keepAlive && r._directInactive && r._inactive && (p = !0),
              (r = r.$parent);
          }
          if (((i.routerViewDepth = l), p)) {
            var y = c[s],
              f = y && y.component;
            return f ? (y.configProps && Qs(f, i, y.route, y.configProps), o(f, i, a)) : o();
          }
          var m = u.matched[l],
            v = m && m.components[s];
          if (!m || !v) return (c[s] = null), o();
          (c[s] = { component: v }),
            (i.registerRouteInstance = (e, t) => {
              var n = m.instances[s];
              ((t && n !== e) || (!t && n === e)) && (m.instances[s] = t);
            }),
            ((i.hook || (i.hook = {})).prepatch = (e, t) => {
              m.instances[s] = t.componentInstance;
            }),
            (i.hook.init = (e) => {
              e.data.keepAlive &&
                e.componentInstance &&
                e.componentInstance !== m.instances[s] &&
                (m.instances[s] = e.componentInstance),
                Zs(u);
            });
          var h = m.props && m.props[s];
          return h && (Ls(c[s], { route: u, configProps: h }), Qs(v, i, u, h)), o(v, i, a);
        },
      };
      function Qs(e, t, n, a) {
        var r = (t.props = ((e, t) => {
          switch (typeof t) {
            case "undefined":
              return;
            case "object":
              return t;
            case "function":
              return t(e);
            case "boolean":
              return t ? e.params : void 0;
          }
        })(n, a));
        if (r) {
          r = t.props = Ls({}, r);
          var i = (t.attrs = t.attrs || {});
          for (var o in r) (e.props && o in e.props) || ((i[o] = r[o]), delete r[o]);
        }
      }
      function eu(e, t, n) {
        var a = e.charAt(0);
        if ("/" === a) return e;
        if ("?" === a || "#" === a) return t + e;
        var r = t.split("/");
        (n && r[r.length - 1]) || r.pop();
        for (var i = e.replace(/^\//, "").split("/"), o = 0; o < i.length; o++) {
          var s = i[o];
          ".." === s ? r.pop() : "." !== s && r.push(s);
        }
        return "" !== r[0] && r.unshift(""), r.join("/");
      }
      function tu(e) {
        return e.replace(/\/(?:\s*\/)+/g, "/");
      }
      var nu = Array.isArray || ((e) => "[object Array]" == Object.prototype.toString.call(e)),
        au = function e(t, n, a) {
          return (
            nu(n) || ((a = n || a), (n = [])),
            (a = a || {}),
            t instanceof RegExp
              ? ((e, t) => {
                  var n = e.source.match(/\((?!\?)/g);
                  if (n)
                    for (var a = 0; a < n.length; a++)
                      t.push({
                        name: a,
                        prefix: null,
                        delimiter: null,
                        optional: !1,
                        repeat: !1,
                        partial: !1,
                        asterisk: !1,
                        pattern: null,
                      });
                  return fu(e, t);
                })(t, n)
              : nu(t)
                ? ((t, n, a) => {
                    for (var r = [], i = 0; i < t.length; i++) r.push(e(t[i], n, a).source);
                    return fu(new RegExp("(?:" + r.join("|") + ")", mu(a)), n);
                  })(t, n, a)
                : ((e, t, n) => vu(uu(e, n), t, n))(t, n, a)
          );
        },
        ru = uu,
        iu = pu,
        ou = vu,
        su = new RegExp(
          [
            "(\\\\.)",
            "([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))",
          ].join("|"),
          "g"
        );
      function uu(e, t) {
        for (
          var n, a = [], r = 0, i = 0, o = "", s = (t && t.delimiter) || "/";
          null != (n = su.exec(e));
        ) {
          var u = n[0],
            c = n[1],
            l = n.index;
          if (((o += e.slice(i, l)), (i = l + u.length), c)) o += c[1];
          else {
            var p = e[i],
              d = n[2],
              y = n[3],
              f = n[4],
              m = n[5],
              v = n[6],
              h = n[7];
            o && (a.push(o), (o = ""));
            var b = null != d && null != p && p !== d,
              g = "+" === v || "*" === v,
              T = "?" === v || "*" === v,
              _ = n[2] || s,
              w = f || m;
            a.push({
              name: y || r++,
              prefix: d || "",
              delimiter: _,
              optional: T,
              repeat: g,
              partial: b,
              asterisk: !!h,
              pattern: w ? yu(w) : h ? ".*" : "[^" + du(_) + "]+?",
            });
          }
        }
        return i < e.length && (o += e.substr(i)), o && a.push(o), a;
      }
      function cu(e) {
        return encodeURI(e).replace(
          /[/?#]/g,
          (e) => "%" + e.charCodeAt(0).toString(16).toUpperCase()
        );
      }
      function lu(e) {
        return encodeURI(e).replace(
          /[?#]/g,
          (e) => "%" + e.charCodeAt(0).toString(16).toUpperCase()
        );
      }
      function pu(e, t) {
        for (var n = new Array(e.length), a = 0; a < e.length; a++)
          "object" == typeof e[a] && (n[a] = new RegExp("^(?:" + e[a].pattern + ")$", mu(t)));
        return (t, a) => {
          for (
            var r = "", i = t || {}, o = (a || {}).pretty ? cu : encodeURIComponent, s = 0;
            s < e.length;
            s++
          ) {
            var u = e[s];
            if ("string" != typeof u) {
              var c,
                l = i[u.name];
              if (null == l) {
                if (u.optional) {
                  u.partial && (r += u.prefix);
                  continue;
                }
                throw new TypeError('Expected "' + u.name + '" to be defined');
              }
              if (nu(l)) {
                if (!u.repeat)
                  throw new TypeError(
                    'Expected "' +
                      u.name +
                      '" to not repeat, but received `' +
                      JSON.stringify(l) +
                      "`"
                  );
                if (0 === l.length) {
                  if (u.optional) continue;
                  throw new TypeError('Expected "' + u.name + '" to not be empty');
                }
                for (var p = 0; p < l.length; p++) {
                  if (((c = o(l[p])), !n[s].test(c)))
                    throw new TypeError(
                      'Expected all "' +
                        u.name +
                        '" to match "' +
                        u.pattern +
                        '", but received `' +
                        JSON.stringify(c) +
                        "`"
                    );
                  r += (0 === p ? u.prefix : u.delimiter) + c;
                }
              } else {
                if (((c = u.asterisk ? lu(l) : o(l)), !n[s].test(c)))
                  throw new TypeError(
                    'Expected "' +
                      u.name +
                      '" to match "' +
                      u.pattern +
                      '", but received "' +
                      c +
                      '"'
                  );
                r += u.prefix + c;
              }
            } else r += u;
          }
          return r;
        };
      }
      function du(e) {
        return e.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
      }
      function yu(e) {
        return e.replace(/([=!:$/()])/g, "\\$1");
      }
      function fu(e, t) {
        return (e.keys = t), e;
      }
      function mu(e) {
        return e && e.sensitive ? "" : "i";
      }
      function vu(e, t, n) {
        nu(t) || ((n = t || n), (t = []));
        for (var a = (n = n || {}).strict, r = !1 !== n.end, i = "", o = 0; o < e.length; o++) {
          var s = e[o];
          if ("string" == typeof s) i += du(s);
          else {
            var u = du(s.prefix),
              c = "(?:" + s.pattern + ")";
            t.push(s),
              s.repeat && (c += "(?:" + u + c + ")*"),
              (i += c =
                s.optional
                  ? s.partial
                    ? u + "(" + c + ")?"
                    : "(?:" + u + "(" + c + "))?"
                  : u + "(" + c + ")");
          }
        }
        var l = du(n.delimiter || "/"),
          p = i.slice(-l.length) === l;
        return (
          a || (i = (p ? i.slice(0, -l.length) : i) + "(?:" + l + "(?=$))?"),
          (i += r ? "$" : a && p ? "" : "(?=" + l + "|$)"),
          fu(new RegExp("^" + i, mu(n)), t)
        );
      }
      (au.parse = ru),
        (au.compile = (e, t) => pu(uu(e, t), t)),
        (au.tokensToFunction = iu),
        (au.tokensToRegExp = ou);
      var hu = Object.create(null);
      function bu(e, t, n) {
        t = t || {};
        try {
          var a = hu[e] || (hu[e] = au.compile(e));
          return "string" == typeof t.pathMatch && (t[0] = t.pathMatch), a(t, { pretty: !0 });
        } catch (e) {
          return "";
        } finally {
          delete t[0];
        }
      }
      function gu(e, t, n, a) {
        var r = "string" == typeof e ? { path: e } : e;
        if (r._normalized) return r;
        if (r.name) {
          var i = (r = Ls({}, e)).params;
          return i && "object" == typeof i && (r.params = Ls({}, i)), r;
        }
        if (!r.path && r.params && t) {
          (r = Ls({}, r))._normalized = !0;
          var o = Ls(Ls({}, t.params), r.params);
          if (t.name) (r.name = t.name), (r.params = o);
          else if (t.matched.length) {
            var s = t.matched[t.matched.length - 1].path;
            r.path = bu(s, o, t.path);
          }
          return r;
        }
        var u = ((e) => {
            var t = "",
              n = "",
              a = e.indexOf("#");
            a >= 0 && ((t = e.slice(a)), (e = e.slice(0, a)));
            var r = e.indexOf("?");
            return (
              r >= 0 && ((n = e.slice(r + 1)), (e = e.slice(0, r))), { path: e, query: n, hash: t }
            );
          })(r.path || ""),
          c = (t && t.path) || "/",
          l = u.path ? eu(u.path, c, n || r.append) : c,
          p = ((e, t, n) => {
            void 0 === t && (t = {});
            var a,
              r = n || Us;
            try {
              a = r(e || "");
            } catch (e) {
              a = {};
            }
            for (var i in t) {
              var o = t[i];
              a[i] = Array.isArray(o) ? o.map(Fs) : Fs(o);
            }
            return a;
          })(u.query, r.query, a && a.options.parseQuery),
          d = r.hash || u.hash;
        return (
          d && "#" !== d.charAt(0) && (d = "#" + d), { _normalized: !0, path: l, query: p, hash: d }
        );
      }
      var Tu,
        _u = () => {},
        wu = {
          name: "RouterLink",
          props: {
            to: { type: [String, Object], required: !0 },
            tag: { type: String, default: "a" },
            custom: Boolean,
            exact: Boolean,
            exactPath: Boolean,
            append: Boolean,
            replace: Boolean,
            activeClass: String,
            exactActiveClass: String,
            ariaCurrentValue: { type: String, default: "page" },
            event: { type: [String, Array], default: "click" },
          },
          render: function (e) {
            var n = this.$router,
              a = this.$route,
              r = n.resolve(this.to, a, this.append),
              i = r.location,
              o = r.route,
              s = r.href,
              u = {},
              c = n.options.linkActiveClass,
              l = n.options.linkExactActiveClass,
              p = null == c ? "router-link-active" : c,
              d = null == l ? "router-link-exact-active" : l,
              y = null == this.activeClass ? p : this.activeClass,
              f = null == this.exactActiveClass ? d : this.exactActiveClass,
              m = o.redirectedFrom ? Vs(null, gu(o.redirectedFrom), null, n) : o;
            (u[f] = Ws(a, m, this.exactPath)),
              (u[y] =
                this.exact || this.exactPath
                  ? u[f]
                  : ((e, t) =>
                      0 === e.path.replace(Hs, "/").indexOf(t.path.replace(Hs, "/")) &&
                      (!t.hash || e.hash === t.hash) &&
                      ((e, t) => {
                        for (var n in t) if (!(n in e)) return !1;
                        return !0;
                      })(e.query, t.query))(a, m));
            var v = u[f] ? this.ariaCurrentValue : null,
              h = (e) => {
                xu(e) && (this.replace ? n.replace(i, _u) : n.push(i, _u));
              },
              b = { click: xu };
            Array.isArray(this.event)
              ? this.event.forEach((e) => {
                  b[e] = h;
                })
              : (b[this.event] = h);
            var g = { class: u },
              T =
                !this.$scopedSlots.$hasNormal &&
                this.$scopedSlots.default &&
                this.$scopedSlots.default({
                  href: s,
                  route: o,
                  navigate: h,
                  isActive: u[y],
                  isExactActive: u[f],
                });
            if (T) {
              if (1 === T.length) return T[0];
              if (T.length > 1 || !T.length) return 0 === T.length ? e() : e("span", {}, T);
            }
            if ("a" === this.tag) (g.on = b), (g.attrs = { href: s, "aria-current": v });
            else {
              var _ = Cu(this.$slots.default);
              if (_) {
                _.isStatic = !1;
                var w = (_.data = Ls({}, _.data));
                for (var x in ((w.on = w.on || {}), w.on)) {
                  var C = w.on[x];
                  x in b && (w.on[x] = Array.isArray(C) ? C : [C]);
                }
                for (var k in b) k in w.on ? w.on[k].push(b[k]) : (w.on[k] = h);
                var E = (_.data.attrs = Ls({}, _.data.attrs));
                (E.href = s), (E["aria-current"] = v);
              } else g.on = b;
            }
            return e(this.tag, g, this.$slots.default);
          },
        };
      function xu(e) {
        if (
          !(
            e.metaKey ||
            e.altKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.defaultPrevented ||
            (void 0 !== e.button && 0 !== e.button)
          )
        ) {
          if (e.currentTarget && e.currentTarget.getAttribute) {
            var t = e.currentTarget.getAttribute("target");
            if (/\b_blank\b/i.test(t)) return;
          }
          return e.preventDefault && e.preventDefault(), !0;
        }
      }
      function Cu(e) {
        if (e)
          for (var t, n = 0; n < e.length; n++) {
            if ("a" === (t = e[n]).tag) return t;
            if (t.children && (t = Cu(t.children))) return t;
          }
      }
      var ku = "undefined" != typeof window;
      function Eu(e, t, n, a, r) {
        var i = t || [],
          o = n || Object.create(null),
          s = a || Object.create(null);
        e.forEach((e) => {
          Su(i, o, s, e, r);
        });
        for (var u = 0, c = i.length; u < c; u++)
          "*" === i[u] && (i.push(i.splice(u, 1)[0]), c--, u--);
        return { pathList: i, pathMap: o, nameMap: s };
      }
      function Su(e, t, n, a, r, i) {
        var o = a.path,
          s = a.name,
          u = a.pathToRegexpOptions || {},
          c = ((e, t, n) => (
            n || (e = e.replace(/\/$/, "")), "/" === e[0] || null == t ? e : tu(t.path + "/" + e)
          ))(o, r, u.strict);
        "boolean" == typeof a.caseSensitive && (u.sensitive = a.caseSensitive);
        var l = {
          path: c,
          regex: Ru(c, u),
          components: a.components || { default: a.component },
          alias: a.alias ? ("string" == typeof a.alias ? [a.alias] : a.alias) : [],
          instances: {},
          enteredCbs: {},
          name: s,
          parent: r,
          matchAs: i,
          redirect: a.redirect,
          beforeEnter: a.beforeEnter,
          meta: a.meta || {},
          props: null == a.props ? {} : a.components ? a.props : { default: a.props },
        };
        if (
          (a.children &&
            a.children.forEach((a) => {
              var r = i ? tu(i + "/" + a.path) : void 0;
              Su(e, t, n, a, l, r);
            }),
          t[l.path] || (e.push(l.path), (t[l.path] = l)),
          void 0 !== a.alias)
        )
          for (var p = Array.isArray(a.alias) ? a.alias : [a.alias], d = 0; d < p.length; ++d) {
            var y = { path: p[d], children: a.children };
            Su(e, t, n, y, r, l.path || "/");
          }
        s && (n[s] || (n[s] = l));
      }
      function Ru(e, t) {
        return au(e, [], t);
      }
      function $u(e, t) {
        var n = Eu(e),
          a = n.pathList,
          r = n.pathMap,
          i = n.nameMap;
        function o(e, n, o) {
          var u = gu(e, n, !1, t),
            c = u.name;
          if (c) {
            var l = i[c];
            if (!l) return s(null, u);
            var p = l.regex.keys.filter((e) => !e.optional).map((e) => e.name);
            if (("object" != typeof u.params && (u.params = {}), n && "object" == typeof n.params))
              for (var d in n.params)
                !(d in u.params) && p.indexOf(d) > -1 && (u.params[d] = n.params[d]);
            return (u.path = bu(l.path, u.params)), s(l, u, o);
          }
          if (u.path) {
            u.params = {};
            for (var y = 0; y < a.length; y++) {
              var f = a[y],
                m = r[f];
              if (Mu(m.regex, u.path, u.params)) return s(m, u, o);
            }
          }
          return s(null, u);
        }
        function s(e, n, a) {
          return e && e.redirect
            ? ((e, n) => {
                var a = e.redirect,
                  r = "function" == typeof a ? a(Vs(e, n, null, t)) : a;
                if (("string" == typeof r && (r = { path: r }), !r || "object" != typeof r))
                  return s(null, n);
                var u = r,
                  c = u.name,
                  l = u.path,
                  p = n.query,
                  d = n.hash,
                  y = n.params;
                if (
                  ((p = Object.hasOwn(u, "query") ? u.query : p),
                  (d = Object.hasOwn(u, "hash") ? u.hash : d),
                  (y = Object.hasOwn(u, "params") ? u.params : y),
                  c)
                )
                  return (
                    i[c], o({ _normalized: !0, name: c, query: p, hash: d, params: y }, void 0, n)
                  );
                if (l) {
                  var f = ((e, t) => eu(e, t.parent ? t.parent.path : "/", !0))(l, e);
                  return o({ _normalized: !0, path: bu(f, y), query: p, hash: d }, void 0, n);
                }
                return s(null, n);
              })(e, a || n)
            : e && e.matchAs
              ? ((e, t, n) => {
                  var a = o({ _normalized: !0, path: bu(n, t.params) });
                  if (a) {
                    var r = a.matched,
                      i = r[r.length - 1];
                    return (t.params = a.params), s(i, t);
                  }
                  return s(null, t);
                })(0, n, e.matchAs)
              : Vs(e, n, a, t);
        }
        return {
          match: o,
          addRoute: (e, t) => {
            var n = "object" != typeof e ? i[e] : void 0;
            Eu([t || e], a, r, i, n),
              n &&
                n.alias.length &&
                Eu(
                  n.alias.map((e) => ({ path: e, children: [t] })),
                  a,
                  r,
                  i,
                  n
                );
          },
          getRoutes: () => a.map((e) => r[e]),
          addRoutes: (e) => {
            Eu(e, a, r, i);
          },
        };
      }
      function Mu(e, t, n) {
        var a = t.match(e);
        if (!a) return !1;
        if (!n) return !0;
        for (var r = 1, i = a.length; r < i; ++r) {
          var o = e.keys[r - 1];
          o && (n[o.name || "pathMatch"] = "string" == typeof a[r] ? Ns(a[r]) : a[r]);
        }
        return !0;
      }
      var Ou = ku && window.performance && window.performance.now ? window.performance : Date;
      function Au() {
        return Ou.now().toFixed(3);
      }
      var Pu = Au();
      function Lu() {
        return Pu;
      }
      function ju(e) {
        return (Pu = e);
      }
      var Iu = Object.create(null);
      function Du() {
        "scrollRestoration" in window.history && (window.history.scrollRestoration = "manual");
        var e = window.location.protocol + "//" + window.location.host,
          t = window.location.href.replace(e, ""),
          n = Ls({}, window.history.state);
        return (
          (n.key = Lu()),
          window.history.replaceState(n, "", t),
          window.addEventListener("popstate", Fu),
          () => {
            window.removeEventListener("popstate", Fu);
          }
        );
      }
      function Bu(e, t, n, a) {
        if (e.app) {
          var r = e.options.scrollBehavior;
          r &&
            e.app.$nextTick(() => {
              var i = (() => {
                  var e = Lu();
                  if (e) return Iu[e];
                })(),
                o = r.call(e, t, n, a ? i : null);
              o &&
                ("function" == typeof o.then
                  ? o
                      .then((e) => {
                        zu(e, i);
                      })
                      .catch((e) => {})
                  : zu(o, i));
            });
        }
      }
      function Nu() {
        var e = Lu();
        e && (Iu[e] = { x: window.pageXOffset, y: window.pageYOffset });
      }
      function Fu(e) {
        Nu(), e.state && e.state.key && ju(e.state.key);
      }
      function Uu(e) {
        return Hu(e.x) || Hu(e.y);
      }
      function qu(e) {
        return { x: Hu(e.x) ? e.x : window.pageXOffset, y: Hu(e.y) ? e.y : window.pageYOffset };
      }
      function Hu(e) {
        return "number" == typeof e;
      }
      var Vu = /^#\d/;
      function zu(e, t) {
        var n,
          a = "object" == typeof e;
        if (a && "string" == typeof e.selector) {
          var r = Vu.test(e.selector)
            ? document.getElementById(e.selector.slice(1))
            : document.querySelector(e.selector);
          if (r) {
            var i = e.offset && "object" == typeof e.offset ? e.offset : {};
            t = ((e, t) => {
              var n = document.documentElement.getBoundingClientRect(),
                a = e.getBoundingClientRect();
              return { x: a.left - n.left - t.x, y: a.top - n.top - t.y };
            })(r, (i = { x: Hu((n = i).x) ? n.x : 0, y: Hu(n.y) ? n.y : 0 }));
          } else Uu(e) && (t = qu(e));
        } else a && Uu(e) && (t = qu(e));
        t &&
          ("scrollBehavior" in document.documentElement.style
            ? window.scrollTo({ left: t.x, top: t.y, behavior: e.behavior })
            : window.scrollTo(t.x, t.y));
      }
      var Gu,
        Ku =
          ku &&
          ((-1 === (Gu = window.navigator.userAgent).indexOf("Android 2.") &&
            -1 === Gu.indexOf("Android 4.0")) ||
            -1 === Gu.indexOf("Mobile Safari") ||
            -1 !== Gu.indexOf("Chrome") ||
            -1 !== Gu.indexOf("Windows Phone")) &&
          window.history &&
          "function" == typeof window.history.pushState;
      function Ju(e, t) {
        Nu();
        var n = window.history;
        try {
          if (t) {
            var a = Ls({}, n.state);
            (a.key = Lu()), n.replaceState(a, "", e);
          } else n.pushState({ key: ju(Au()) }, "", e);
        } catch (n) {
          window.location[t ? "replace" : "assign"](e);
        }
      }
      function Wu(e) {
        Ju(e, !0);
      }
      var Xu = { redirected: 2, aborted: 4, cancelled: 8, duplicated: 16 };
      function Zu(e, t) {
        return Yu(
          e,
          t,
          Xu.cancelled,
          'Navigation cancelled from "' +
            e.fullPath +
            '" to "' +
            t.fullPath +
            '" with a new navigation.'
        );
      }
      function Yu(e, t, n, a) {
        var r = new Error(a);
        return (r._isRouter = !0), (r.from = e), (r.to = t), (r.type = n), r;
      }
      var Qu = ["params", "query", "hash"];
      function ec(e) {
        return Object.prototype.toString.call(e).indexOf("Error") > -1;
      }
      function tc(e, t) {
        return ec(e) && e._isRouter && (null == t || e.type === t);
      }
      function nc(e, t, n) {
        var a = (r) => {
          r >= e.length
            ? n()
            : e[r]
              ? t(e[r], () => {
                  a(r + 1);
                })
              : a(r + 1);
        };
        a(0);
      }
      function ac(e, t) {
        return rc(
          e.map((e) =>
            Object.keys(e.components).map((n) => t(e.components[n], e.instances[n], e, n))
          )
        );
      }
      function rc(e) {
        return Array.prototype.concat.apply([], e);
      }
      var ic = "function" == typeof Symbol && "symbol" == typeof Symbol.toStringTag;
      function oc(e) {
        var t = !1;
        return function () {
          for (var n = [], a = arguments.length; a--; ) n[a] = arguments[a];
          if (!t) return (t = !0), e.apply(this, n);
        };
      }
      var sc = function (e, t) {
        (this.router = e),
          (this.base = ((e) => {
            if (!e)
              if (ku) {
                var t = document.querySelector("base");
                e = (e = (t && t.getAttribute("href")) || "/").replace(/^https?:\/\/[^/]+/, "");
              } else e = "/";
            return "/" !== e.charAt(0) && (e = "/" + e), e.replace(/\/$/, "");
          })(t)),
          (this.current = Gs),
          (this.pending = null),
          (this.ready = !1),
          (this.readyCbs = []),
          (this.readyErrorCbs = []),
          (this.errorCbs = []),
          (this.listeners = []);
      };
      function uc(e, t, n, a) {
        var r = ac(e, (e, a, r, i) => {
          var o = ((e, t) => ("function" != typeof e && (e = Tu.extend(e)), e.options[t]))(e, t);
          if (o) return Array.isArray(o) ? o.map((e) => n(e, a, r, i)) : n(o, a, r, i);
        });
        return rc(a ? r.reverse() : r);
      }
      function cc(e, t) {
        if (t) return () => e.apply(t, arguments);
      }
      (sc.prototype.listen = function (e) {
        this.cb = e;
      }),
        (sc.prototype.onReady = function (e, t) {
          this.ready ? e() : (this.readyCbs.push(e), t && this.readyErrorCbs.push(t));
        }),
        (sc.prototype.onError = function (e) {
          this.errorCbs.push(e);
        }),
        (sc.prototype.transitionTo = function (e, t, n) {
          var a;
          try {
            a = this.router.match(e, this.current);
          } catch (e) {
            throw (
              (this.errorCbs.forEach((t) => {
                t(e);
              }),
              e)
            );
          }
          var i = this.current;
          this.confirmTransition(
            a,
            () => {
              this.updateRoute(a),
                t && t(a),
                this.ensureURL(),
                this.router.afterHooks.forEach((e) => {
                  e && e(a, i);
                }),
                this.ready ||
                  ((this.ready = !0),
                  this.readyCbs.forEach((e) => {
                    e(a);
                  }));
            },
            (e) => {
              n && n(e),
                e &&
                  !this.ready &&
                  ((tc(e, Xu.redirected) && i === Gs) ||
                    ((this.ready = !0),
                    this.readyErrorCbs.forEach((t) => {
                      t(e);
                    })));
            }
          );
        }),
        (sc.prototype.confirmTransition = function (e, t, n) {
          var r = this.current;
          this.pending = e;
          var i,
            o,
            s = (e) => {
              !tc(e) &&
                ec(e) &&
                (this.errorCbs.length
                  ? this.errorCbs.forEach((t) => {
                      t(e);
                    })
                  : console.error(e)),
                n && n(e);
            },
            u = e.matched.length - 1,
            c = r.matched.length - 1;
          if (Ws(e, r) && u === c && e.matched[u] === r.matched[c])
            return (
              this.ensureURL(),
              e.hash && Bu(this.router, r, e, !1),
              s(
                (((o = Yu(
                  (i = r),
                  e,
                  Xu.duplicated,
                  'Avoided redundant navigation to current location: "' + i.fullPath + '".'
                )).name = "NavigationDuplicated"),
                o)
              )
            );
          var l,
            p = ((e, t) => {
              var n,
                a = Math.max(e.length, t.length);
              for (n = 0; n < a && e[n] === t[n]; n++);
              return { updated: t.slice(0, n), activated: t.slice(n), deactivated: e.slice(n) };
            })(this.current.matched, e.matched),
            d = p.updated,
            y = p.deactivated,
            f = p.activated,
            m = [].concat(
              ((e) => uc(e, "beforeRouteLeave", cc, !0))(y),
              this.router.beforeHooks,
              ((e) => uc(e, "beforeRouteUpdate", cc))(d),
              f.map((e) => e.beforeEnter),
              ((l = f),
              (e, t, n) => {
                var a = !1,
                  r = 0,
                  i = null;
                ac(l, (e, t, o, s) => {
                  if ("function" == typeof e && void 0 === e.cid) {
                    (a = !0), r++;
                    var u,
                      c = oc((t) => {
                        var a;
                        ((a = t).__esModule || (ic && "Module" === a[Symbol.toStringTag])) &&
                          (t = t.default),
                          (e.resolved = "function" == typeof t ? t : Tu.extend(t)),
                          (o.components[s] = t),
                          --r <= 0 && n();
                      }),
                      l = oc((e) => {
                        var t = "Failed to resolve async component " + s + ": " + e;
                        i || ((i = ec(e) ? e : new Error(t)), n(i));
                      });
                    try {
                      u = e(c, l);
                    } catch (e) {
                      l(e);
                    }
                    if (u)
                      if ("function" == typeof u.then) u.then(c, l);
                      else {
                        var p = u.component;
                        p && "function" == typeof p.then && p.then(c, l);
                      }
                  }
                }),
                  a || n();
              })
            ),
            v = (t, n) => {
              if (this.pending !== e) return s(Zu(r, e));
              try {
                t(e, r, (t) => {
                  !1 === t
                    ? (this.ensureURL(!0),
                      s(
                        ((e, t) =>
                          Yu(
                            e,
                            t,
                            Xu.aborted,
                            'Navigation aborted from "' +
                              e.fullPath +
                              '" to "' +
                              t.fullPath +
                              '" via a navigation guard.'
                          ))(r, e)
                      ))
                    : ec(t)
                      ? (this.ensureURL(!0), s(t))
                      : "string" == typeof t ||
                          ("object" == typeof t &&
                            ("string" == typeof t.path || "string" == typeof t.name))
                        ? (s(
                            ((e, t) =>
                              Yu(
                                e,
                                t,
                                Xu.redirected,
                                'Redirected when going from "' +
                                  e.fullPath +
                                  '" to "' +
                                  ((e) => {
                                    if ("string" == typeof e) return e;
                                    if ("path" in e) return e.path;
                                    var t = {};
                                    return (
                                      Qu.forEach((n) => {
                                        n in e && (t[n] = e[n]);
                                      }),
                                      JSON.stringify(t, null, 2)
                                    );
                                  })(t) +
                                  '" via a navigation guard.'
                              ))(r, e)
                          ),
                          "object" == typeof t && t.replace ? this.replace(t) : this.push(t))
                        : n(t);
                });
              } catch (e) {
                s(e);
              }
            };
          nc(m, v, () => {
            var n = ((e) =>
              uc(e, "beforeRouteEnter", (e, t, n, a) =>
                (
                  (e, t, n) => (a, r, i) =>
                    e(a, r, (e) => {
                      "function" == typeof e &&
                        (t.enteredCbs[n] || (t.enteredCbs[n] = []), t.enteredCbs[n].push(e)),
                        i(e);
                    })
                )(e, n, a)
              ))(f);
            nc(n.concat(this.router.resolveHooks), v, () => {
              if (this.pending !== e) return s(Zu(r, e));
              (this.pending = null),
                t(e),
                this.router.app &&
                  this.router.app.$nextTick(() => {
                    Zs(e);
                  });
            });
          });
        }),
        (sc.prototype.updateRoute = function (e) {
          (this.current = e), this.cb && this.cb(e);
        }),
        (sc.prototype.setupListeners = () => {}),
        (sc.prototype.teardown = function () {
          this.listeners.forEach((e) => {
            e();
          }),
            (this.listeners = []),
            (this.current = Gs),
            (this.pending = null);
        });
      var lc = ((e) => {
        function t(t, n) {
          e.call(this, t, n), (this._startLocation = pc(this.base));
        }
        return (
          e && (t.__proto__ = e),
          (t.prototype = Object.create(e && e.prototype)),
          (t.prototype.constructor = t),
          (t.prototype.setupListeners = function () {
            if (!(this.listeners.length > 0)) {
              var t = this.router,
                n = t.options.scrollBehavior,
                a = Ku && n;
              a && this.listeners.push(Du());
              var r = () => {
                var n = this.current,
                  r = pc(this.base);
                (this.current === Gs && r === this._startLocation) ||
                  this.transitionTo(r, (e) => {
                    a && Bu(t, e, n, !0);
                  });
              };
              window.addEventListener("popstate", r),
                this.listeners.push(() => {
                  window.removeEventListener("popstate", r);
                });
            }
          }),
          (t.prototype.go = (e) => {
            window.history.go(e);
          }),
          (t.prototype.push = function (e, t, n) {
            var r = this.current;
            this.transitionTo(
              e,
              (e) => {
                Ju(tu(this.base + e.fullPath)), Bu(this.router, e, r, !1), t && t(e);
              },
              n
            );
          }),
          (t.prototype.replace = function (e, t, n) {
            var r = this.current;
            this.transitionTo(
              e,
              (e) => {
                Wu(tu(this.base + e.fullPath)), Bu(this.router, e, r, !1), t && t(e);
              },
              n
            );
          }),
          (t.prototype.ensureURL = function (e) {
            if (pc(this.base) !== this.current.fullPath) {
              var t = tu(this.base + this.current.fullPath);
              e ? Ju(t) : Wu(t);
            }
          }),
          (t.prototype.getCurrentLocation = function () {
            return pc(this.base);
          }),
          t
        );
      })(sc);
      function pc(e) {
        var t = window.location.pathname,
          n = t.toLowerCase(),
          a = e.toLowerCase();
        return (
          !e || (n !== a && 0 !== n.indexOf(tu(a + "/"))) || (t = t.slice(e.length)),
          (t || "/") + window.location.search + window.location.hash
        );
      }
      var dc = ((e) => {
        function t(t, n, a) {
          e.call(this, t, n),
            (a &&
              ((e) => {
                var t = pc(e);
                if (!/^\/#/.test(t)) return window.location.replace(tu(e + "/#" + t)), !0;
              })(this.base)) ||
              yc();
        }
        return (
          e && (t.__proto__ = e),
          (t.prototype = Object.create(e && e.prototype)),
          (t.prototype.constructor = t),
          (t.prototype.setupListeners = function () {
            if (!(this.listeners.length > 0)) {
              var t = this.router.options.scrollBehavior,
                n = Ku && t;
              n && this.listeners.push(Du());
              var a = () => {
                  var t = this.current;
                  yc() &&
                    this.transitionTo(fc(), (a) => {
                      n && Bu(this.router, a, t, !0), Ku || hc(a.fullPath);
                    });
                },
                r = Ku ? "popstate" : "hashchange";
              window.addEventListener(r, a),
                this.listeners.push(() => {
                  window.removeEventListener(r, a);
                });
            }
          }),
          (t.prototype.push = function (e, t, n) {
            var r = this.current;
            this.transitionTo(
              e,
              (e) => {
                vc(e.fullPath), Bu(this.router, e, r, !1), t && t(e);
              },
              n
            );
          }),
          (t.prototype.replace = function (e, t, n) {
            var r = this.current;
            this.transitionTo(
              e,
              (e) => {
                hc(e.fullPath), Bu(this.router, e, r, !1), t && t(e);
              },
              n
            );
          }),
          (t.prototype.go = (e) => {
            window.history.go(e);
          }),
          (t.prototype.ensureURL = function (e) {
            var t = this.current.fullPath;
            fc() !== t && (e ? vc(t) : hc(t));
          }),
          (t.prototype.getCurrentLocation = () => fc()),
          t
        );
      })(sc);
      function yc() {
        var e = fc();
        return "/" === e.charAt(0) || (hc("/" + e), !1);
      }
      function fc() {
        var e = window.location.href,
          t = e.indexOf("#");
        return t < 0 ? "" : (e = e.slice(t + 1));
      }
      function mc(e) {
        var t = window.location.href,
          n = t.indexOf("#");
        return (n >= 0 ? t.slice(0, n) : t) + "#" + e;
      }
      function vc(e) {
        Ku ? Ju(mc(e)) : (window.location.hash = e);
      }
      function hc(e) {
        Ku ? Wu(mc(e)) : window.location.replace(mc(e));
      }
      var bc = ((e) => {
          function t(t, n) {
            e.call(this, t, n), (this.stack = []), (this.index = -1);
          }
          return (
            e && (t.__proto__ = e),
            (t.prototype = Object.create(e && e.prototype)),
            (t.prototype.constructor = t),
            (t.prototype.push = function (e, t, n) {
              this.transitionTo(
                e,
                (e) => {
                  (this.stack = this.stack.slice(0, this.index + 1).concat(e)),
                    this.index++,
                    t && t(e);
                },
                n
              );
            }),
            (t.prototype.replace = function (e, t, n) {
              this.transitionTo(
                e,
                (e) => {
                  (this.stack = this.stack.slice(0, this.index).concat(e)), t && t(e);
                },
                n
              );
            }),
            (t.prototype.go = function (e) {
              var n = this.index + e;
              if (!(n < 0 || n >= this.stack.length)) {
                var a = this.stack[n];
                this.confirmTransition(
                  a,
                  () => {
                    var e = this.current;
                    (this.index = n),
                      this.updateRoute(a),
                      this.router.afterHooks.forEach((t) => {
                        t && t(a, e);
                      });
                  },
                  (e) => {
                    tc(e, Xu.duplicated) && (this.index = n);
                  }
                );
              }
            }),
            (t.prototype.getCurrentLocation = function () {
              var e = this.stack[this.stack.length - 1];
              return e ? e.fullPath : "/";
            }),
            (t.prototype.ensureURL = () => {}),
            t
          );
        })(sc),
        gc = function (e) {
          void 0 === e && (e = {}),
            (this.app = null),
            (this.apps = []),
            (this.options = e),
            (this.beforeHooks = []),
            (this.resolveHooks = []),
            (this.afterHooks = []),
            (this.matcher = $u(e.routes || [], this));
          var t = e.mode || "hash";
          switch (
            ((this.fallback = "history" === t && !Ku && !1 !== e.fallback),
            this.fallback && (t = "hash"),
            ku || (t = "abstract"),
            (this.mode = t),
            t)
          ) {
            case "history":
              this.history = new lc(this, e.base);
              break;
            case "hash":
              this.history = new dc(this, e.base, this.fallback);
              break;
            case "abstract":
              this.history = new bc(this, e.base);
          }
        },
        Tc = { currentRoute: { configurable: !0 } };
      (gc.prototype.match = function (e, t, n) {
        return this.matcher.match(e, t, n);
      }),
        (Tc.currentRoute.get = function () {
          return this.history && this.history.current;
        }),
        (gc.prototype.init = function (e) {
          if (
            (this.apps.push(e),
            e.$once("hook:destroyed", () => {
              var n = this.apps.indexOf(e);
              n > -1 && this.apps.splice(n, 1),
                this.app === e && (this.app = this.apps[0] || null),
                this.app || this.history.teardown();
            }),
            !this.app)
          ) {
            this.app = e;
            var n = this.history;
            if (n instanceof lc || n instanceof dc) {
              var a = (e) => {
                n.setupListeners(),
                  ((e) => {
                    var a = n.current,
                      r = this.options.scrollBehavior;
                    Ku && r && "fullPath" in e && Bu(this, e, a, !1);
                  })(e);
              };
              n.transitionTo(n.getCurrentLocation(), a, a);
            }
            n.listen((e) => {
              this.apps.forEach((t) => {
                t._route = e;
              });
            });
          }
        }),
        (gc.prototype.beforeEach = function (e) {
          return wc(this.beforeHooks, e);
        }),
        (gc.prototype.beforeResolve = function (e) {
          return wc(this.resolveHooks, e);
        }),
        (gc.prototype.afterEach = function (e) {
          return wc(this.afterHooks, e);
        }),
        (gc.prototype.onReady = function (e, t) {
          this.history.onReady(e, t);
        }),
        (gc.prototype.onError = function (e) {
          this.history.onError(e);
        }),
        (gc.prototype.push = function (e, t, n) {
          if (!t && !n && "undefined" != typeof Promise)
            return new Promise((t, n) => {
              this.history.push(e, t, n);
            });
          this.history.push(e, t, n);
        }),
        (gc.prototype.replace = function (e, t, n) {
          if (!t && !n && "undefined" != typeof Promise)
            return new Promise((t, n) => {
              this.history.replace(e, t, n);
            });
          this.history.replace(e, t, n);
        }),
        (gc.prototype.go = function (e) {
          this.history.go(e);
        }),
        (gc.prototype.back = function () {
          this.go(-1);
        }),
        (gc.prototype.forward = function () {
          this.go(1);
        }),
        (gc.prototype.getMatchedComponents = function (e) {
          var t = e ? (e.matched ? e : this.resolve(e).route) : this.currentRoute;
          return t
            ? [].concat.apply(
                [],
                t.matched.map((e) => Object.keys(e.components).map((t) => e.components[t]))
              )
            : [];
        }),
        (gc.prototype.resolve = function (e, t, n) {
          var a = gu(e, (t = t || this.history.current), n, this),
            r = this.match(a, t),
            i = r.redirectedFrom || r.fullPath,
            o = ((e, t, n) => {
              var a = "hash" === n ? "#" + t : t;
              return e ? tu(e + "/" + a) : a;
            })(this.history.base, i, this.mode);
          return { location: a, route: r, href: o, normalizedTo: a, resolved: r };
        }),
        (gc.prototype.getRoutes = function () {
          return this.matcher.getRoutes();
        }),
        (gc.prototype.addRoute = function (e, t) {
          this.matcher.addRoute(e, t),
            this.history.current !== Gs &&
              this.history.transitionTo(this.history.getCurrentLocation());
        }),
        (gc.prototype.addRoutes = function (e) {
          this.matcher.addRoutes(e),
            this.history.current !== Gs &&
              this.history.transitionTo(this.history.getCurrentLocation());
        }),
        Object.defineProperties(gc.prototype, Tc);
      var _c = gc;
      function wc(e, t) {
        return (
          e.push(t),
          () => {
            var n = e.indexOf(t);
            n > -1 && e.splice(n, 1);
          }
        );
      }
      (gc.install = function e(t) {
        if (!e.installed || Tu !== t) {
          (e.installed = !0), (Tu = t);
          var n = (e) => void 0 !== e,
            a = (e, t) => {
              var a = e.$options._parentVnode;
              n(a) && n((a = a.data)) && n((a = a.registerRouteInstance)) && a(e, t);
            };
          t.mixin({
            beforeCreate: function () {
              n(this.$options.router)
                ? ((this._routerRoot = this),
                  (this._router = this.$options.router),
                  this._router.init(this),
                  t.util.defineReactive(this, "_route", this._router.history.current))
                : (this._routerRoot = (this.$parent && this.$parent._routerRoot) || this),
                a(this, this);
            },
            destroyed: function () {
              a(this);
            },
          }),
            Object.defineProperty(t.prototype, "$router", {
              get: function () {
                return this._routerRoot._router;
              },
            }),
            Object.defineProperty(t.prototype, "$route", {
              get: function () {
                return this._routerRoot._route;
              },
            }),
            t.component("RouterView", Ys),
            t.component("RouterLink", wu);
          var r = t.config.optionMergeStrategies;
          r.beforeRouteEnter = r.beforeRouteLeave = r.beforeRouteUpdate = r.created;
        }
      }),
        (gc.version = "3.6.5"),
        (gc.isNavigationFailure = tc),
        (gc.NavigationFailureType = Xu),
        (gc.START_LOCATION = Gs),
        ku && window.Vue && window.Vue.use(gc);
      var xc = function () {
        var e = this._self._c;
        return e(
          "div",
          { staticClass: "min-h-screen bg-gray-100 px-4 pt-6" },
          [e("router-view")],
          1
        );
      };
      function Cc(e, t, n, a, r, i, o, s) {
        var u,
          c = "function" == typeof e ? e.options : e;
        if (
          (t && ((c.render = t), (c.staticRenderFns = n), (c._compiled = !0)),
          a && (c.functional = !0),
          i && (c._scopeId = "data-v-" + i),
          o
            ? ((u = function (e) {
                (e =
                  e ||
                  (this.$vnode && this.$vnode.ssrContext) ||
                  (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext)) ||
                  "undefined" == typeof __VUE_SSR_CONTEXT__ ||
                  (e = __VUE_SSR_CONTEXT__),
                  r && r.call(this, e),
                  e && e._registeredComponents && e._registeredComponents.add(o);
              }),
              (c._ssrRegister = u))
            : r &&
              (u = s
                ? function () {
                    r.call(this, (c.functional ? this.parent : this).$root.$options.shadowRoot);
                  }
                : r),
          u)
        )
          if (c.functional) {
            c._injectStyles = u;
            var l = c.render;
            c.render = (e, t) => (u.call(t), l(e, t));
          } else {
            var p = c.beforeCreate;
            c.beforeCreate = p ? [].concat(p, u) : [u];
          }
        return { exports: e, options: c };
      }
      (xc._withStripped = !0), n(722);
      const kc = Cc({}, xc, [], !1, null, null, null).exports;
      var Ec = function () {
        var t = this._self._c;
        return t(
          "div",
          { staticClass: "w-full space-y-10 md:max-w-screen-sm lg:max-w-screen-md mx-auto" },
          [
            t("HeaderBar"),
            this._v(" "),
            t(
              "div",
              { staticClass: "pb-32" },
              [
                t("div", { staticClass: "space-y-4" }, [
                  t("span", { staticClass: "text-lg" }, [
                    this._v("\n        " + this._s(this.json.source) + "\n      "),
                  ]),
                  this._v(" "),
                  t("h1", { staticClass: "text-xl" }, [
                    this._v("\n        " + this._s(this.json.name) + "\n      "),
                  ]),
                  this._v(" "),
                  t("h2", { staticClass: "text-lg" }, [
                    this._v("\n        " + this._s(this.json.title) + "\n      "),
                  ]),
                  this._v(" "),
                  t("h2", { staticClass: "text-lg" }, [
                    this._v("\n        " + this._s(this.json.author) + "\n      "),
                  ]),
                  this._v(" "),
                  t("p", [this._v(this._s(this.json.notice))]),
                  this._v(" "),
                  t("p", [this._v(this._s(this.json.details))]),
                ]),
                this._v(" "),
                t(
                  "div",
                  { staticClass: "mt-8" },
                  [
                    Object.hasOwn(this.json, "constructor")
                      ? t("Member", { attrs: { json: this.json.constructor } })
                      : this._e(),
                  ],
                  1
                ),
                this._v(" "),
                t(
                  "div",
                  { staticClass: "mt-8" },
                  [
                    this.json.receive
                      ? t("Member", { attrs: { json: this.json.receive } })
                      : this._e(),
                  ],
                  1
                ),
                this._v(" "),
                t(
                  "div",
                  { staticClass: "mt-8" },
                  [
                    this.json.fallback
                      ? t("Member", { attrs: { json: this.json.fallback } })
                      : this._e(),
                  ],
                  1
                ),
                this._v(" "),
                this.json.events
                  ? t("MemberSet", { attrs: { title: "Events", json: this.json.events } })
                  : this._e(),
                this._v(" "),
                this.json.stateVariables
                  ? t("MemberSet", {
                      attrs: { title: "State Variables", json: this.json.stateVariables },
                    })
                  : this._e(),
                this._v(" "),
                this.json.methods
                  ? t("MemberSet", { attrs: { title: "Methods", json: this.json.methods } })
                  : this._e(),
              ],
              1
            ),
            this._v(" "),
            t("FooterBar"),
          ],
          1
        );
      };
      Ec._withStripped = !0;
      var Sc = function () {
        var t = this._self._c;
        return t(
          "div",
          {
            staticClass:
              "bg-gray-100 fixed bottom-0 right-0 w-full border-t border-dashed border-gray-300",
          },
          [
            t(
              "div",
              {
                staticClass:
                  "w-full text-center py-2 md:max-w-screen-sm lg:max-w-screen-md mx-auto",
              },
              [
                t(
                  "button",
                  {
                    staticClass: "py-1 px-2 text-gray-500",
                    on: {
                      click: (t) => this.openLink(this.repository),
                    },
                  },
                  [this._v("\n      built with " + this._s(this.name) + "\n    ")]
                ),
              ]
            ),
          ]
        );
      };
      Sc._withStripped = !0;
      const Rc = JSON.parse(
          '{"UU":"hardhat-docgen","Jk":"https://github.com/ItsNickBarry/hardhat-docgen"}'
        ),
        $c = Cc(
          {
            data: () => ({ repository: Rc.Jk, name: Rc.UU }),
            methods: {
              openLink(e) {
                window.open(e, "_blank");
              },
            },
          },
          Sc,
          [],
          !1,
          null,
          null,
          null
        ).exports;
      var Mc = function () {
        var e = this._self._c;
        return e(
          "div",
          { staticClass: "w-full border-b border-dashed py-2 border-gray-300" },
          [
            e("router-link", { staticClass: "py-2 text-gray-500", attrs: { to: "/" } }, [
              this._v("\n    <- Go back\n  "),
            ]),
          ],
          1
        );
      };
      Mc._withStripped = !0;
      const Oc = Cc({}, Mc, [], !1, null, null, null).exports;
      var Ac = function () {
        var t = this._self._c;
        return t("div", { staticClass: "border-2 border-gray-400 border-dashed w-full p-2" }, [
          t("h3", { staticClass: "text-lg pb-2 mb-2 border-b-2 border-gray-400 border-dashed" }, [
            this._v(
              "\n    " +
                this._s(this.name) +
                " " +
                this._s(this.keywords) +
                " " +
                this._s(this.inputSignature) +
                "\n  "
            ),
          ]),
          this._v(" "),
          t(
            "div",
            { staticClass: "space-y-3" },
            [
              t("p", [this._v(this._s(this.json.notice))]),
              this._v(" "),
              t("p", [this._v(this._s(this.json.details))]),
              this._v(" "),
              t("MemberSection", { attrs: { name: "Parameters", items: this.inputs } }),
              this._v(" "),
              t("MemberSection", { attrs: { name: "Return Values", items: this.outputs } }),
            ],
            1
          ),
        ]);
      };
      Ac._withStripped = !0;
      var Pc = function () {
        var t = this._self._c;
        return this.items.length > 0
          ? t(
              "ul",
              [
                t("h4", { staticClass: "text-lg" }, [
                  this._v("\n    " + this._s(this.name) + "\n  "),
                ]),
                this._v(" "),
                this._l(this.items, (n, a) =>
                  t("li", { key: a }, [
                    t("span", { staticClass: "bg-gray-300" }, [this._v(this._s(n.type))]),
                    this._v(" "),
                    t("b", [this._v(this._s(n.name || `_${a}`))]),
                    n.desc
                      ? t("span", [this._v(": "), t("i", [this._v(this._s(n.desc))])])
                      : this._e(),
                  ])
                ),
              ],
              2
            )
          : this._e();
      };
      Pc._withStripped = !0;
      const Lc = {
          components: {
            MemberSection: Cc(
              {
                props: {
                  name: { type: String, default: "" },
                  items: { type: Array, default: () => [] },
                },
              },
              Pc,
              [],
              !1,
              null,
              null,
              null
            ).exports,
          },
          props: { json: { type: Object, default: () => new Object() } },
          computed: {
            name: function () {
              return this.json.name || this.json.type;
            },
            keywords: function () {
              const e = [];
              return (
                this.json.stateMutability && e.push(this.json.stateMutability),
                "true" === this.json.anonymous && e.push("anonymous"),
                e.join(" ")
              );
            },
            params: function () {
              return this.json.params || {};
            },
            returns: function () {
              return this.json.returns || {};
            },
            inputs: function () {
              return (this.json.inputs || []).map((e) => ({ ...e, desc: this.params[e.name] }));
            },
            inputSignature: function () {
              return `(${this.inputs.map((e) => e.type).join(",")})`;
            },
            outputs: function () {
              return (this.json.outputs || []).map((e, t) => ({
                ...e,
                desc: this.returns[e.name || `_${t}`],
              }));
            },
            outputSignature: function () {
              return `(${this.outputs.map((e) => e.type).join(",")})`;
            },
          },
        },
        jc = Cc(Lc, Ac, [], !1, null, null, null).exports;
      var Ic = function () {
        var t = this._self._c;
        return t(
          "div",
          { staticClass: "w-full mt-8" },
          [
            t("h2", { staticClass: "text-lg" }, [this._v(this._s(this.title))]),
            this._v(" "),
            this._l(Object.keys(this.json), (n) =>
              t("Member", { key: n, staticClass: "mt-3", attrs: { json: this.json[n] } })
            ),
          ],
          2
        );
      };
      Ic._withStripped = !0;
      var Dc = Cc(
        {
          components: { Member: jc },
          props: {
            title: { type: String, default: "" },
            json: { type: Object, default: () => new Object() },
          },
        },
        Ic,
        [],
        !1,
        null,
        null,
        null
      );
      const Bc = Cc(
        {
          components: { Member: jc, MemberSet: Dc.exports, HeaderBar: Oc, FooterBar: $c },
          props: { json: { type: Object, default: () => new Object() } },
        },
        Ec,
        [],
        !1,
        null,
        null,
        null
      ).exports;
      var Nc = function () {
        var t = this._self._c;
        return t(
          "div",
          { staticClass: "w-full space-y-10 md:max-w-screen-sm lg:max-w-screen-md mx-auto pb-32" },
          [
            t("Branch", { attrs: { json: this.trees, name: "Sources:" } }),
            this._v(" "),
            t("FooterBar", { staticClass: "mt-20" }),
          ],
          1
        );
      };
      Nc._withStripped = !0;
      var Fc = function () {
        var t = this._self._c;
        return t("div", [
          this._v("\n  " + this._s(this.name) + "\n  "),
          Array.isArray(this.json)
            ? t(
                "div",
                { staticClass: "pl-5" },
                this._l(this.json, (n, a) =>
                  t(
                    "div",
                    { key: a },
                    [
                      t("router-link", { attrs: { to: `${n.source}:${n.name}` } }, [
                        this._v("\n        " + this._s(n.name) + "\n      "),
                      ]),
                    ],
                    1
                  )
                ),
                0
              )
            : t(
                "div",
                { staticClass: "pl-5" },
                this._l(Object.keys(this.json), (n) =>
                  t("div", { key: n }, [t("Branch", { attrs: { json: this.json[n], name: n } })], 1)
                ),
                0
              ),
        ]);
      };
      Fc._withStripped = !0;
      var Uc = Cc(
        {
          name: "Branch",
          props: {
            name: { type: String, default: null },
            json: { type: [Object, Array], default: () => new Object() },
          },
        },
        Fc,
        [],
        !1,
        null,
        null,
        null
      );
      const qc = Cc(
        {
          components: { Branch: Uc.exports, FooterBar: $c },
          props: { json: { type: Object, default: () => new Object() } },
          computed: {
            trees: function () {
              const e = {};
              for (const t in this.json)
                t.replace("/", "//")
                  .split(/\/(?=[^/])/)
                  .reduce(
                    function (e, n) {
                      if (!n.includes(":")) return (e[n] = e[n] || {}), e[n];
                      {
                        const [a] = n.split(":");
                        (e[a] = e[a] || []), e[a].push(this.json[t]);
                      }
                    }.bind(this),
                    e
                  );
              return e;
            },
          },
        },
        Nc,
        [],
        !1,
        null,
        null,
        null
      ).exports;
      Gn.use(_c);
      const Hc = {
        "contracts/BitPackedCharacterLib.sol:BitPackedCharacterLib": {
          source: "contracts/BitPackedCharacterLib.sol",
          name: "BitPackedCharacterLib",
          title: "BitPackedCharacterLib",
          details:
            "The shifts and masks are migration-specific and used by `ChainBrawler` and tests.",
          notice:
            "Utility library for packing and unpacking character core and progression fields         into two 256-bit storage words for gas-efficient migrations and tests.",
        },
        "contracts/BitPackedEnemyLib.sol:BitPackedEnemyLib": {
          source: "contracts/BitPackedEnemyLib.sol",
          name: "BitPackedEnemyLib",
          title: "BitPackedEnemyLib",
          details: "The enemy drop rate field was widened to support basis-points (0..10000).",
          notice: "Helpers to pack/unpack enemy base stats into a compact uint256 for testing.",
        },
        "contracts/ChainBrawler.sol:ChainBrawler": {
          source: "contracts/ChainBrawler.sol",
          name: "ChainBrawler",
          title: "ChainBrawler",
          details:
            "The contract provides compact, bitpacked character storage, owner      tunable enemy tables, mocked fee flows, and public helpers used by the      test harness. Many production-only surfaces are intentionally omitted      and test helpers are gated behind roles.",
          notice:
            "Migration-friendly, testable skeleton of the ChainBrawler game         contract used for unit tests and iterative refactoring.",
          constructor: { inputs: [], stateMutability: "nonpayable", type: "constructor" },
          events: {
            "CharacterStored(address)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "address", name: "player", type: "address" }],
              name: "CharacterStored",
              type: "event",
            },
            "CharacterUpdated(address)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "address", name: "player", type: "address" }],
              name: "CharacterUpdated",
              type: "event",
            },
            "ClassBaseUpdated(uint256)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "uint256", name: "classId", type: "uint256" }],
              name: "ClassBaseUpdated",
              type: "event",
            },
            "CombatRound(address,uint256,uint256,uint256,bool,bool)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "uint256", name: "round", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "playerDamage", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "enemyDamage", type: "uint256" },
                { indexed: !1, internalType: "bool", name: "playerCritical", type: "bool" },
                { indexed: !1, internalType: "bool", name: "enemyCritical", type: "bool" },
              ],
              name: "CombatRound",
              type: "event",
            },
            "EnemiesPopulated(uint256[])": {
              anonymous: !1,
              inputs: [{ indexed: !1, internalType: "uint256[]", name: "ids", type: "uint256[]" }],
              name: "EnemiesPopulated",
              type: "event",
            },
            "EnemyBaseStored(uint256)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "uint256", name: "id", type: "uint256" }],
              name: "EnemyBaseStored",
              type: "event",
            },
            "EnemyUpdated(uint256)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "uint256", name: "id", type: "uint256" }],
              name: "EnemyUpdated",
              type: "event",
            },
            "EquipmentDropped(address,uint256,uint256,uint256,uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !0, internalType: "uint256", name: "enemyId", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "combatBonus", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "enduranceBonus", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "defenseBonus", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "luckBonus", type: "uint256" },
              ],
              name: "EquipmentDropped",
              type: "event",
            },
            "FightResult(address,bool,bool,uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "bool", name: "victory", type: "bool" },
                { indexed: !1, internalType: "bool", name: "unresolved", type: "bool" },
                { indexed: !1, internalType: "uint256", name: "xpGained", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "points", type: "uint256" },
              ],
              name: "FightResult",
              type: "event",
            },
            "FightSummary(address,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256[],uint256[],uint256[],bool[],bool[])":
              {
                anonymous: !1,
                inputs: [
                  { indexed: !0, internalType: "address", name: "player", type: "address" },
                  { indexed: !1, internalType: "uint256", name: "enemyId", type: "uint256" },
                  { indexed: !1, internalType: "uint256", name: "roundsElapsed", type: "uint256" },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "playerStartEndurance",
                    type: "uint256",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "playerEndurance",
                    type: "uint256",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "enemyStartEndurance",
                    type: "uint256",
                  },
                  { indexed: !1, internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                  { indexed: !1, internalType: "bool", name: "victory", type: "bool" },
                  { indexed: !1, internalType: "bool", name: "unresolved", type: "bool" },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "roundNumbers",
                    type: "uint256[]",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "playerDamages",
                    type: "uint256[]",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "enemyDamages",
                    type: "uint256[]",
                  },
                  { indexed: !1, internalType: "bool[]", name: "playerCriticals", type: "bool[]" },
                  { indexed: !1, internalType: "bool[]", name: "enemyCriticals", type: "bool[]" },
                ],
                name: "FightSummary",
                type: "event",
              },
            "LevelScalingUpdated(uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "uint256", name: "level", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "bp", type: "uint256" },
              ],
              name: "LevelScalingUpdated",
              type: "event",
            },
            "LevelUp(address,uint256,uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "uint256", name: "newLevel", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "newCombat", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "newMaxEndurance", type: "uint256" },
              ],
              name: "LevelUp",
              type: "event",
            },
            "OwnershipTransferred(address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "previousOwner", type: "address" },
                { indexed: !0, internalType: "address", name: "newOwner", type: "address" },
              ],
              name: "OwnershipTransferred",
              type: "event",
            },
            "RoleAdminChanged(bytes32,bytes32,bytes32)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                {
                  indexed: !0,
                  internalType: "bytes32",
                  name: "previousAdminRole",
                  type: "bytes32",
                },
                { indexed: !0, internalType: "bytes32", name: "newAdminRole", type: "bytes32" },
              ],
              name: "RoleAdminChanged",
              type: "event",
              details:
                "Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole` `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite {RoleAdminChanged} not being emitted signaling this. _Available since v3.1._",
            },
            "RoleGranted(bytes32,address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                { indexed: !0, internalType: "address", name: "account", type: "address" },
                { indexed: !0, internalType: "address", name: "sender", type: "address" },
              ],
              name: "RoleGranted",
              type: "event",
              details:
                "Emitted when `account` is granted `role`. `sender` is the account that originated the contract call, an admin role bearer except when using {AccessControl-_setupRole}.",
            },
            "RoleRevoked(bytes32,address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                { indexed: !0, internalType: "address", name: "account", type: "address" },
                { indexed: !0, internalType: "address", name: "sender", type: "address" },
              ],
              name: "RoleRevoked",
              type: "event",
              details:
                "Emitted when `account` is revoked `role`. `sender` is the account that originated the contract call:   - if using `revokeRole`, it is the admin role bearer   - if using `renounceRole`, it is the role bearer (i.e. `account`)",
            },
          },
          methods: {
            "DEFAULT_ADMIN_ROLE()": {
              inputs: [],
              name: "DEFAULT_ADMIN_ROLE",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
            },
            "MAX_DROP_RATE_BP()": {
              inputs: [],
              name: "MAX_DROP_RATE_BP",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "TEST_HELPER_ROLE()": {
              inputs: [],
              name: "TEST_HELPER_ROLE",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
            },
            "applyRegenAndGetTotalStats(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "applyRegenAndGetTotalStats",
              outputs: [
                { internalType: "uint256", name: "totalCombat", type: "uint256" },
                { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalDefense", type: "uint256" },
                { internalType: "uint256", name: "totalLuck", type: "uint256" },
                { internalType: "uint256", name: "appliedRegen", type: "uint256" },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            "cachePackedCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "cachePackedCharacter",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "cachePackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "cachePackedEnemy",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "continueFight()": {
              inputs: [],
              name: "continueFight",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "createCharacter(uint256)": {
              inputs: [{ internalType: "uint256", name: "characterClass", type: "uint256" }],
              name: "createCharacter",
              outputs: [],
              stateMutability: "payable",
              type: "function",
              details:
                "Requires payment of the creation fee. Uses an overridable RNG      `_randomSeed` so unit tests can deterministically generate stats.",
              params: { characterClass: "The class id to use when generating base stats." },
              notice: "Create a new character for the caller.",
            },
            "currentEnemyId()": {
              inputs: [],
              name: "currentEnemyId",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "developerFund()": {
              inputs: [],
              name: "developerFund",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "expectedPackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "expectedPackedEnemy",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "pure",
              type: "function",
            },
            "external_getScaledEnemyStats(uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "playerLevel", type: "uint256" },
              ],
              name: "external_getScaledEnemyStats",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "external_getScaledEnemyStats(uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "playerLevel", type: "uint256" },
                { internalType: "uint256", name: "enemyLevel", type: "uint256" },
              ],
              name: "external_getScaledEnemyStats",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "fightEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "enemyId", type: "uint256" }],
              name: "fightEnemy",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "fleeRound()": {
              inputs: [],
              name: "fleeRound",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "getAccumulatedRegen(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getAccumulatedRegen",
              outputs: [{ internalType: "uint256", name: "pendingRegen", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "getCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getCharacter",
              outputs: [
                {
                  components: [
                    { internalType: "uint256", name: "level", type: "uint256" },
                    { internalType: "uint256", name: "experience", type: "uint256" },
                    { internalType: "uint256", name: "points", type: "uint256" },
                    { internalType: "uint256", name: "total_points", type: "uint256" },
                    { internalType: "uint256", name: "totalKills", type: "uint256" },
                    { internalType: "bool", name: "isAlive", type: "bool" },
                    { internalType: "uint256", name: "currentEndurance", type: "uint256" },
                    { internalType: "uint256", name: "maxEndurance", type: "uint256" },
                    { internalType: "uint256", name: "totalCombat", type: "uint256" },
                    { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                    { internalType: "uint256", name: "totalDefense", type: "uint256" },
                    { internalType: "uint256", name: "totalLuck", type: "uint256" },
                    { internalType: "uint256", name: "equippedCombatBonus", type: "uint256" },
                    { internalType: "uint256", name: "equippedEnduranceBonus", type: "uint256" },
                    { internalType: "uint256", name: "equippedDefenseBonus", type: "uint256" },
                    { internalType: "uint256", name: "equippedLuckBonus", type: "uint256" },
                  ],
                  internalType: "struct BitPackedCharacterLib.Character",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getClassBase(uint256)": {
              inputs: [{ internalType: "uint256", name: "classId", type: "uint256" }],
              name: "getClassBase",
              outputs: [
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getCurrentEndurance(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getCurrentEndurance",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "getEnemyBase(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "getEnemyBase",
              outputs: [
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "xpReward", type: "uint256" },
                { internalType: "uint256", name: "dropRate", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getPackedCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getPackedCharacter",
              outputs: [
                { internalType: "uint256", name: "coreStats", type: "uint256" },
                { internalType: "uint256", name: "progressionStats", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getPackedCharacterIsCached(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getPackedCharacterIsCached",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "getPackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "getPackedEnemy",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "getPackedEnemyIsCached(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "getPackedEnemyIsCached",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "getPlayerSummary(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getPlayerSummary",
              outputs: [
                { internalType: "uint256", name: "level", type: "uint256" },
                { internalType: "uint256", name: "experience", type: "uint256" },
                { internalType: "uint256", name: "points", type: "uint256" },
                { internalType: "uint256", name: "total_points", type: "uint256" },
                { internalType: "uint256", name: "totalKills", type: "uint256" },
                { internalType: "bool", name: "isAliveFlag", type: "bool" },
                { internalType: "uint256", name: "currentEndurance", type: "uint256" },
                { internalType: "uint256", name: "maxEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalCombat", type: "uint256" },
                { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalDefense", type: "uint256" },
                { internalType: "uint256", name: "totalLuck", type: "uint256" },
                { internalType: "uint256", name: "equippedCombatBonus", type: "uint256" },
                { internalType: "uint256", name: "equippedEnduranceBonus", type: "uint256" },
                { internalType: "uint256", name: "equippedDefenseBonus", type: "uint256" },
                { internalType: "uint256", name: "equippedLuckBonus", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getRoleAdmin(bytes32)": {
              inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
              name: "getRoleAdmin",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
              details:
                "Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role's admin, use {_setRoleAdmin}.",
            },
            "getTotalStats(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getTotalStats",
              outputs: [
                { internalType: "uint256", name: "totalCombat", type: "uint256" },
                { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalDefense", type: "uint256" },
                { internalType: "uint256", name: "totalLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getXPRequiredForLevel(uint256)": {
              inputs: [{ internalType: "uint256", name: "level", type: "uint256" }],
              name: "getXPRequiredForLevel",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "pure",
              type: "function",
            },
            "grantRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "grantRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleGranted} event.",
            },
            "hasRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "hasRole",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
              details: "Returns `true` if `account` has been granted `role`.",
            },
            "healCharacter()": {
              inputs: [],
              name: "healCharacter",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            "invalidatePackedCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "invalidatePackedCharacter",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "invalidatePackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "invalidatePackedEnemy",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "isAlive(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "isAlive",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "owner()": {
              inputs: [],
              name: "owner",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
            "populateEnemies(uint256[])": {
              inputs: [{ internalType: "uint256[]", name: "ids", type: "uint256[]" }],
              name: "populateEnemies",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "prizePool()": {
              inputs: [],
              name: "prizePool",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "renounceRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "renounceRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function's purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.",
            },
            "resurrectCharacter()": {
              inputs: [],
              name: "resurrectCharacter",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            "revokeRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "revokeRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleRevoked} event.",
            },
            "setCharacterPacked(address,uint256,uint256)": {
              inputs: [
                { internalType: "address", name: "player", type: "address" },
                { internalType: "uint256", name: "coreStats", type: "uint256" },
                { internalType: "uint256", name: "progressionStats", type: "uint256" },
              ],
              name: "setCharacterPacked",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setCharacterStored(address,uint256,uint256)": {
              inputs: [
                { internalType: "address", name: "player", type: "address" },
                { internalType: "uint256", name: "coreStats", type: "uint256" },
                { internalType: "uint256", name: "progressionStats", type: "uint256" },
              ],
              name: "setCharacterStored",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setClassBase(uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "classId", type: "uint256" },
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
              ],
              name: "setClassBase",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              params: {
                baseCombat: "Base combat skill",
                baseDefense: "Base defense",
                baseEndurance: "Base endurance (max health)",
                baseLuck: "Base luck",
                classId: "Class identifier",
              },
              notice:
                "Owner-settable per-class base stats used for deterministic tests and live tuning.",
            },
            "setEnemyBase(uint256,uint256,uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "id", type: "uint256" },
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "xpReward", type: "uint256" },
                { internalType: "uint256", name: "dropRate", type: "uint256" },
              ],
              name: "setEnemyBase",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setEnemyBaseStored(uint256,uint256,uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "id", type: "uint256" },
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "xpReward", type: "uint256" },
                { internalType: "uint256", name: "dropRate", type: "uint256" },
              ],
              name: "setEnemyBaseStored",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setLevelScalingBP(uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "level", type: "uint256" },
                { internalType: "uint256", name: "bp", type: "uint256" },
              ],
              name: "setLevelScalingBP",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "supportsInterface(bytes4)": {
              inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
              name: "supportsInterface",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
              details: "See {IERC165-supportsInterface}.",
            },
            "testAllowExtraRound(address)": {
              inputs: [{ internalType: "address", name: "", type: "address" }],
              name: "testAllowExtraRound",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "verifyLeaderboardProof(bytes32,uint256,address,uint256,bytes32[])": {
              inputs: [
                { internalType: "bytes32", name: "", type: "bytes32" },
                { internalType: "uint256", name: "", type: "uint256" },
                { internalType: "address", name: "", type: "address" },
                { internalType: "uint256", name: "", type: "uint256" },
                { internalType: "bytes32[]", name: "", type: "bytes32[]" },
              ],
              name: "verifyLeaderboardProof",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "pure",
              type: "function",
            },
            "withdraw()": {
              inputs: [],
              name: "withdraw",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          },
        },
        "contracts/CombatConfig.sol:CombatConfig": {
          source: "contracts/CombatConfig.sol",
          name: "CombatConfig",
          title: "CombatConfig",
          details: "Contains tables and constants used in deterministic test computations.",
          notice: "Centralized combat tunables used by `CombatMath` and `CombatEngine`.",
        },
        "contracts/CombatEngine.sol:CombatEngine": {
          source: "contracts/CombatEngine.sol",
          name: "CombatEngine",
          title: "CombatEngine",
          details:
            "This contract implements a deterministic, testable fight loop that      performs up to a fixed number of rounds and persists incomplete      `CombatState` for later resumption. Tests and derived contracts may      override hooks such as `getScaledEnemyStats_internal`, `checkLevelUp`,      and `_maybeDropAndAutoEquip` to control game-specific behavior.",
          notice: "Core fight orchestration logic for ChainBrawler migration testing.",
          events: {
            "CombatRound(address,uint256,uint256,uint256,bool,bool)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "uint256", name: "round", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "playerDamage", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "enemyDamage", type: "uint256" },
                { indexed: !1, internalType: "bool", name: "playerCritical", type: "bool" },
                { indexed: !1, internalType: "bool", name: "enemyCritical", type: "bool" },
              ],
              name: "CombatRound",
              type: "event",
            },
            "FightResult(address,bool,bool,uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "bool", name: "victory", type: "bool" },
                { indexed: !1, internalType: "bool", name: "unresolved", type: "bool" },
                { indexed: !1, internalType: "uint256", name: "xpGained", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "points", type: "uint256" },
              ],
              name: "FightResult",
              type: "event",
            },
            "FightSummary(address,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256[],uint256[],uint256[],bool[],bool[])":
              {
                anonymous: !1,
                inputs: [
                  { indexed: !0, internalType: "address", name: "player", type: "address" },
                  { indexed: !1, internalType: "uint256", name: "enemyId", type: "uint256" },
                  { indexed: !1, internalType: "uint256", name: "roundsElapsed", type: "uint256" },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "playerStartEndurance",
                    type: "uint256",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "playerEndurance",
                    type: "uint256",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "enemyStartEndurance",
                    type: "uint256",
                  },
                  { indexed: !1, internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                  { indexed: !1, internalType: "bool", name: "victory", type: "bool" },
                  { indexed: !1, internalType: "bool", name: "unresolved", type: "bool" },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "roundNumbers",
                    type: "uint256[]",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "playerDamages",
                    type: "uint256[]",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "enemyDamages",
                    type: "uint256[]",
                  },
                  { indexed: !1, internalType: "bool[]", name: "playerCriticals", type: "bool[]" },
                  { indexed: !1, internalType: "bool[]", name: "enemyCriticals", type: "bool[]" },
                ],
                name: "FightSummary",
                type: "event",
              },
          },
          methods: {
            "currentEnemyId()": {
              inputs: [],
              name: "currentEnemyId",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
          },
        },
        "contracts/CombatMath.sol:CombatMath": {
          source: "contracts/CombatMath.sol",
          name: "CombatMath",
          title: "CombatMath",
          details: "Tests rely on deterministic output from `performRound` given identical inputs.",
          notice: "Pure, deterministic math helpers used by the combat engine.",
        },
        "contracts/IChainBrawlerTestHelpers.sol:IChainBrawlerTestHelpers": {
          source: "contracts/IChainBrawlerTestHelpers.sol",
          name: "IChainBrawlerTestHelpers",
        },
        "contracts/MockChainBrawler.sol:MockChainBrawler": {
          source: "contracts/MockChainBrawler.sol",
          name: "MockChainBrawler",
          constructor: {
            inputs: [{ internalType: "uint256", name: "_seed", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "constructor",
          },
          events: {
            "CharacterStored(address)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "address", name: "player", type: "address" }],
              name: "CharacterStored",
              type: "event",
            },
            "CharacterUpdated(address)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "address", name: "player", type: "address" }],
              name: "CharacterUpdated",
              type: "event",
            },
            "ClassBaseUpdated(uint256)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "uint256", name: "classId", type: "uint256" }],
              name: "ClassBaseUpdated",
              type: "event",
            },
            "CombatRound(address,uint256,uint256,uint256,bool,bool)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "uint256", name: "round", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "playerDamage", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "enemyDamage", type: "uint256" },
                { indexed: !1, internalType: "bool", name: "playerCritical", type: "bool" },
                { indexed: !1, internalType: "bool", name: "enemyCritical", type: "bool" },
              ],
              name: "CombatRound",
              type: "event",
            },
            "EnemiesPopulated(uint256[])": {
              anonymous: !1,
              inputs: [{ indexed: !1, internalType: "uint256[]", name: "ids", type: "uint256[]" }],
              name: "EnemiesPopulated",
              type: "event",
            },
            "EnemyBaseStored(uint256)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "uint256", name: "id", type: "uint256" }],
              name: "EnemyBaseStored",
              type: "event",
            },
            "EnemyUpdated(uint256)": {
              anonymous: !1,
              inputs: [{ indexed: !0, internalType: "uint256", name: "id", type: "uint256" }],
              name: "EnemyUpdated",
              type: "event",
            },
            "EquipmentDropped(address,uint256,uint256,uint256,uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !0, internalType: "uint256", name: "enemyId", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "combatBonus", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "enduranceBonus", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "defenseBonus", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "luckBonus", type: "uint256" },
              ],
              name: "EquipmentDropped",
              type: "event",
            },
            "FightResult(address,bool,bool,uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "bool", name: "victory", type: "bool" },
                { indexed: !1, internalType: "bool", name: "unresolved", type: "bool" },
                { indexed: !1, internalType: "uint256", name: "xpGained", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "points", type: "uint256" },
              ],
              name: "FightResult",
              type: "event",
            },
            "FightSummary(address,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256[],uint256[],uint256[],bool[],bool[])":
              {
                anonymous: !1,
                inputs: [
                  { indexed: !0, internalType: "address", name: "player", type: "address" },
                  { indexed: !1, internalType: "uint256", name: "enemyId", type: "uint256" },
                  { indexed: !1, internalType: "uint256", name: "roundsElapsed", type: "uint256" },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "playerStartEndurance",
                    type: "uint256",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "playerEndurance",
                    type: "uint256",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256",
                    name: "enemyStartEndurance",
                    type: "uint256",
                  },
                  { indexed: !1, internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                  { indexed: !1, internalType: "bool", name: "victory", type: "bool" },
                  { indexed: !1, internalType: "bool", name: "unresolved", type: "bool" },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "roundNumbers",
                    type: "uint256[]",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "playerDamages",
                    type: "uint256[]",
                  },
                  {
                    indexed: !1,
                    internalType: "uint256[]",
                    name: "enemyDamages",
                    type: "uint256[]",
                  },
                  { indexed: !1, internalType: "bool[]", name: "playerCriticals", type: "bool[]" },
                  { indexed: !1, internalType: "bool[]", name: "enemyCriticals", type: "bool[]" },
                ],
                name: "FightSummary",
                type: "event",
              },
            "LevelScalingUpdated(uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "uint256", name: "level", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "bp", type: "uint256" },
              ],
              name: "LevelScalingUpdated",
              type: "event",
            },
            "LevelUp(address,uint256,uint256,uint256)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "player", type: "address" },
                { indexed: !1, internalType: "uint256", name: "newLevel", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "newCombat", type: "uint256" },
                { indexed: !1, internalType: "uint256", name: "newMaxEndurance", type: "uint256" },
              ],
              name: "LevelUp",
              type: "event",
            },
            "OwnershipTransferred(address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "address", name: "previousOwner", type: "address" },
                { indexed: !0, internalType: "address", name: "newOwner", type: "address" },
              ],
              name: "OwnershipTransferred",
              type: "event",
            },
            "RoleAdminChanged(bytes32,bytes32,bytes32)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                {
                  indexed: !0,
                  internalType: "bytes32",
                  name: "previousAdminRole",
                  type: "bytes32",
                },
                { indexed: !0, internalType: "bytes32", name: "newAdminRole", type: "bytes32" },
              ],
              name: "RoleAdminChanged",
              type: "event",
              details:
                "Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole` `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite {RoleAdminChanged} not being emitted signaling this. _Available since v3.1._",
            },
            "RoleGranted(bytes32,address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                { indexed: !0, internalType: "address", name: "account", type: "address" },
                { indexed: !0, internalType: "address", name: "sender", type: "address" },
              ],
              name: "RoleGranted",
              type: "event",
              details:
                "Emitted when `account` is granted `role`. `sender` is the account that originated the contract call, an admin role bearer except when using {AccessControl-_setupRole}.",
            },
            "RoleRevoked(bytes32,address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                { indexed: !0, internalType: "address", name: "account", type: "address" },
                { indexed: !0, internalType: "address", name: "sender", type: "address" },
              ],
              name: "RoleRevoked",
              type: "event",
              details:
                "Emitted when `account` is revoked `role`. `sender` is the account that originated the contract call:   - if using `revokeRole`, it is the admin role bearer   - if using `renounceRole`, it is the role bearer (i.e. `account`)",
            },
          },
          methods: {
            "DEFAULT_ADMIN_ROLE()": {
              inputs: [],
              name: "DEFAULT_ADMIN_ROLE",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
            },
            "MAX_DROP_RATE_BP()": {
              inputs: [],
              name: "MAX_DROP_RATE_BP",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "TEST_HELPER_ROLE()": {
              inputs: [],
              name: "TEST_HELPER_ROLE",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
            },
            "applyRegenAndGetTotalStats(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "applyRegenAndGetTotalStats",
              outputs: [
                { internalType: "uint256", name: "totalCombat", type: "uint256" },
                { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalDefense", type: "uint256" },
                { internalType: "uint256", name: "totalLuck", type: "uint256" },
                { internalType: "uint256", name: "appliedRegen", type: "uint256" },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            "cachePackedCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "cachePackedCharacter",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "cachePackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "cachePackedEnemy",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "continueFight()": {
              inputs: [],
              name: "continueFight",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "createCharacter(uint256)": {
              inputs: [{ internalType: "uint256", name: "characterClass", type: "uint256" }],
              name: "createCharacter",
              outputs: [],
              stateMutability: "payable",
              type: "function",
              details:
                "Requires payment of the creation fee. Uses an overridable RNG      `_randomSeed` so unit tests can deterministically generate stats.",
              params: { characterClass: "The class id to use when generating base stats." },
              notice: "Create a new character for the caller.",
            },
            "currentEnemyId()": {
              inputs: [],
              name: "currentEnemyId",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "developerFund()": {
              inputs: [],
              name: "developerFund",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "expectedPackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "expectedPackedEnemy",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "pure",
              type: "function",
            },
            "external_checkLevelUp(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "external_checkLevelUp",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "external_getScaledEnemyStats(uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "playerLevel", type: "uint256" },
              ],
              name: "external_getScaledEnemyStats",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "external_getScaledEnemyStats(uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "playerLevel", type: "uint256" },
                { internalType: "uint256", name: "enemyLevel", type: "uint256" },
              ],
              name: "external_getScaledEnemyStats",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "external_maybeDropAndAutoEquip(address,uint256,uint256)": {
              inputs: [
                { internalType: "address", name: "player", type: "address" },
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "xpGained", type: "uint256" },
              ],
              name: "external_maybeDropAndAutoEquip",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "fightEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "enemyId", type: "uint256" }],
              name: "fightEnemy",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "fleeRound()": {
              inputs: [],
              name: "fleeRound",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "getAccumulatedRegen(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getAccumulatedRegen",
              outputs: [{ internalType: "uint256", name: "pendingRegen", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "getCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getCharacter",
              outputs: [
                {
                  components: [
                    { internalType: "uint256", name: "level", type: "uint256" },
                    { internalType: "uint256", name: "experience", type: "uint256" },
                    { internalType: "uint256", name: "points", type: "uint256" },
                    { internalType: "uint256", name: "total_points", type: "uint256" },
                    { internalType: "uint256", name: "totalKills", type: "uint256" },
                    { internalType: "bool", name: "isAlive", type: "bool" },
                    { internalType: "uint256", name: "currentEndurance", type: "uint256" },
                    { internalType: "uint256", name: "maxEndurance", type: "uint256" },
                    { internalType: "uint256", name: "totalCombat", type: "uint256" },
                    { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                    { internalType: "uint256", name: "totalDefense", type: "uint256" },
                    { internalType: "uint256", name: "totalLuck", type: "uint256" },
                    { internalType: "uint256", name: "equippedCombatBonus", type: "uint256" },
                    { internalType: "uint256", name: "equippedEnduranceBonus", type: "uint256" },
                    { internalType: "uint256", name: "equippedDefenseBonus", type: "uint256" },
                    { internalType: "uint256", name: "equippedLuckBonus", type: "uint256" },
                  ],
                  internalType: "struct BitPackedCharacterLib.Character",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getClassBase(uint256)": {
              inputs: [{ internalType: "uint256", name: "classId", type: "uint256" }],
              name: "getClassBase",
              outputs: [
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getCurrentEndurance(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getCurrentEndurance",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "getEnemyBase(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "getEnemyBase",
              outputs: [
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "xpReward", type: "uint256" },
                { internalType: "uint256", name: "dropRate", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getPackedCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getPackedCharacter",
              outputs: [
                { internalType: "uint256", name: "coreStats", type: "uint256" },
                { internalType: "uint256", name: "progressionStats", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getPackedCharacterIsCached(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getPackedCharacterIsCached",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "getPackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "getPackedEnemy",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "getPackedEnemyIsCached(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "getPackedEnemyIsCached",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "getPlayerSummary(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getPlayerSummary",
              outputs: [
                { internalType: "uint256", name: "level", type: "uint256" },
                { internalType: "uint256", name: "experience", type: "uint256" },
                { internalType: "uint256", name: "points", type: "uint256" },
                { internalType: "uint256", name: "total_points", type: "uint256" },
                { internalType: "uint256", name: "totalKills", type: "uint256" },
                { internalType: "bool", name: "isAliveFlag", type: "bool" },
                { internalType: "uint256", name: "currentEndurance", type: "uint256" },
                { internalType: "uint256", name: "maxEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalCombat", type: "uint256" },
                { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalDefense", type: "uint256" },
                { internalType: "uint256", name: "totalLuck", type: "uint256" },
                { internalType: "uint256", name: "equippedCombatBonus", type: "uint256" },
                { internalType: "uint256", name: "equippedEnduranceBonus", type: "uint256" },
                { internalType: "uint256", name: "equippedDefenseBonus", type: "uint256" },
                { internalType: "uint256", name: "equippedLuckBonus", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getRoleAdmin(bytes32)": {
              inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
              name: "getRoleAdmin",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
              details:
                "Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role's admin, use {_setRoleAdmin}.",
            },
            "getTotalStats(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "getTotalStats",
              outputs: [
                { internalType: "uint256", name: "totalCombat", type: "uint256" },
                { internalType: "uint256", name: "totalEndurance", type: "uint256" },
                { internalType: "uint256", name: "totalDefense", type: "uint256" },
                { internalType: "uint256", name: "totalLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getXPRequiredForLevel(uint256)": {
              inputs: [{ internalType: "uint256", name: "level", type: "uint256" }],
              name: "getXPRequiredForLevel",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "pure",
              type: "function",
            },
            "grantRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "grantRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleGranted} event.",
            },
            "hasRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "hasRole",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
              details: "Returns `true` if `account` has been granted `role`.",
            },
            "healCharacter()": {
              inputs: [],
              name: "healCharacter",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            "invalidatePackedCharacter(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "invalidatePackedCharacter",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "invalidatePackedEnemy(uint256)": {
              inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
              name: "invalidatePackedEnemy",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "isAlive(address)": {
              inputs: [{ internalType: "address", name: "player", type: "address" }],
              name: "isAlive",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "owner()": {
              inputs: [],
              name: "owner",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
            "populateEnemies(uint256[])": {
              inputs: [{ internalType: "uint256[]", name: "ids", type: "uint256[]" }],
              name: "populateEnemies",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "prizePool()": {
              inputs: [],
              name: "prizePool",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            "renounceRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "renounceRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function's purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.",
            },
            "resurrectCharacter()": {
              inputs: [],
              name: "resurrectCharacter",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            "revokeRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "revokeRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleRevoked} event.",
            },
            "setCharacterPacked(address,uint256,uint256)": {
              inputs: [
                { internalType: "address", name: "player", type: "address" },
                { internalType: "uint256", name: "coreStats", type: "uint256" },
                { internalType: "uint256", name: "progressionStats", type: "uint256" },
              ],
              name: "setCharacterPacked",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setCharacterStored(address,uint256,uint256)": {
              inputs: [
                { internalType: "address", name: "player", type: "address" },
                { internalType: "uint256", name: "coreStats", type: "uint256" },
                { internalType: "uint256", name: "progressionStats", type: "uint256" },
              ],
              name: "setCharacterStored",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setClassBase(uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "classId", type: "uint256" },
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
              ],
              name: "setClassBase",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              params: {
                baseCombat: "Base combat skill",
                baseDefense: "Base defense",
                baseEndurance: "Base endurance (max health)",
                baseLuck: "Base luck",
                classId: "Class identifier",
              },
              notice:
                "Owner-settable per-class base stats used for deterministic tests and live tuning.",
            },
            "setEnemyBase(uint256,uint256,uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "id", type: "uint256" },
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "xpReward", type: "uint256" },
                { internalType: "uint256", name: "dropRate", type: "uint256" },
              ],
              name: "setEnemyBase",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setEnemyBaseStored(uint256,uint256,uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "id", type: "uint256" },
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "xpReward", type: "uint256" },
                { internalType: "uint256", name: "dropRate", type: "uint256" },
              ],
              name: "setEnemyBaseStored",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setLevelScalingBP(uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "level", type: "uint256" },
                { internalType: "uint256", name: "bp", type: "uint256" },
              ],
              name: "setLevelScalingBP",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "setSeed(uint256)": {
              inputs: [{ internalType: "uint256", name: "s", type: "uint256" }],
              name: "setSeed",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            "supportsInterface(bytes4)": {
              inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
              name: "supportsInterface",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
              details: "See {IERC165-supportsInterface}.",
            },
            "testAllowExtraRound(address)": {
              inputs: [{ internalType: "address", name: "", type: "address" }],
              name: "testAllowExtraRound",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            "verifyLeaderboardProof(bytes32,uint256,address,uint256,bytes32[])": {
              inputs: [
                { internalType: "bytes32", name: "", type: "bytes32" },
                { internalType: "uint256", name: "", type: "uint256" },
                { internalType: "address", name: "", type: "address" },
                { internalType: "uint256", name: "", type: "uint256" },
                { internalType: "bytes32[]", name: "", type: "bytes32[]" },
              ],
              name: "verifyLeaderboardProof",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "pure",
              type: "function",
            },
            "withdraw()": {
              inputs: [],
              name: "withdraw",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          },
        },
        "contracts/SafePacker.sol:SafePacker": {
          source: "contracts/SafePacker.sol",
          name: "SafePacker",
          title: "SafePacker",
          details:
            "Used across the migration contract to avoid overflow when writing packed fields.",
          notice: "Small helper to safely write into bitpacked slots with clamping.",
        },
        "contracts/StructuralTypes.sol:StructuralTypes": {
          source: "contracts/StructuralTypes.sol",
          name: "StructuralTypes",
        },
        "contracts/TestCombatMathWrapper.sol:TestCombatMathWrapper": {
          source: "contracts/TestCombatMathWrapper.sol",
          name: "TestCombatMathWrapper",
          methods: {
            "performRound(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "combatSkill", type: "uint256" },
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "defense", type: "uint256" },
                { internalType: "uint256", name: "currentEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyCurrentEndurance", type: "uint256" },
                { internalType: "uint256", name: "playerLuck", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              name: "performRound",
              outputs: [
                { internalType: "uint256", name: "newPlayerEndurance", type: "uint256" },
                { internalType: "uint256", name: "newEnemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "playerDamage", type: "uint256" },
                { internalType: "uint256", name: "enemyDamage", type: "uint256" },
                { internalType: "bool", name: "playerDied", type: "bool" },
                { internalType: "bool", name: "playerCritical", type: "bool" },
                { internalType: "bool", name: "enemyCritical", type: "bool" },
              ],
              stateMutability: "pure",
              type: "function",
            },
            "scaleEnemyForLevel(uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "level", type: "uint256" },
              ],
              name: "scaleEnemyForLevel",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "pure",
              type: "function",
            },
          },
        },
        "contracts/TestHelperBridge.sol:IChainBrawlerInternal": {
          source: "contracts/TestHelperBridge.sol",
          name: "IChainBrawlerInternal",
          methods: {
            "external_getScaledEnemyStats(uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "playerLevel", type: "uint256" },
                { internalType: "uint256", name: "enemyLevel", type: "uint256" },
              ],
              name: "external_getScaledEnemyStats",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
          },
        },
        "contracts/TestHelperBridge.sol:TestHelperBridge": {
          source: "contracts/TestHelperBridge.sol",
          name: "TestHelperBridge",
          constructor: {
            inputs: [{ internalType: "address", name: "targetAddr", type: "address" }],
            stateMutability: "nonpayable",
            type: "constructor",
          },
          events: {
            "RoleAdminChanged(bytes32,bytes32,bytes32)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                {
                  indexed: !0,
                  internalType: "bytes32",
                  name: "previousAdminRole",
                  type: "bytes32",
                },
                { indexed: !0, internalType: "bytes32", name: "newAdminRole", type: "bytes32" },
              ],
              name: "RoleAdminChanged",
              type: "event",
              details:
                "Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole` `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite {RoleAdminChanged} not being emitted signaling this. _Available since v3.1._",
            },
            "RoleGranted(bytes32,address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                { indexed: !0, internalType: "address", name: "account", type: "address" },
                { indexed: !0, internalType: "address", name: "sender", type: "address" },
              ],
              name: "RoleGranted",
              type: "event",
              details:
                "Emitted when `account` is granted `role`. `sender` is the account that originated the contract call, an admin role bearer except when using {AccessControl-_setupRole}.",
            },
            "RoleRevoked(bytes32,address,address)": {
              anonymous: !1,
              inputs: [
                { indexed: !0, internalType: "bytes32", name: "role", type: "bytes32" },
                { indexed: !0, internalType: "address", name: "account", type: "address" },
                { indexed: !0, internalType: "address", name: "sender", type: "address" },
              ],
              name: "RoleRevoked",
              type: "event",
              details:
                "Emitted when `account` is revoked `role`. `sender` is the account that originated the contract call:   - if using `revokeRole`, it is the admin role bearer   - if using `renounceRole`, it is the role bearer (i.e. `account`)",
            },
          },
          methods: {
            "DEFAULT_ADMIN_ROLE()": {
              inputs: [],
              name: "DEFAULT_ADMIN_ROLE",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
            },
            "TEST_HELPER_ROLE()": {
              inputs: [],
              name: "TEST_HELPER_ROLE",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
            },
            "bridge_getScaledEnemyStats(uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "playerLevel", type: "uint256" },
              ],
              name: "bridge_getScaledEnemyStats",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "bridge_getScaledEnemyStats_explicit(uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "enemyId", type: "uint256" },
                { internalType: "uint256", name: "playerLevel", type: "uint256" },
                { internalType: "uint256", name: "enemyLevel", type: "uint256" },
              ],
              name: "bridge_getScaledEnemyStats_explicit",
              outputs: [
                { internalType: "uint256", name: "enemyCombat", type: "uint256" },
                { internalType: "uint256", name: "enemyEndurance", type: "uint256" },
                { internalType: "uint256", name: "enemyDefense", type: "uint256" },
                { internalType: "uint256", name: "enemyLuck", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
            "getRoleAdmin(bytes32)": {
              inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
              name: "getRoleAdmin",
              outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
              stateMutability: "view",
              type: "function",
              details:
                "Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role's admin, use {_setRoleAdmin}.",
            },
            "grantRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "grantRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleGranted} event.",
            },
            "hasRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "hasRole",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
              details: "Returns `true` if `account` has been granted `role`.",
            },
            "renounceRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "renounceRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function's purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.",
            },
            "revokeRole(bytes32,address)": {
              inputs: [
                { internalType: "bytes32", name: "role", type: "bytes32" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "revokeRole",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
              details:
                "Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``'s admin role. May emit a {RoleRevoked} event.",
            },
            "supportsInterface(bytes4)": {
              inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
              name: "supportsInterface",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
              details: "See {IERC165-supportsInterface}.",
            },
            "target()": {
              inputs: [],
              name: "target",
              outputs: [
                { internalType: "contract IChainBrawlerInternal", name: "", type: "address" },
              ],
              stateMutability: "view",
              type: "function",
            },
          },
        },
        "contracts/TestSafePackerWrapper.sol:TestSafePackerWrapper": {
          source: "contracts/TestSafePackerWrapper.sol",
          name: "TestSafePackerWrapper",
          methods: {
            "callPackEnemy(uint256,uint256,uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "baseCombat", type: "uint256" },
                { internalType: "uint256", name: "baseEndurance", type: "uint256" },
                { internalType: "uint256", name: "baseDefense", type: "uint256" },
                { internalType: "uint256", name: "baseLuck", type: "uint256" },
                { internalType: "uint256", name: "xpReward", type: "uint256" },
                { internalType: "uint256", name: "dropRate", type: "uint256" },
              ],
              name: "callPackEnemy",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "pure",
              type: "function",
            },
            "writeClampedPublic(uint256,uint256,uint256,uint256)": {
              inputs: [
                { internalType: "uint256", name: "packed", type: "uint256" },
                { internalType: "uint256", name: "shift", type: "uint256" },
                { internalType: "uint256", name: "mask", type: "uint256" },
                { internalType: "uint256", name: "value", type: "uint256" },
              ],
              name: "writeClampedPublic",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "pure",
              type: "function",
            },
          },
        },
      };
      new Gn({
        el: "#app",
        router: new _c({
          routes: [
            { path: "/", component: qc, props: () => ({ json: Hc }) },
            { path: "*", component: Bc, props: (e) => ({ json: Hc[e.path.slice(1)] }) },
          ],
        }),
        mounted() {
          document.dispatchEvent(new Event("render-event"));
        },
        render: (e) => e(kc),
      });
    })();
})();
