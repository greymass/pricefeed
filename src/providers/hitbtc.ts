import fetch from 'node-fetch'
import {PriceProvider} from '../price-provider'

export default class HitBTCProvider implements PriceProvider {
    name = 'HitBTC'

    async getPair(name: string) {
        const res = await fetch(`https://api.hitbtc.com/api/2/public/ticker/${name}`)
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const data = await res.json()
        return {
            volume: parseFloat(data.volume),
            price: (parseFloat(data.ask) + parseFloat(data.bid)) / 2,
        }
    }

    async run() {
        const [usd, btc, btcusd] = await Promise.all([
            this.getPair('EOSUSD'),
            this.getPair('EOSBTC'),
            this.getPair('BTCUSD'),
        ])
        return [
            {pair: 'eosusd', volume: usd.volume, price: usd.price},
            {pair: 'eosbtc', volume: btc.volume * 1e4, price: btc.price * 1e4},
            {pair: 'btcusd', volume: btcusd.volume, price: btcusd.price},
        ]
    }
}
