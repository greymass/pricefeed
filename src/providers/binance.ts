import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class BinanceProvider implements PriceProvider {
    name = 'Binance'

    async getPair(name: string) {
        const res = await fetch(
            `https://api.binance.com/api/v3/ticker/24hr?symbol=${name}`
        )
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const data = await res.json()
        if (data.error && data.error.length > 0) {
            throw new Error('Binance error: ' + data.error.join(', '))
        }
        return {
            volume: parseFloat(data.volume),
            price: parseFloat(data.weightedAvgPrice),
        }
    }

    async run() {
        const [
            usd,
            btc,
            // eth
        ] = await Promise.all([
            this.getPair('WAXPUSDT'),
            this.getPair('WAXPBTC'),
            // this.getPair('ETH-WAXP'),
        ])
        return [
            { pair: 'waxpusd', volume: usd.volume, price: usd.price },
            {
                pair: 'waxpbtc',
                volume: btc.volume * 1e4,
                price: btc.price * 1e4,
            },
            // {
            //     pair: 'waxpeth',
            //     volume: eth.volume * 1e4,
            //     price: eth.price * 1e4,
            // },
        ]
    }
}
