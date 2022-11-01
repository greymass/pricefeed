import * as assert from 'assert'
import * as config from 'config'
import { apiClient, logger } from './common'
import { PriceInfo, PriceProvider } from './price-provider'

import Bitfinex from './providers/bitfinex'
import Binance from './providers/binance'
import Bittrex from './providers/bittrex'
import HitBTC from './providers/hitbtc'
import Kraken from './providers/kraken'
import Newdex from './providers/newdex'
import RealtimeBitcoin from './providers/realtimebitcoin'

const providers: PriceProvider[] = [new Binance(), new Bittrex()]

function parseAuth(auth: string) {
    assert.equal(typeof auth, 'string', 'invalid auth')
    assert(auth.includes('@'), 'invalid auth')
    const [actor, permission] = auth.split('@')
    return { actor, permission }
}

const EOSIO_AUTH = config.get('eosio_auth') as string
assert.equal(typeof EOSIO_AUTH, 'string', 'invalid EOSIO_AUTH')
assert(EOSIO_AUTH.includes('@'), 'invalid EOSIO_AUTH')
const [EOSIO_AUTH_ACCOUNT, EOSIO_AUTH_PERMISSION] = EOSIO_AUTH.split('@')

const ORACLE_CONTRACT = config.get('oracle_contract') as string
assert.equal(typeof ORACLE_CONTRACT, 'string', 'invalid ORACLE_CONTRACT')

const authorization = [parseAuth(config.get('eosio_auth'))]

if (config.has('eosio_cosigner_auth')) {
    authorization.unshift(parseAuth(config.get('eosio_cosigner_auth')))
}

interface Quote {
    pair: string
    value: number
}

async function write(quotes: Quote[]) {
    const action = {
        account: ORACLE_CONTRACT,
        name: 'write',
        authorization,
        data: {
            owner: EOSIO_AUTH_ACCOUNT,
            quotes,
        },
    }
    logger.debug({ action }, 'writing feed')
    const res = await apiClient.transact(
        { actions: [action] },
        {
            sign: true,
            broadcast: true,
            blocksBehind: 3,
            expireSeconds: 30,
        }
    )
    logger.debug({ txn: res.transaction_id }, 'feed written')
}

async function runProvider(provider: PriceProvider) {
    try {
        const info = await provider.run()
        logger.debug({ info }, 'provider %s', provider.name)
        return info
    } catch (error) {
        logger.warn(error, 'unable to get prices from %s', provider.name)
        return []
    }
}

async function runProviders() {
    // FUTURE: limit number of providers we run in parallel here
    const prices = await Promise.all(providers.map(runProvider))
    return prices.flat()
}

export default async function update() {
    logger.debug('updating pricefeed')
    const prices = await runProviders()
    const pairs: { [name: string]: { volume: number; value: number } } = {}
    for (const price of prices) {
        if (!pairs[price.pair]) {
            pairs[price.pair] = {
                volume: price.volume,
                value: price.price * price.volume,
            }
        } else {
            pairs[price.pair].volume += price.volume
            pairs[price.pair].value += price.price * price.volume
        }
    }
    const quotes: Quote[] = []
    for (const pair of Object.keys(pairs)) {
        const price = pairs[pair].value / pairs[pair].volume
        logger.info({ price, volume: pairs[pair].volume }, 'pair %s', pair)
        quotes.push({ pair, value: Math.round(price * 1e4) })
    }
    await write(quotes)
}
