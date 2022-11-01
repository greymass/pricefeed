import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class BittrexProvider implements PriceProvider {
    name = 'Bittrex'

    async getPair(pair: string) {
        const res = await fetch(
            `https://api.bittrex.com/v3/markets/${pair}/summary`
        )
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const data = await res.json()
        return {
            volume: parseFloat(data.volume ? data.volume : 1),
            price: (parseFloat(data.high) + parseFloat(data.low)) / 2,
        }
    }

    async run() {
        const [usd, btc, waxpeth] = await Promise.all([
            this.getPair('WAXP-USDT'),
            this.getPair('WAXP-BTC'),
            this.getPair('WAXP-ETH'),
        ])
        return [
            { pair: 'waxpusd', volume: usd.volume, price: usd.price },
            {
                pair: 'waxpbtc',
                volume: btc.volume * 1e4,
                price: btc.price * 1e4,
            },
            {
                pair: 'waxpeth',
                volume: waxpeth.volume,
                price: waxpeth.price * 1e4,
            },
        ]
    }
}
