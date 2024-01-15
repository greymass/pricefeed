import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class KucoinProvider implements PriceProvider {

    name = 'Kucoin'

    async getPair(name: string) {
        const res = await fetch(`https://api.kucoin.com/api/v1/market/orderbook/level1\?symbol\=${name}`)
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const data = await res.json()
        if (data.error && data.error.length > 0) {
            throw new Error('Kucoin error: ' + data.error.join(', '))
        }
        return {
            volume: 1,
            price: parseFloat(data.data.price)
        }
    }

    async run() {
        const [
            waxeth, 
        ] = await Promise.all([
            this.getPair('WAX-ETH'),
        ])
        return [
            { pair: 'waxpeth', volume: waxeth.volume * 1e4, price: waxeth.price * 1e4 },
        ]
    }
}
