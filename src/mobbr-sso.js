/**
 * If we receive a message from a mobbr.com iframe that reports a user is logged in or out
 * we set a cookie and refresh the page
 */

(function (window, undefined) {

    var cookie,
        source;

    /**
     * Create a default javascript cookie with a name, a value and a expiry date, set negative to reset
     * @param name (string)
     * @param value (string)
     * @param days (int)
     */

    function createCookie(name, value, days) {

        var date,
            expires = '';

        if (days) {
            date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires="+date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/";

        return value;
    }

    /**
     * Retrieve the value for a cookie key
     * @param name (string)
     * @returns (string)
     */

    function readCookie(name) {

        var nameEQ = name + "=",
            ca = document.cookie.split(';'),
            c,
            i;

        for (i = 0; i < ca.length; i++) {
            c = ca[i];

            while (c.charAt(0)==' ') {
                c = c.substring(1,c.length);
            }

            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }

        return null;
    }

    /**
     * Create a listener for post events from mobbr.com
     */

    function setPostEvent() {

        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
            eventer = window[eventMethod],
            messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

        eventer(messageEvent, function (e) {

            var logout, login;

            source = e.source;

            if (e.origin === mobbr.getUiUrl()) {

                // If we don't get a logout message and our data is not the same
                // we set a new cookie with the userdata cookie value
                // if the user is logged in and we get a logout message we remove the cookie by setting days to -1

                logout = e.data === 'logout' && (cookie && cookie !== 'deleted');
                login = e.data !== 'logout' && e.data !== cookie;

                if (login || logout) {
                    cookie = createCookie('mobbr-auth', login && e.data || 'deleted', logout && -1 || undefined);
                    setTimeout(function () { window.location.reload(true); }, 500);
                }
            }

        }, false);
    }

    /**
     * Send a message to the mobbr iframe
     */

    function postMessage(msg) {

        if (source && $window.parent && $window.parent.postMessage) {
            source.postMessage(msg, mobbr.getUiUrl());
            return true;
        }

        return false;
    }

    /**
     * public object
     * @type {{enable: Function, login: Function, logout: Function}}
     */

    var mobbrSSO = {

        enable: function () {

            if (!source) {
                cookie = readCookie('mobbr-auth');
                setPostEvent();
                return true;
            }

            return false;
        },
        login: function () {
            mobbr.login();
            //return postMessage('login');

        },
        logout: function () {
            mobbr.logout();
            //return postMessage('logout');
        }
    };

    /**
     * Bind our single sign on object to the window
     */

    window.mobbrSSO = window.mobbrSSO || mobbrSSO;

}(this));