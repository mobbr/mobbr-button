/*
 mobbbr::javascript.js
 2012-04-12

 Javascript needed to place the Mobbr-button on your site.
 For usage see: https://mobbr.com/#/buttons
 For specification see: https://mobbr.com/protocol
 */

var mobbr = mobbr || (function () {

        var mobbr_api_url = 'https://api.mobbr.com';
        var mobbr_ui_url = 'https://mobbr.com';
        var mobbr_lightbox_url = 'https://mobbr.com/lightbox/#';
        var mobbrDiv,
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
        var mobbrDiv_added;

        addEvent(window, 'load', createMobbrDiv);

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

        function addEvent(element, event, fn) {
            if (element.addEventListener)
                element.addEventListener(event, fn, false);
            else if (element.attachEvent)
                element.attachEvent('on' + event, fn);
        }

        function createMobbrDiv() {

            if (!mobbrDiv) {
                var div = document.createElement('div');
                div.setAttribute('id', 'mobbr_div');
                div.setAttribute('name', 'mobbr_div');
                div.style.cssText = 'display:none; position: fixed; top: 0; right: 0; width: 320px; height: 100%; z-index: 2147483647;';

                var a = document.createElement('a');
                a.style.cssText = 'cursor: pointer; font-size: 26px; line-height: 45px; position:absolute; top:0; right:0; text-decoration:none; width: 60px; height: 45px; color: #71797f; z-index: 99999999999;';
                a.onclick = hide;
                a.innerText = 'x';

                mobbrFrame = document.createElement('iframe');
                mobbrFrame.setAttribute('name', 'mobbr_frame');
                mobbrFrame.setAttribute('id', 'mobbr_frame');
                mobbrFrame.setAttribute('frameborder', '0');
                mobbrFrame.style.cssText = 'width: 100%; height: 100%;';
                mobbrFrame.src = mobbr_lightbox_url;

                div.appendChild(a);
                div.appendChild(mobbrFrame);

                mobbrDiv = div;
                //document.body.appendChild(mobbrDiv);
            }
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

            var url, md5_hash;

            if (is_url(data)) {
                url = data;
            } else if (is_url(data.url)) {
                url = data.url;
            }

            url = url.replace(/([^:])(\/\/+)/g, '$1/').replace(/[#\?\/]+$/, '');
            md5_hash = md5(url);

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
                        url = links[i].getAttribute("href").replace(/^\s+|\s+$/g,"");
                        break;
                    }
                }
            }

            if (!url) {
                metas = document.getElementsByTagName("meta");
                for (i = 0; i < metas.length; i++) {
                    if (metas[i].getAttribute("property")) {
                        if (metas[i].getAttribute("property").toLowerCase().replace(/^\s+|\s+$/g,'') === "og:url") {
                            url = metas[i].getAttribute("content");
                            break;
                        }
                    }
                }
            }

            if (!url) {
                url = window.location.toString();
            }

            if (!data) {
                data = url;
            }

            if (!is_url(data) && !data.url) {
                data.url = url;
            }

            return data;
        }

        function setUrl(url) {
            mobbrFrame.src = url === undefined ? '' : mobbr_lightbox_url + '/' + url ;
        }

        function hide() {
            setUrl();
            mobbrDiv.style.display = 'none';
        }

        function show(url, target) {
            setUrl(url || '');
            if (!mobbrDiv_added) {
                document.body.appendChild(mobbrDiv);
                mobbrDiv_added = true;
            }
            mobbrDiv.style.display = 'block';
        }

        return {

            createDiv: function () {
                if (mobbrDiv) {
                    document.body.removeChild(mobbrDiv);
                    mobbrDiv = undefined;
                }
                createMobbrDiv();
            },
            setApiUrl: function (url) {
                mobbr_api_url = url;
            },
            setUiUrl: function (url) {
                mobbr_ui_url = url;
            },
            setLightboxUrl: function (url) {
                mobbr_lightbox_url = url;
            },
            getApiUrl: function () {
                return mobbr_api_url;
            },
            getUiUrl: function () {
                return mobbr_ui_url;
            },
            getLightboxUrl: function () {
                return mobbr_lightbox_url;
            },
            button: function (data, currency, button_type, target, positioning) {
                currency = currency || false;
                if (!in_array(button_type, buttonTypes)) {
                    button_type = 'medium';
                }
                drawButton(data, button_type, currency, target, positioning);
            },
            hide: hide,
            makePayment: function (data, target) {
                show('hash/' + (typeof data === 'object' ? window.btoa(data.url) : window.btoa(data)), target);
                document.getElementById('mobbr_frame').onload = function() {
                    if (typeof data === 'object') {
                        window.document.getElementById('mobbr_frame').contentWindow.postMessage(data, '*');
                    } else {
                        window.document.getElementById('mobbr_frame').contentWindow.postMessage(null, '*');
                    }
                };
            },
            login: function () { show('login'); },
            logout: function () { show('logout'); },

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
