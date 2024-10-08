// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import { RegisterOption } from "@keplr-wallet/hooks";
import {
  DEV_AMPLITUDE_API_KEY,
  DEV_AUTH_CLIENT_ID,
  PROD_AMPLITUDE_API_KEY,
  PROD_AUTH_CLIENT_ID,
} from "./config.ui.var";
import {
  IntlMessages,
  LanguageToFiatCurrency as TypeLanguageToFiatCurrency,
} from "./languages";
import { FiatCurrency } from "@keplr-wallet/types";
import {
  ADDITIONAL_INTL_MESSAGES,
  ADDITIONAL_SIGN_IN_PREPEND,
} from "alt-sign-in";

export const KeplrExtMoonPayAPIKey =
  process.env["KEPLR_EXT_MOONPAY_API_KEY"] || "";
export const KeplrExtTransakAPIKey =
  process.env["KEPLR_EXT_TRANSAK_API_KEY"] || "";
export const KeplrExtKadoAPIKey = process.env["KEPLR_EXT_KADO_API_KEY"] || "";

export const CoinGeckoAPIEndPoint =
  process.env["KEPLR_EXT_COINGECKO_ENDPOINT"] ||
  "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice =
  process.env["KEPLR_EXT_COINGECKO_GETPRICE"] || "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const DefaultGasMsgWithdrawRewards = 240000; // Gas per messages.

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint =
  process.env["KEPLR_EXT_ETHEREUM_ENDPOINT"] || "";

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
    name: "United States Dollar",
  },
  {
    currency: "aed",
    symbol: "د.إ",
    maxDecimals: 2,
    locale: "ar-AE",
    name: "United Arab Emirates Dirham",
  },
  {
    currency: "ars",
    symbol: "$",
    maxDecimals: 2,
    locale: "es-AR",
    name: "Argentine Peso",
  },
  {
    currency: "aud",
    symbol: "AU$",
    maxDecimals: 2,
    locale: "en-AU",
    name: "Australian Dollar",
  },
  {
    currency: "bdt",
    symbol: "৳",
    maxDecimals: 2,
    locale: "bn-BD",
    name: "Bangladeshi Taka",
  },
  {
    currency: "bhd",
    symbol: ".د.ب",
    maxDecimals: 3,
    locale: "ar-BH",
    name: "Bahraini Dinar",
  },
  {
    currency: "bmd",
    symbol: "BD$",
    maxDecimals: 2,
    locale: "en-BM",
    name: "Bermudian Dollar",
  },
  {
    currency: "brl",
    symbol: "R$",
    maxDecimals: 2,
    locale: "pt-BR",
    name: "Brazilian Real",
  },
  {
    currency: "cad",
    symbol: "CA$",
    maxDecimals: 2,
    locale: "en-CA",
    name: "Canadian Dollar",
  },
  {
    currency: "chf",
    symbol: "CHF",
    maxDecimals: 2,
    locale: "de-CH",
    name: "Swiss Franc",
  },
  {
    currency: "clp",
    symbol: "$",
    maxDecimals: 2,
    locale: "es-CL",
    name: "Chilean Peso",
  },
  {
    currency: "cny",
    symbol: "¥",
    maxDecimals: 1,
    locale: "zh-CN",
    name: "Chinese Yuan",
  },
  {
    currency: "czk",
    symbol: "Kč",
    maxDecimals: 2,
    locale: "cs-CZ",
    name: "Czech Koruna",
  },
  {
    currency: "dkk",
    symbol: "kr",
    maxDecimals: 2,
    locale: "da-DK",
    name: "Danish Krone",
  },
  {
    currency: "eur",
    symbol: "€",
    maxDecimals: 2,
    locale: "en-IE",
    name: "Euro",
  },
  {
    currency: "gbp",
    symbol: "£",
    maxDecimals: 2,
    locale: "en-GB",
    name: "British Pound Sterling",
  },
  {
    currency: "gel",
    symbol: "₾",
    maxDecimals: 2,
    locale: "ka-GE",
    name: "Georgian Lari",
  },
  {
    currency: "hkd",
    symbol: "HK$",
    maxDecimals: 1,
    locale: "en-HK",
    name: "Hong Kong Dollar",
  },
  {
    currency: "huf",
    symbol: "Ft",
    maxDecimals: 2,
    locale: "hu-HU",
    name: "Hungarian Forint",
  },
  {
    currency: "idr",
    symbol: "Rp",
    maxDecimals: 2,
    locale: "id-ID",
    name: "Indonesian Rupiah",
  },
  {
    currency: "ils",
    symbol: "₪",
    maxDecimals: 2,
    locale: "he-IL",
    name: "Israeli New Shekel",
  },
  {
    currency: "inr",
    symbol: "₹",
    maxDecimals: 1,
    locale: "en-IN",
    name: "Indian Rupee",
  },
  {
    currency: "jpy",
    symbol: "¥",
    maxDecimals: 2,
    locale: "ja-JP",
    name: "Japanese Yen",
  },
  {
    currency: "krw",
    symbol: "₩",
    maxDecimals: 2,
    locale: "ko-KR",
    name: "South Korean Won",
  },
  {
    currency: "kwd",
    symbol: "د.ك",
    maxDecimals: 3,
    locale: "ar-KW",
    name: "Kuwaiti Dinar",
  },
  {
    currency: "lkr",
    symbol: "Rs",
    maxDecimals: 2,
    locale: "si-LK",
    name: "Sri Lankan Rupee",
  },
  {
    currency: "mmk",
    symbol: "K",
    maxDecimals: 0,
    locale: "my-MM",
    name: "Myanmar Kyat",
  },
  {
    currency: "mxn",
    symbol: "MX$",
    maxDecimals: 2,
    locale: "es-MX",
    name: "Mexican Peso",
  },
  {
    currency: "myr",
    symbol: "RM",
    maxDecimals: 2,
    locale: "ms-MY",
    name: "Malaysian Ringgit",
  },
  {
    currency: "ngn",
    symbol: "₦",
    maxDecimals: 2,
    locale: "en-NG",
    name: "Nigerian Naira",
  },
  {
    currency: "nok",
    symbol: "kr",
    maxDecimals: 2,
    locale: "nb-NO",
    name: "Norwegian Krone",
  },
  {
    currency: "nzd",
    symbol: "NZ$",
    maxDecimals: 2,
    locale: "en-NZ",
    name: "New Zealand Dollar",
  },
  {
    currency: "php",
    symbol: "₱",
    maxDecimals: 2,
    locale: "en-PH",
    name: "Philippine Peso",
  },
  {
    currency: "pkr",
    symbol: "₨",
    maxDecimals: 2,
    locale: "en-PK",
    name: "Pakistani Rupee",
  },
  {
    currency: "pln",
    symbol: "zł",
    maxDecimals: 2,
    locale: "pl-PL",
    name: "Polish Zloty",
  },
  {
    currency: "rub",
    symbol: "₽",
    maxDecimals: 2,
    locale: "ru-RU",
    name: "Russian Ruble",
  },
  {
    currency: "sar",
    symbol: "ر.س",
    maxDecimals: 2,
    locale: "ar-SA",
    name: "Saudi Riyal",
  },
  {
    currency: "sek",
    symbol: "kr",
    maxDecimals: 2,
    locale: "sv-SE",
    name: "Swedish Krona",
  },
  {
    currency: "sgd",
    symbol: "S$",
    maxDecimals: 2,
    locale: "en-SG",
    name: "Singapore Dollar",
  },
  {
    currency: "thb",
    symbol: "฿",
    maxDecimals: 2,
    locale: "th-TH",
    name: "Thai Baht",
  },
  {
    currency: "try",
    symbol: "₺",
    maxDecimals: 2,
    locale: "tr-TR",
    name: "Turkish Lira",
  },
  {
    currency: "twd",
    symbol: "NT$",
    maxDecimals: 2,
    locale: "zh-TW",
    name: "New Taiwan Dollar",
  },
  {
    currency: "uah",
    symbol: "₴",
    maxDecimals: 2,
    locale: "uk-UA",
    name: "Ukrainian Hryvnia",
  },
  {
    currency: "vef",
    symbol: "Bs",
    maxDecimals: 2,
    locale: "es-VE",
    name: "Venezuelan Bolívar",
  },
  {
    currency: "vnd",
    symbol: "₫",
    maxDecimals: 2,
    locale: "vi-VN",
    name: "Vietnamese Dong",
  },
  {
    currency: "zar",
    symbol: "R",
    maxDecimals: 2,
    locale: "en-ZA",
    name: "South African Rand",
  },
];

export const SUPPORTED_LOCALE_FIAT_CURRENCIES = [
  "usd",
  "aed",
  "ars",
  "aud",
  "bdt",
  "bhd",
  "bmd",
  "brl",
  "cad",
  "chf",
  "clp",
  "cny",
  "czk",
  "dkk",
  "eur",
  "gbp",
  "gel",
  "hkd",
  "huf",
  "idr",
  "ils",
  "inr",
  "jpy",
  "krw",
  "kwd",
  "lkr",
  "mmk",
  "mxn",
  "mvr",
  "nyr",
  "ngn",
  "nok",
  "nzk",
  "php",
  "pkr",
  "pln",
  "rub",
  "sar",
  "sek",
  "sgd",
  "thb",
  "try",
  "twd",
  "uah",
  "vef",
  "vnd",
  "zar",
];

export const LanguageToFiatCurrency: TypeLanguageToFiatCurrency = {
  default: "usd",
  ko: "krw",
};

export const AdditionalSignInPrepend: RegisterOption[] | undefined =
  ADDITIONAL_SIGN_IN_PREPEND;

export const AdditionalIntlMessages: IntlMessages = ADDITIONAL_INTL_MESSAGES;

export const AmplitudeApiKey =
  process.env.NODE_ENV === "production"
    ? PROD_AMPLITUDE_API_KEY
    : DEV_AMPLITUDE_API_KEY;

export const AuthApiKey =
  process.env.NODE_ENV === "production"
    ? PROD_AUTH_CLIENT_ID
    : DEV_AUTH_CLIENT_ID;

export const ICNSInfo = {
  chainId: "osmosis-1",
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};

// If not needed, just set as empty string ("")
export const ICNSFrontendLink: string = "https://app.icns.xyz";

export interface FiatOnRampServiceInfo {
  serviceId: string;
  serviceName: string;
  buyOrigin: string;
  buySupportCoinDenomsByChainId: Record<string, string[] | undefined>;
  apiKey?: string;
}

export const FiatOnRampServiceInfos: FiatOnRampServiceInfo[] = [
  {
    serviceId: "kado",
    serviceName: "Kado",
    buyOrigin: "https://app.kado.money",
    buySupportCoinDenomsByChainId: {
      "osmosis-1": ["USDC"],
      "juno-1": ["USDC"],
      "phoenix-1": ["USDC"],
      "cosmoshub-4": ["ATOM"],
      "injective-1": ["USDT"],
    },
  },
  {
    serviceId: "transak",
    serviceName: "Transak",
    buyOrigin: "https://global.transak.com",
    buySupportCoinDenomsByChainId: {
      "osmosis-1": ["OSMO"],
      "cosmoshub-4": ["ATOM"],
      "secret-4": ["SCRT"],
      "injective-1": ["INJ"],
    },
  },
  {
    serviceId: "moonpay",
    serviceName: "Moonpay",
    buyOrigin: "https://buy.moonpay.com",
    buySupportCoinDenomsByChainId: {
      "cosmoshub-4": ["ATOM"],
      "kava_2222-10": ["KAVA"],
    },
  },
];
