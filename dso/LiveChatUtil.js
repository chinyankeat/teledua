var LiveChatUtil = function() {
    function t(t, e) {
        var a = (new Date).setUTCHours(o.start, 0, 0, 0),
            i = (new Date).setUTCHours(o.end, 0, 0, 0);
        n(function(n) { a < n && n < i ? t() : e() }) 
    }

    function e() { void 0 === a || a.closed ? a = window.open(i, "Digi_LiveChat", s) : a.focus() }

    function n(t) {
        var e;
        try { e = new XMLHttpRequest } catch (n) {
            try { e = new ActiveXObject("Msxml2.XMLHTTP") } catch (n) {
                try { e = new ActiveXObject("Microsoft.XMLHTTP") } catch (e) {
                    return void t(new Date) } } }
        e.onreadystatechange = function() {
            if (e.readyState === XMLHttpRequest.DONE)
                if (200 === e.status) {
                    var n = new Date(e.getResponseHeader("Date"));
                    t(n) } else e.status.toString().startsWith("4") || e.status.toString().startsWith("5") ? t(new Date) : 0 === e.status && t(new Date) }, e.open("HEAD", window.location.href.toString(), !0), e.setRequestHeader("Content-Type", "text/html"), e.send("") }
    var a, i = "https://goo.gl/lyaxDz",
        s = "resizable,location=no,height=650,width=400",
        o = { start: 2, end: 13 },
        r = { isOperating: t, openChatWindow: e };
    return r }();
