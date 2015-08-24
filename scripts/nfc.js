(function () {
    this._started = false;
    this.tag = null;

    function notify(titleid, body, bodyid, onClick) {
        console.log("A notification would be send: " + titleid);

        var canSend = false;


        if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            canSend = true;
        }

        // Otherwise, we need to ask the user for permission
        if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    canSend = true;
                }
            });
        }

        if(canSend){
            var notification = new window.Notification(titleid, {
                body: body,
                icon: '/style/icons/32.png'
            });
            notification.onclick = function () {
                notification.close();
                if (onClick) {
                    new MozActivity({
                        name: "view",
                        data: {
                            type: "url",
                            url: body
                        }
                    });
                }
            };
        }
    }

    /**
     * Create MozNDEFRecord whose content is the uri.
     */
    function createNDEF(text) {
        var enc = new TextEncoder('utf-8');

        return new MozNDEFRecord({
            tnf: 'well-known',
            type: enc.encode('U'),
            payload: enc.encode(text)
        });
    }

    function handleTagFound(typeEvent, ndefObject) {
        var typeEvent = String(typeEvent);
        if (typeEvent.localeCompare("sleep") === 0) { //If equals, then it's 0. If not, it's -1.    
            var tag = ndefObject.tag;
            var myNDEF = createNDEF("NFC-Pass1");

            tag.writeNDEF([myNDEF]).then(function() {
                notify("NFC-Sleep", "Tag written succesfully - Sleep");
            }).catch (function(err) {
                notify("NFC-Sleep", "Failed: "+err);
            });
        } else {
            console.log("Event not recognized: " + typeEvent);
        }

        return false;
    }

    function setLinks(nfc) {
        window.document.getElementById("sleep").addEventListener("click", function () {
            console.log("NFC-Sleep: " + " links ready");
            nfc.ontagfound = handleTagFound.bind(this, "sleep");
            this.style
        });
    }

    function start() {
        document.addEventListener("DOMContentLoaded", function (event) {
            if (this._started) {
                throw 'Instance should not be start()\'ed twice.';
            }
            var nfc = window.navigator.mozNfc;
            if (!nfc) {
                console.log('Go home NFC, you are not available! Please, enable NFC or make sure that your device has NFC capabilities.');
                return;
            }

            console.log('NFC Sleep enabled.');
            this._started = true;

            setLinks(nfc);
        });
    }

    start();
}(window));