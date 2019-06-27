
export interface PriceInfo {
    /** Price pair, e.g. eosusd */
    pair: string
    /**
     * Price of 1 unit of first asset of pair in second asset of pair
     * E.g. for pair eosusd with 1 EOS valued 5.67 USD the price would be 5.67
     */
    price: number
    /** 24-hour trade volume of pair from source. */
    volume: number

}

export interface PriceProvider {
    /** Name of provider, e.g. Kraken. */
    name: string
    /** Fetch price info, should throw if fetching fails. */
    run: () => Promise<PriceInfo[]>
}
