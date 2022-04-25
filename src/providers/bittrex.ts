import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class KrakenProvider implements PriceProvider {

    name = 'Bittrex'

    async getPair(name: string) {
        const res = await fetch(`https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=${name}`)
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const data = await res.json()
        if (data.error && data.error.length > 0) {
            throw new Error('Bittrex error: ' + data.error.join(', '))
        }
        return {
            volume: parseFloat(data.result[0].Volume),
            price: (parseFloat(data.result[0].Bid) + parseFloat(data.result[0].Ask)) / 2
        }
    }

    async run() {
        const [usd, btc, eth] = await Promise.all([
            this.getPair('usdt-waxp'), 
            this.getPair('btc-waxp'),
            this.getPair('eth-waxp')
        ])
        return [
            { pair: 'waxpusd', volume: usd.volume, price: usd.price },
            { pair: 'waxpbtc', volume: btc.volume * 1e4, price: btc.price * 1e4 },
            { pair: 'waxpeth', volume: eth.volume * 1e4, price: eth.price * 1e4 },
        ]
    }
}
