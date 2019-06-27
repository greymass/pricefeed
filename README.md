
greymass-pricefeed
==================

Pricefeed service for the DelphiOracle contract

Developing
----------

With node.js installed, run `make dev`. See `config/default.toml` for configuration options. `EOSIO_AUTH` & `EOSIO_KEY` required to run.

Run with docker
---------------

```
$ docker build .
...
<container id>
$ docker run -d --name greymass-pricefeed \
    -e EOSIO_AUTH="myproducer@oracle" \
    -e EOSIO_KEY="5contractspecifickey" \
    <container id>
```
