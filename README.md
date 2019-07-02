
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

Run with docker-compose
---------------

First create a copy of the `.env` file from the example.

```
$ cp .env.example .env
```

Edit the new `.env` file, and fill in the account@authority to use as well as the private key for signing.

Then build/start the container.

```
$ docker-compose build
$ docker-compose up -d
```

Upgrade with docker-compose
---------------

From within the project folder, stop the container. Then pull the changes and start the container again.

```
docker-compose stop
git pull
docker-compose build
docker-compose up -d
```
