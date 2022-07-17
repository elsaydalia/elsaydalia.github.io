import "./peerjs.min.js";
import "./ws_port.js";
import "./ws_events.js";
import "./peerjs.cfg.js";

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

(function (root) {
  root.ondata = (data) => {
    console.info("[data]");
    console.info(data);
    try {
      var msg = JSON.parse(data);
    } catch (error) {
      console.warn(data);
      return;
    }
    window.ws_events[msg.t](msg);
  };

  root.useRtcProxy = () => {
    var peer = new Peer(undefined, window.PEERJS_SERVER);
    // console.log(peer.id);

    peer.on("open", function (id) {
      // alert(peer.id);
      var conn = peer.connect(window.SERVER_PEER_ID);
      // console.info(conn);
      conn.on("open", function () {
        // console.log(root); // dbg
        root.ws = conn;
      });
      conn.on("data", root.ondata);
      // dbg
      conn.on("error", (e) => {
        console.log("error");
        console.error(e);
      });
      // dbg
      conn.on("close", (e) => {
        console.log("close");
        console.error(e);
      });
      // dbg
      conn.on("disconnected", () => {
        console.log("disconnected");
        console.error(e);
      });
    });
    // dbg
    peer.on("error", (e) => {
      console.log("error");
      console.error(e);
    });
    // dbg
    peer.on("close", (e) => {
      console.log("close");
      console.error(e);
    });
    // dbg
    peer.on("disconnected", () => {
      console.log("disconnected");
      console.error(e);
    });
    // console.log(this);
    // window.peer = peer;
  };

  // first, try using WebSocket directly [if success: we are in debugging mode]
  //       except: fallback to RTC proxy [else: we are in production mode ]

  if (window.CONNECTION_TYPE === "ws") {
    (function init_ws() {
      root.ws = new WebSocket(`ws://127.0.0.1:${window.ws_port}/`);
      root.ws.onmessage = (event) => {
        root.ondata(event.data);
      };
      root.ws.onerror = (err) => {};
    })();
  } else if (window.CONNECTION_TYPE === "rtc") {
    root.useRtcProxy();
  }

  window.send = (msg) => {
    root.ws.send(msg);
  };
})({});
