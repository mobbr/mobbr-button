/* Where is our server? */
var mobbr_api_url = 'https://api.mobbr.com';
var mobbr_ui_url  = 'https://mobbr.com';

/*
 mobbbr::javascript.js
 2012-04-12

 Javascript needed to place the Mobbr-button on your site.
 For usage see: https://mobbr.com/#/buttons
 For specification see: https://mobbr.com/protocol
 */

var mobbr = mobbr || (function () {

    function in_array(obj, array) {
        var i = array.length;
        while (i--) {
            if (array[i] === obj) {
                return true;
            }
        }
        return false;
    }

    function is_url(str) {
        var reg = /^https?:\/\/.*/;
        if (typeof(str)!='string') return false;
        if (reg.test(str)) return true;
        return false;
    }

    var mobbrDiv = createMobbrDiv(),
        mobbrFrame,
        buttonSizes={
            slim: [ 110, 20 ],
            icon: [ 16, 16 ],
            flat: [ 120, 21 ],
            small: [ 32, 32 ],
            large: [ 64, 64 ],
            medium: [ 50, 60 ],
            icongs: [ 16, 16 ],
            flatgs: [ 120, 21 ],
            smallgs: [ 32, 32 ],
            largegs: [ 64, 64 ],
            mediumgs: [ 50, 60 ],
            badgeMedium: [ 53, 65 ],
            badgeWide: [150, 20 ]
        },
        buttonTypes = [
            'slim',
            'icon',
            'flat',
            'small',
            'large',
            'medium',
            'icongs',
            'flatgs',
            'smallgs',
            'largegs',
            'mediumgs',
            'badgeMedium',
            'badgeWide'
        ];

    window.onload = function () {
        document.body.appendChild(mobbrDiv);
    };

    function createMobbrDiv() {
        var div = document.createElement('div');
        div.setAttribute('id', 'mobbr_div');
        div.setAttribute('name', 'mobbr_div');
        div.style.cssText = 'opacity:0.95;filter:alpha(opacity=95); display:none; position: fixed; border: 4px solid #999; background: none repeat scroll 0% 0% #fff; top: 8px; right: 8px; padding:15px 0px 0px 0px; width: 492px; height: 338px; z-index: 2147483647; border-radius: 10px; -moz-border-radius: 15px; -webkit-border-radius: 15px; -khtml-border-radius: 15px;';

        var a = document.createElement('a');
        a.style.cssText = 'float:right; position:relative; top:-17px; right:5px; text-decoration:none; font-size:7pt; color:black;font-family: Arial, Helvetica, sans-serif;';
        a.onclick = hide;
        a.innetText = '[close window] ';

        var img = document.createElement('img');
        img.style.cssText = 'position:relative;top:5px;width: 24px;height: 24px';
        img.src = mobbr_ui_url + '/img/frame_closebutton.png';
        img.alt = 'Close button';

        mobbrFrame = document.createElement('iframe');
        mobbrFrame.setAttribute('name', 'mobbr_frame');
        mobbrFrame.setAttribute('frameborder', '0');
        mobbrFrame.style.cssText = 'position:relative;top:-10px;left:0;right:0;bottom:0;opacity:1;filter:alpha(opacity=100); width: 100%; height: 292px; padding:0; margin:0;';
        mobbrFrame.src = mobbr_ui_url + '/lightbox/#/';

        a.appendChild(img);
        div.appendChild(a);
        div.appendChild(mobbrFrame);

        return div;
    }

    function createButtonImage(url, onClick, button_type, currency) {

        var img = document.createElement('img');
        var button_size = buttonSizes[button_type];

        if (currency) {
            url += '/' + currency.toUpperCase();
        }

        img.style.cssText = 'cursor: pointer; cursor: hand; width: '+button_size.width+'px !important; height: '+button_size.height+'px !important';
        img.className = 'mobbr_button';
        img.onclick = onClick;
        img.src = url;
        img.alt = 'Mobbr button';
        img.title = 'Click to see payment info';

        return img;
    }

    function createButton(data, button_type, currency) {

        var md5_hash = '';

        if (is_url(data)) {
            md5_hash = hex_md5(data.replace(/\/$/, ""));
        } else if (is_url(data.url)) {
            md5_hash = hex_md5(data.url.replace(/\/$/, ""));
        }

        return createButtonImage(
            mobbr_api_url + '/button/' + md5_hash + '/' + button_type,
            function (e) {
                mobbr.makePayment(data, e.target);
                return false;
            },
            button_type,
            currency
        );
    }

    function createBadge(data, button_type, currency) {

        var urlparts,
            type = button_type.replace('badge', '').toLowerCase();

        if (is_url(data)) {
            urlparts = data.split("://");
        } else {
            urlparts = data.url.split("://");
        }

        return createButtonImage(
            mobbr_api_url + '/badge/' + urlparts[0] + '/' + urlparts[1] + '/' + type,
            function () {
                window.open(mobbr_ui_url + '/#/domain/' + window.btoa(urlparts[0] + '://' + urlparts[1]), '_blank');
            },
            button_type,
            currency
        );
    }

    function drawButton(data, button_type, currency, target, position) {

        var badge = (button_type === 'badgeMedium' || button_type === 'badgeWide') && true || false,
            img,
            target_obj,
            scripts,
            this_script;

        data = checkData(data);

        if (!badge) {
            img = createButton(data, button_type, currency);
        } else {
            img = createBadge(data, button_type, currency);
        }

        if (typeof(target) != 'undefined') {
            target_obj = target;
            if (typeof(target) == 'string') {
                target_obj = document.getElementById(target);
            }
            switch(position) {
                case 'before':
                    target_obj.parentNode.insertBefore(img, target_obj);
                    break;
                case 'replace':
                    target_obj.parentNode.replaceChild(img, target_obj);
                    break;
                default:
                    target_obj.appendChild(img);
                    break;
            }
        } else {
            // Add it next to the last script tag (should be current script tag in most cases)
            scripts = document.getElementsByTagName('script');
            this_script = scripts[scripts.length - 1];
            this_script.parentNode.insertBefore(img, this_script);
        }
    }

    function checkData(data) {

        var url, links, metas, i;

        if (is_url(data)) {
            url = data;
        } else if (data && data.url) {
            url = data.url;
        }

        if (!url) {
            links = document.getElementsByTagName("link");
            for (i = 0; i < links.length; i++) {
                if (links[i].getAttribute("rel").toLowerCase().replace(/^\s+|\s+$/g,"") === "canonical") {
                    url = links[i].getAttribute("href").replace(/^\s+|\s+$/g,"").replace(/\/$/, "");
                    break;
                }
            }
        }

        if (!url) {
            metas = document.getElementsByTagName("meta");
            for (i = 0; i < metas.length; i++) {
                if (metas[i].getAttribute("property")) {
                    if (metas[i].getAttribute("property").toLowerCase().replace(/^\s+|\s+$/g,'') === "og:url") {
                        url = metas[i].getAttribute("content").replace(/^\s+|\s+$/g,'').replace(/\/$/, "");
                        break;
                    }
                }
            }
        }

        if (!url) {
            url = window.location.toString();
        }

        url = url.replace(/([^:])(\/\/+)/g, '$1/').replace(/[#\?\/]+$/, '');

        if (!data) {
            data = url;
        }

        if (!is_url(data) && !data.url) {
            data.url = url;
        }

        return data;
    }

    function setUrl(url) {
        mobbrFrame.src = mobbr_ui_url + '/lightbox/#/' + url ;
    }

    function hide() {
        setUrl();
        mobbrDiv.style.display = 'none';
    }

    function show(url, target) {
        setUrl(url || '');
        mobbrDiv.style.display = 'block';
    }

    return {

        button: function (data, currency, button_type, target, positioning) {
            currency = currency || false;
            if (!in_array(button_type, buttonTypes)) {
                button_type = 'medium';
            }
            drawButton(data, button_type, currency, target, positioning);
        },
        hide: hide,
        makePayment: function (data, target) { show('?hash=' + window.btoa(data), target); },
        login: function () { show('?login=true'); },
        logout: function () { show('?logout=true'); },

        /**
         * TODO: All calls below are not needed, everything can be called with button(), remove if calls are changed accordingly
         */

        buttonFlat: function(data, curr) { drawButton(data, 'flat', curr); },
        buttonSmall: function(data, curr) { drawButton(data, 'small', curr); },
        buttonLarge: function(data, curr) { drawButton(data, 'large', curr); },
        buttonMedium: function(data, curr) { drawButton(data, 'medium', curr); },
        buttonFlatGS: function(data, curr) { drawButton(data, 'flatgs', curr); },
        buttonSmallGS: function(data, curr) { drawButton(data, 'smallgs', curr); },
        buttonLargeGS: function(data, curr) { drawButton(data, 'largegs', curr); },
        buttonMediumGS: function(data, curr) { drawButton(data, 'mediumgs', curr); },
        buttonSlim: function(data, curr) { drawButton(data, 'slim', curr); },
        buttonIcon: function(data, curr) { drawButton(data, 'icon', curr); },
        badgeMedium: function(data, curr) { drawButton(data, 'badgeMedium', curr); },
        badgeWide: function(data, curr) { drawButton(data, 'badgeWide', curr); }
    };
})();
