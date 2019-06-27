import * as assert from 'assert'
import * as config from 'config'
import { apiClient, logger } from './common'
import { PriceInfo, PriceProvider } from './price-provider'

import Bitfinex from './providers/bitfinex'
import HitBTC from './providers/hitbtc'
import Kraken from './providers/kraken'

const providers: PriceProvider[] = [
    new Bitfinex(),
    new HitBTC(),
    new Kraken(),
]

const EOSIO_AUTH = config.get('eosio_auth') as string
assert.equal(typeof EOSIO_AUTH, 'string', 'invalid EOSIO_AUTH')
assert(EOSIO_AUTH.includes('@'), 'invalid EOSIO_AUTH')
const [EOSIO_AUTH_ACCOUNT, EOSIO_AUTH_PERMISSION] = EOSIO_AUTH.split('@')

const ORACLE_CONTRACT = config.get('oracle_contract') as string
assert.equal(typeof ORACLE_CONTRACT, 'string', 'invalid ORACLE_CONTRACT')

interface Quote {
    pair: string
    value: number
}

async function write(quotes: Quote[]) {
    const action = {
        account: ORACLE_CONTRACT,
        name: 'write',
        authorization: [{
            actor: EOSIO_AUTH_ACCOUNT,
            permission: EOSIO_AUTH_PERMISSION
        }],
        data: {
            owner: EOSIO_AUTH_ACCOUNT,
            quotes,
        }
    }
    logger.debug({ action }, 'writing feed')
    await apiClient.transact(
        { actions: [action] },
        {
            sign: true,
            broadcast: true,
            blocksBehind: 3,
            expireSeconds: 30,
        }
    )
}

async function runProvider(provider: PriceProvider) {
    try {
        const info = await provider.run()
        logger.debug({ info }, 'provider %s', provider.name)
        return info
    } catch (error) {
        logger.warn(error, 'unable to get prices from %s', provider.name)
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
    const pairs: { [name: string]: { volume: number, value: number } } = {}
    for (const price of prices) {
        if (!pairs[price.pair]) {
            pairs[price.pair] = {
                volume: price.volume,
                value: price.price * price.volume
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
