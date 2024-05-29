const express = require("express");

// exports.foo = import("webtorrent").then((module) => module.foo);
// const WebTorrent = await require("./TorrentParser.ts").foo;

const WebTorrent = (...args) =>
  import("webtorrent").then(
    ({ default: webtorrent }) => new webtorrent(...args),
  );

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

const TIMEOUT = process.env.TIMEOUT || 20000;

app
  .post("/api/magnet", async (req, res) => {
    try {
      const { magnet } = req.body;
      let client = await WebTorrent({ maxConns: 2000, dht: true });

      const timeout = setTimeout(() => {
        res.status(500).send("Timeout");
      }, TIMEOUT);

      let ressss = await new Promise((resolve, reject) => {
        client.add(magnet, {}, async (torr) => {
          let files_ = await new Promise((resolve_, _) => {
            resolve_(
              torr.files.map((file, i) => {
                return {
                  name: file.name,
                  path: file.path,
                  length: file.length,
                };
              }),
            );
          });
          resolve({ ...torr, files_: files_ });
        });
      });

      clearTimeout(timeout);

      if (!ressss) {
        res.status(404).json({});
      }

      const out = {
        name: ressss.name,
        files: ressss?.files_,
        length: ressss?.length,
        infoHash: ressss?.infoHash,
        magnetURI: ressss?.magnetURI,
        announce: ressss?.announce,
        peers: ressss?.numPeers,
        announceList: "announce-list" in ressss ? ressss["announce-list"] : [],
      };
      res.status(200).json(out);
    } catch (error) {
      console.log({ error });
      res.status(500).send(error);
    }
  })
  .post("/api/torrent", async (req, res) => {
    try {
      const { url } = req.body;
      let client = await WebTorrent({ maxConns: 2000, dht: true });

      const timeout = setTimeout(() => {
        res.status(500).send("Timeout");
      }, TIMEOUT);

      let ressss = await new Promise((resolve, reject) => {
        client.add(url, {}, async (torr) => {
          let files_ = await new Promise((resolve_, _) => {
            resolve_(
              torr.files.map((file, i) => {
                return {
                  name: file.name,
                  path: file.path,
                  length: file.length,
                };
              }),
            );
          });
          resolve({ ...torr, files_: files_ });
        });
      });

      clearTimeout(timeout);

      if (!ressss) {
        res.status(404).json({});
      }

      const out = {
        name: ressss.name,
        files: ressss?.files_,
        length: ressss?.length,
        infoHash: ressss?.infoHash,
        magnetURI: ressss?.magnetURI,
        announce: ressss?.announce,
        peers: ressss?.numPeers,
        announceList: "announce-list" in ressss ? ressss["announce-list"] : [],
      };

      res.status(200).json(out);
    } catch (error) {
      console.log({ error });
      res.status(500).send(error);
    }
  });

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on ${process.env.PORT || 3000}`);
});
