import "./peerjs.min.js";
import "./ws_port.js";
import "./ws_events.js";
import "./peerjs.cfg.js";
(function (root) {
  window.readPasteBin = async (pasteId) => {
    var script = document.createElement("script");
    document.body.appendChild(script);
    var OLD_DOCUMENT_WRITE = document.write;
    var promise_resolve = null;
    document.write = (str) => {
      //NEW_DOCUMENT_WRITE
      document.write = OLD_DOCUMENT_WRITE; // restore old document.write
      // _ip_🤗_/ip_
      var ip = str.match(">__(.*)_/_<")[1];
      promise_resolve(ip);
    };
    var promise = new Promise((resolve, reject) => {
      promise_resolve = resolve;
    });
    script.src = `https://pastebin.com/embed_js/${pasteId}`;
    script.remove();
    return promise;
  };

  window.get_ws_ip = async () => {
    return await readPasteBin("BDneeqJh");
  };

  // (async () => {
  //   var ip = await get_ws_ip();
  //   console.log(ip);
  // })();

  // ===================================
  // console.log(root);
  var peer = new Peer(undefined, {
    secure: window.PEERJS_SERVER.secure,
    host: window.PEERJS_SERVER.host,
    port: window.PEERJS_SERVER.port,
    path: window.PEERJS_SERVER.path,
  });
  // console.log(peer.id);

  peer.on("open", function (id) {
    var conn = peer.connect(window.SERVER_PEER_ID);
    conn.on("open", function () {
      // console.log(root);
      root.ws = conn;
    });
    conn.on("data", function (data) {
      alert(data);
      try {
        var msg = JSON.parse(data);
      } catch (error) {
        console.warn(data);
        return;
      }
      window.ws_events[msg.t](msg);
    });
  });
  // console.log(this);
  // window.peer = peer;

  window.send = (msg) => {
    root.ws.send(msg);
  };
})({});
