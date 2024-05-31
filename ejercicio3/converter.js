class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }

    getFullName() {
        return `${this.code} - ${this.name}`;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];

    }

    async getCurrencies() {
        try {
            const response = await fetch(`${this.apiUrl}/currencies`);
            if (!response.ok) {
                throw new Error(`Error al cargar las monedas: ${response.statusText}`);
            }
            const currenciesData = await response.json();
            for (const code in currenciesData) {
                const currency = new Currency(code, currenciesData[code]);
                this.currencies.push(currency);
            }
        } catch (error) {
            console.error('Error:', error);
        }

    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            const response = await fetch(
                `${this.apiUrl}/latest?from=${fromCurrency.code}&to=${toCurrency.code}&amount=${amount}`
            );
            if (!response.ok) {
                throw new Error(`Error al realizar la conversión: ${response.statusText}`);
            }
            const data = await response.json();
            return data.amount;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
} 

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
