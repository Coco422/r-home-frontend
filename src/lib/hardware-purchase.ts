import { GPUS, type GpuId } from "./vram";

export const HARDWARE_PURCHASE_AS_OF = "2026-07-14";
export const USD_CNY_RATE = 7.18;

export type Currency = "CNY" | "USD";

export type PriceRange = {
  lowCny: number;
  typicalCny: number;
  highCny: number;
};

export type QuotedPrice = {
  amount: number;
  currency: Currency;
  qualifier?: "起";
};

export type PurchaseSource = {
  seller: string;
  label: string;
  url: string;
  checkedOn: string;
  /** Date on which the listed price was publicly observed, when known. */
  quotedOn?: string;
  market: string;
  condition: string;
  quotedPrice?: QuotedPrice;
  note: string;
};

export const HARDWARE_PURCHASE_SOURCES = {
  "rtx-4060ti-8-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "华硕 ROG STRIX RTX 4060 Ti O8G GAMING 8GB",
    url: "https://m.zol.com.cn/article/10302782.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-08-13",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 3_382.01, currency: "CNY" },
    note: "页面列出原价 ¥3,660.01、活动售价 ¥3,399、实付 ¥3,382.01；仅对应该华硕非公版和当时优惠条件。",
  },
  "rtx-4060ti-16-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "技嘉 RTX 4060 Ti WINDFORCE OC 16G",
    url: "https://diy.zol.com.cn/952/9523519.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-02-24",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 3_729.26, currency: "CNY" },
    note: "页面列出标价 ¥3,949、领券后实付 ¥3,729.26；仅对应该技嘉非公版和当时优惠条件。",
  },
  "rtx-4070super-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "技嘉 RTX 4070 SUPER 12GB",
    url: "https://diy.zol.com.cn/940/9407448_all.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-01-20",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 5_139, currency: "CNY" },
    note: "页面列出活动售价 ¥5,499、优惠后 ¥5,139；仅对应该技嘉非公版和当时优惠条件。",
  },
  "rtx-4070ti-super-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "RTX 4070 Ti SUPER / RTX 5070 Ti 16GB 混合促销记录",
    url: "https://m.zol.com.cn/article/10112285.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-07-09",
    market: "中国大陆",
    condition: "混合 SKU 促销参考",
    quotedPrice: { amount: 7_828.13, currency: "CNY" },
    note: "正文和导购链接混列 RTX 4070 Ti SUPER / RTX 5070 Ti，无法严格确认 ¥7,828.13 对应的准确 SKU；只作来源参考，不能生成部署总价。",
  },
  "rtx-4080super-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "电竞叛客 AX RTX 4080 SUPER X3W MAX 16GB",
    url: "https://m.zol.com.cn/article/10122600.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-07-11",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 7_809.76, currency: "CNY" },
    note: "页面列出活动售价 ¥7,849、实付低至 ¥7,809.76；仅对应该非公版和当时优惠条件。",
  },
  "rtx-4090-retail": {
    seller: "中关村在线 / 成都强川",
    label: "GeForce RTX 4090 Founders Edition 24GB",
    url: "https://m.zol.com.cn/article/10793088.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-11-10",
    market: "中国大陆",
    condition: "渠道单卡标价快照",
    quotedPrice: { amount: 22_489, currency: "CNY" },
    note: "公开渠道单卡报价；请确认是否为全新、含税、是否带原厂保修及当地库存。",
  },
  "rtx-5060ti-16-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "盈通 RTX 5060 Ti 16GB 大地之神",
    url: "https://m.zol.com.cn/article/11848550.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2026-05-22",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 3_678.51, currency: "CNY" },
    note: "页面列出活动售价 ¥4,099、优惠后 ¥3,678.51；仅对应该盈通非公版和当时优惠条件。",
  },
  "rtx-5070-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "七彩虹 RTX 5070 12GB",
    url: "https://m.zol.com.cn/article/9966828.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-06-15",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 5_088, currency: "CNY" },
    note: "页面列出原价 ¥5,698、优惠后 ¥5,088；仅对应该七彩虹非公版和当时优惠条件。",
  },
  "rtx-5070ti-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "微星 RTX 5070 Ti GAMING TRIO 16GB",
    url: "https://m.zol.com.cn/article/10047243.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-06-29",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 7_882.96, currency: "CNY" },
    note: "页面列出原价 ¥8,019、促销实付 ¥7,882.96；仅对应该微星非公版和当时优惠条件。",
  },
  "rtx-5080-retail": {
    seller: "中关村在线 / 京东促销记录",
    label: "微星 RTX 5080 VANGUARD SOC 16GB",
    url: "https://m.zol.com.cn/article/9563785.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-03-06",
    market: "中国大陆",
    condition: "京东促销实付价快照",
    quotedPrice: { amount: 12_934.01, currency: "CNY" },
    note: "页面列出活动售价 ¥12,999、实付 ¥12,934.01；仅对应该微星非公版和当时优惠条件。",
  },
  "rtx-5090d-retail-2026": {
    seller: "中关村在线 / 京东自营上架记录",
    label: "微星 RTX 5090 D GAMING TRIO 32GB",
    url: "https://ai.zol.com.cn/1121/11217560.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2026-01-21",
    market: "中国大陆",
    condition: "京东自营上架标价参考",
    quotedPrice: { amount: 25_999, currency: "CNY" },
    note: "对应 RTX 5090 D，不是所选国际版 RTX 5090；原文也提示尚不能确认是否为正式售价。",
  },
  "rtx-a5000-newegg": {
    seller: "Newegg / Tech Trends",
    label: "PNY VCNRTXA5000-PB RTX A5000 24GB",
    url: "https://www.newegg.com/pny-technologies-inc-vcnrtxa5000-pb-rtx-a5000-24gb-graphics-card/p/N82E16814133832",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售新品",
    quotedPrice: { amount: 2_668, currency: "USD" },
    note: "页面未标原始发布日期；税、运费、进口与国内保修另计。",
  },
  "rtx-a6000-newegg": {
    seller: "Newegg / Tech Trends",
    label: "PNY VCNRTXA6000-PB RTX A6000 48GB",
    url: "https://www.newegg.com/pny-technologies-inc-vcnrtxa6000-pb-rtx-a6000-48gb-graphics-card/p/N82E16814133822",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售新品",
    quotedPrice: { amount: 5_790, currency: "USD" },
    note: "页面未标原始发布日期；采购前应复核卖家、税费与物流。",
  },
  "rtx-6000-ada-newegg": {
    seller: "Newegg / PlatinumMicro",
    label: "PNY VCNRTX6000ADA-PB RTX 6000 Ada 48GB",
    url: "https://www.newegg.com/pny-technologies-inc-vcnrtx6000ada-pb-rtx-6000-ada-48gb-graphics-card/p/N82E16814133886",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售新品",
    quotedPrice: { amount: 7_229, currency: "USD" },
    note: "页面未标原始发布日期；批量采购价格与进口成本需另询。",
  },
  "rtx-pro-4000-newegg": {
    seller: "Newegg / antonline",
    label: "PNY VCNRTXPRO4000B-PB RTX PRO 4000 Blackwell 24GB",
    url: "https://www.newegg.com/pny-technologies-inc-blackwell-vcnrtxpro4000b-pb-rtx-pro-4000-24gb-graphics-card/p/N82E16814985047",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售新品",
    quotedPrice: { amount: 2_211.8, currency: "USD" },
    note: "页面未标原始发布日期；税、运费、进口与国内保修另计。",
  },
  "rtx-pro-4500-newegg": {
    seller: "Newegg",
    label: "PNY VCNRTXPRO4500B-PB RTX PRO 4500 Blackwell 32GB",
    url: "https://www.newegg.com/pny-technologies-inc-blackwell-vcnrtxpro4500b-pb-rtx-pro-4500-32gb-graphics-card/p/N82E16814985048",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售新品",
    quotedPrice: { amount: 3_445.99, currency: "USD" },
    note: "页面未标原始发布日期；税、运费、进口与国内保修另计。",
  },
  "rtx-pro-5000-newegg": {
    seller: "Newegg / Alliance Group (USA)",
    label: "PNY VCNRTXPRO5000B-PB RTX PRO 5000 Blackwell 48GB",
    url: "https://www.newegg.com/pny-technologies-inc-blackwell-vcnrtxpro5000b-pb-rtx-pro-5000-48gb-graphics-card/p/N82E16814985049",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "第三方公开零售新品",
    quotedPrice: { amount: 6_490, currency: "USD" },
    note: "页面未标原始发布日期；第三方卖家、税、运费、进口与保修需复核。",
  },
  "rtx-pro-6000-newegg": {
    seller: "Newegg / Velztorm",
    label: "PNY RTX PRO 6000 Blackwell Workstation Edition 96GB",
    url: "https://www.newegg.com/p/2VV-000K-00143",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "第三方公开零售新品",
    quotedPrice: { amount: 13_645, currency: "USD" },
    note: "页面未标原始发布日期；第三方卖家、税、运费、进口与保修需复核。",
  },
  "l40s-newegg": {
    seller: "Newegg",
    label: "NVIDIA L40S 48GB · PN 900-2G133-0080-000",
    url: "https://www.newegg.com/p/N82E16888892001",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售新品",
    quotedPrice: { amount: 8_095.99, currency: "USD" },
    note: "页面标注限购 2 且不可退；批量供货、税、运费和进口成本需另询。",
  },
  "h100-pcie-newegg": {
    seller: "Newegg / High Performance Tech",
    label: "PNY H100 PCIe 80GB HBM3 · NVH100TCGPU-KIT",
    url: "https://www.newegg.com/p/N82E16814133874",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售新品",
    quotedPrice: { amount: 28_980, currency: "USD" },
    note: "同页另有 US$29,500 选项；只适用于 PCIe 单卡，不适用于 SXM、HGX 或 NVL。",
  },
  "a100-80-cn-low": {
    seller: "中关村在线 / 成都强川科技",
    label: "NVIDIA Tesla A100 80G · 80GB",
    url: "https://price.zol.com.cn/1199/11996222.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2026-06-15",
    market: "中国大陆",
    condition: "渠道单卡低位报价快照",
    quotedPrice: { amount: 86_999, currency: "CNY" },
    note: "页面写明优惠价 ¥86,999、价格采集日期 2026-06-15；同一型号商家报价波动很大，需确认全新 / 工包、税票与保修。",
  },
  "a100-80-cn-latest": {
    seller: "中关村在线 / 成都强川科技",
    label: "NVIDIA Tesla A100 80G · 80GB",
    url: "https://price.zol.com.cn/1204/12047240.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2026-06-25",
    market: "中国大陆",
    condition: "渠道单卡报价快照",
    quotedPrice: { amount: 148_000, currency: "CNY" },
    note: "页面写明特价 ¥148,000、价格采集日期 2026-06-25；同一型号商家报价波动很大，需确认全新 / 工包、税票与保修。",
  },
  "a100-80-cn-warranty": {
    seller: "中关村在线 / 成都强川科技",
    label: "NVIDIA Tesla A100 80G · 原版 3 年保修",
    url: "https://price.zol.com.cn/1191/11918163.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2026-06-02",
    market: "中国大陆",
    condition: "渠道单卡报价快照",
    quotedPrice: { amount: 155_000, currency: "CNY" },
    note: "页面写明原版 3 年保修、优惠价 ¥155,000；保修与供货条件不同于低位报价，不能把这些数字视为统一市场价。",
  },
  "h100-pcie-cn-retail": {
    seller: "新浪科技 / 中关村在线渠道报价",
    label: "NVIDIA Tesla H100 80G · 80GB",
    url: "https://finance.sina.com.cn/tech/roll/2025-04-22/doc-inetzvkq7634899.shtml",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2025-04-22",
    market: "中国大陆",
    condition: "北京现货渠道单卡报价快照",
    quotedPrice: { amount: 196_000, currency: "CNY" },
    note: "原文写明北京商家现货优惠价 ¥196,000；请在采购前确认 PCIe 形态、全新状态、税票和保修。",
  },
  "h200-cn-reported": {
    seller: "快科技",
    label: "NVIDIA H200 芯片 · 国区报道报价",
    url: "https://news.mydrivers.com/1/1096/1096394.htm",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2026-01-04",
    market: "中国大陆",
    condition: "行业报道芯片价",
    quotedPrice: { amount: 190_000, currency: "CNY" },
    note: "报道援引消息人士称单颗 H200 约 ¥190,000、8 颗机柜约 ¥1,500,000；不是同 SKU 零售商品页，不应用于自动生成服务器总价。",
  },
  "rtx-5000-ada-cn-history": {
    seller: "凤凰网 / 国内电商上架报道",
    label: "RTX 5000 Ada Generation · 32GB GDDR6",
    url: "https://i.ifeng.com/c/8TTogiEkADz",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2023-09-29",
    market: "中国大陆",
    condition: "历史国内电商上架价",
    quotedPrice: { amount: 35_999, currency: "CNY" },
    note: "历史上架报道，不能代表当前渠道库存、保修或成交价；只作为同 SKU 价格参考。",
  },
  "rtx-2000-ada-history": {
    seller: "cnBeta / 发布报道",
    label: "RTX 2000 Ada Generation · 16GB GDDR6",
    url: "https://www.cnbeta.com.tw/articles/tech/1418469.htm",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    quotedOn: "2024-02-16",
    market: "海外 / 人民币折算",
    condition: "历史发布价折算",
    quotedPrice: { amount: 4_500, currency: "CNY" },
    note: "原文为 US$625、约 ¥4,500 的发布价折算，并非中国大陆实时零售价；只作为同 SKU 价格参考。",
  },
  "mac-studio-m3-ultra-cn": {
    seller: "Apple 中国在线商店",
    label: "Mac Studio · M3 Ultra · 96GB 统一内存 · 1TB SSD · MU973CH/A",
    url: "https://www.apple.com.cn/shop/buy-mac/mac-studio",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "官方整机价",
    quotedPrice: { amount: 44_999, currency: "CNY" },
    note: "对应 M3 Ultra 28 核 CPU / 60 核 GPU、96GB 统一内存、1TB SSD 的完整整机配置。",
  },
  "mac-studio-m4-max-64-cn": {
    seller: "Apple 中国在线商店",
    label: "Mac Studio · M4 Max · 64GB 统一内存 · 512GB SSD",
    url: "https://www.apple.com.cn/shop/buy-mac/mac-studio",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "官方定制整机价",
    quotedPrice: { amount: 25_249, currency: "CNY" },
    note: "Apple 中国配置数据：M4 Max 14 核 CPU / 32 核 GPU 基础 36GB/512GB ¥19,999，64GB 内存升级 +¥5,250；合计 ¥25,249。",
  },
  "mac-studio-m2-ultra-retired": {
    seller: "Apple Newsroom",
    label: "Mac Studio · M2 Ultra · 最高 192GB 统一内存",
    url: "https://www.apple.com/newsroom/2023/06/apple-unveils-new-mac-studio-and-brings-apple-silicon-to-mac-pro/",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "已停产 / 无当前同配置官方价",
    note: "发布页只给出全系起售价，不能用于 M2 Ultra 192GB；应按二手、翻新或渠道整机询价。",
  },
  "dgx-spark-asus-newegg": {
    seller: "Newegg",
    label: "ASUS Ascent GX10 · DGX Spark / GB10 · 128GB LPDDR5x · 1TB",
    url: "https://www.newegg.com/asus-ascent-gx10-mini-pc/p/N82E16859110044",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "公开零售整机新品",
    quotedPrice: { amount: 3_976.99, currency: "USD" },
    note: "页面列出现价 US$3,976.99、划线价 US$4,068.99；仅对应 ASUS Ascent GX10 SKU GX10-GG0010BN，不含进口税运和国内保修。",
  },
  "host-platform-method": {
    seller: "公开零售与整机配置样本",
    label: "GPU 主机平台拆分方法",
    url: "https://www.newegg.com/p/N82E16889850018",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆采购预算",
    condition: "静态平台预留",
    note: "链接用于核对整机必须包含 CPU、内存、存储、供电与机箱；下列人民币区间是静态初筛预留，并非该海外整机的换算报价。",
  },
} as const satisfies Record<string, PurchaseSource>;

export type PurchaseSourceId = keyof typeof HARDWARE_PURCHASE_SOURCES;

export type BudgetLineKind =
  | "appliance"
  | "gpu"
  | "cpu"
  | "memory"
  | "storage"
  | "motherboard"
  | "chassis"
  | "psu"
  | "network";

export type PurchaseLine = {
  id: string;
  kind: BudgetLineKind;
  label: string;
  quantity: number;
  unit: "张" | "颗" | "套";
  unitPrice: PriceRange;
  subtotal: PriceRange;
  sourceIds: readonly PurchaseSourceId[];
  isEstimate?: boolean;
};

export type PurchasePlanStatus =
  | "priced"
  | "partial"
  | "blocked"
  | "requires-quote"
  | "unavailable";

export type PurchasePlan = {
  status: PurchasePlanStatus;
  gpuCount: number;
  planLabel: string;
  lines: readonly PurchaseLine[];
  total: PriceRange | null;
  included: readonly string[];
  excluded: readonly string[];
  sourceIds: readonly PurchaseSourceId[];
  priceBasis?: string;
  isAppliance?: boolean;
  message?: string;
};

export type PurchaseBudget = {
  selected: PurchasePlan;
  deployable: PurchasePlan | null;
};

export type PurchaseBudgetInput = {
  gpuId: GpuId;
  gpuCount: number;
  minimumGpuCount: number | null;
  fits: boolean;
  contextExceedsWindow: boolean;
  cpuOffload: boolean;
  offloadedWeightsGiB: number;
};

type HostLineTemplate = Omit<PurchaseLine, "quantity" | "subtotal">;

type HostProfile = {
  maxGpuCount: number;
  label: string;
  baseMemoryGiB: number;
  maxQuotedMemoryGiB: number;
  lines: readonly HostLineTemplate[];
};

type PurchaseTarget = {
  kind?: "appliance";
  price?: PriceRange;
  priceMode?: "reference";
  sourceIds: readonly PurchaseSourceId[];
  maxCatalogGpuCount?: number;
  priceBasis?: string;
  included?: readonly string[];
  excluded?: readonly string[];
  note?: string;
};

const exact = (amount: number): PriceRange => ({
  lowCny: amount,
  typicalCny: amount,
  highCny: amount,
});

function quotedPriceOf(sourceId: PurchaseSourceId) {
  const quote = (HARDWARE_PURCHASE_SOURCES[sourceId] as PurchaseSource)
    .quotedPrice;
  if (!quote) throw new Error(`${sourceId} 缺少可换算的公开标价`);
  return quote;
}

function cnySourcePrice(sourceId: PurchaseSourceId) {
  const quote = quotedPriceOf(sourceId);
  if (quote.currency !== "CNY") {
    throw new Error(`${sourceId} 不是人民币标价`);
  }
  return exact(quote.amount);
}

function usdSourcePrice(sourceId: PurchaseSourceId) {
  const quote = quotedPriceOf(sourceId);
  if (quote.currency !== "USD") {
    throw new Error(`${sourceId} 不是美元标价`);
  }
  return exact(Math.round(quote.amount * USD_CNY_RATE));
}

function usdRetailBasis(sourceId: PurchaseSourceId, item = "GPU") {
  const quote = quotedPriceOf(sourceId);
  if (quote.currency !== "USD") {
    throw new Error(`${sourceId} 不是美元标价`);
  }
  return `${item} 按海外公开零售价 US$${quote.amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} × ¥${USD_CNY_RATE}/US$ 固定换算（${HARDWARE_PURCHASE_AS_OF}）`;
}

function cnySnapshotBasis(sourceId: PurchaseSourceId) {
  const source = HARDWARE_PURCHASE_SOURCES[sourceId] as PurchaseSource;
  const quote = quotedPriceOf(sourceId);
  if (quote.currency !== "CNY") {
    throw new Error(`${sourceId} 不是人民币标价`);
  }
  const quoteDate = source.quotedOn ?? HARDWARE_PURCHASE_AS_OF;
  return `GPU 按${source.market}${source.condition} ¥${quote.amount.toLocaleString("zh-CN")}（报价快照 ${quoteDate}）`;
}

function cnySnapshotTarget(
  sourceId: PurchaseSourceId,
  maxCatalogGpuCount = 2,
): PurchaseTarget {
  return {
    price: cnySourcePrice(sourceId),
    sourceIds: [sourceId],
    maxCatalogGpuCount,
    priceBasis: cnySnapshotBasis(sourceId),
    note: "单卡价格采用具名品牌与卖家的公开快照；库存、型号、优惠、税票和保修条件会改变实际成交价。",
  };
}

const range = (lowCny: number, typicalCny: number, highCny: number): PriceRange => ({
  lowCny,
  typicalCny,
  highCny,
});

const hostLine = (
  id: string,
  kind: BudgetLineKind,
  label: string,
  price: PriceRange,
): HostLineTemplate => ({
  id,
  kind,
  label,
  unit: "套",
  unitPrice: price,
  sourceIds: ["host-platform-method"],
  isEstimate: true,
});

const HOST_PROFILES: readonly HostProfile[] = [
  {
    maxGpuCount: 1,
    label: "单卡工作站平台预留",
    baseMemoryGiB: 128,
    maxQuotedMemoryGiB: 256,
    lines: [
      hostLine("cpu", "cpu", "CPU", range(1_800, 2_600, 3_500)),
      hostLine("motherboard", "motherboard", "主板", range(1_500, 2_000, 2_500)),
      hostLine("memory-128", "memory", "128GB 内存", range(2_000, 3_000, 3_500)),
      hostLine("storage", "storage", "2TB NVMe SSD", range(800, 1_100, 1_300)),
      hostLine(
        "chassis",
        "chassis",
        "机箱 / 1500W 电源 / 散热",
        range(3_500, 4_300, 5_500),
      ),
      hostLine("network", "network", "基础网络 / 线材", range(400, 600, 700)),
    ],
  },
  {
    maxGpuCount: 2,
    label: "双卡工作站 / 4U 平台预留",
    baseMemoryGiB: 256,
    maxQuotedMemoryGiB: 512,
    lines: [
      hostLine("cpu", "cpu", "Threadripper / EPYC / Xeon CPU", range(4_500, 6_000, 8_000)),
      hostLine("motherboard", "motherboard", "多 PCIe 主板 / 4U 机箱", range(5_500, 8_500, 12_000)),
      hostLine("memory-256", "memory", "256GB ECC 内存", range(4_500, 6_250, 8_000)),
      hostLine("storage", "storage", "4TB NVMe 存储", range(1_500, 2_200, 3_000)),
      hostLine("psu", "psu", "2kW 电源 / 散热", range(5_000, 7_000, 9_000)),
      hostLine("network", "network", "基础网络 / 线材", range(1_000, 1_500, 2_000)),
    ],
  },
  {
    maxGpuCount: 4,
    label: "4-GPU 服务器平台预留",
    baseMemoryGiB: 512,
    maxQuotedMemoryGiB: 512,
    lines: [
      hostLine("cpu", "cpu", "服务器 CPU", range(8_000, 12_000, 16_000)),
      hostLine("motherboard", "motherboard", "服务器主板 / 背板 / 4U GPU 机箱", range(18_000, 26_000, 35_000)),
      hostLine("memory-512", "memory", "512GB ECC 内存", range(10_000, 14_000, 18_000)),
      hostLine("storage", "storage", "企业级 NVMe 存储", range(2_000, 3_000, 4_000)),
      hostLine("psu", "psu", "冗余电源 / 散热", range(8_000, 11_000, 12_000)),
      hostLine("network", "network", "25GbE 基础网络", range(4_000, 5_000, 5_000)),
    ],
  },
];

const PURCHASE_TARGETS: Partial<Record<GpuId, PurchaseTarget>> = {
  "rtx-4060ti-8": {
    ...cnySnapshotTarget("rtx-4060ti-8-retail"),
  },
  "rtx-4060ti-16": {
    ...cnySnapshotTarget("rtx-4060ti-16-retail"),
  },
  "rtx-4070super-12": {
    ...cnySnapshotTarget("rtx-4070super-retail"),
  },
  "rtx-4070ti-super-16": {
    price: cnySourcePrice("rtx-4070ti-super-retail"),
    priceMode: "reference",
    sourceIds: ["rtx-4070ti-super-retail"],
    maxCatalogGpuCount: 2,
    priceBasis: "GPU 按混合 SKU 促销记录（不用于整机总价）",
    note: "该页面混列 RTX 4070 Ti SUPER 与 RTX 5070 Ti，不能把其中金额作为所选 RTX 4070 Ti SUPER 的精确购置价。",
  },
  "rtx-4080super-16": {
    ...cnySnapshotTarget("rtx-4080super-retail"),
  },
  "rtx-4090": {
    ...cnySnapshotTarget("rtx-4090-retail"),
  },
  "rtx-5060ti-16": {
    ...cnySnapshotTarget("rtx-5060ti-16-retail"),
  },
  "rtx-5070-12": {
    ...cnySnapshotTarget("rtx-5070-retail"),
  },
  "rtx-5070ti-16": {
    ...cnySnapshotTarget("rtx-5070ti-retail"),
  },
  "rtx-5090": {
    sourceIds: ["rtx-5090d-retail-2026"],
    maxCatalogGpuCount: 2,
    note: "公开参考是 RTX 5090 D，而非所选国际版 RTX 5090 的同一算力 SKU；请按准确型号、供货与保修条件询价。",
  },
  "rtx-5080-16": {
    ...cnySnapshotTarget("rtx-5080-retail"),
  },
  "rtx-a5000-24": {
    price: usdSourcePrice("rtx-a5000-newegg"),
    sourceIds: ["rtx-a5000-newegg"],
    maxCatalogGpuCount: 4,
    priceBasis: usdRetailBasis("rtx-a5000-newegg"),
    note: "海外新品零售价换算；税、运费、进口与国内保修另计。",
  },
  "rtx-a6000-48": {
    price: usdSourcePrice("rtx-a6000-newegg"),
    sourceIds: ["rtx-a6000-newegg"],
    maxCatalogGpuCount: 4,
    priceBasis: usdRetailBasis("rtx-a6000-newegg"),
    note: "海外新品零售价换算；采购前应复核卖家、税费与物流。",
  },
  "rtx-6000-ada-48": {
    price: usdSourcePrice("rtx-6000-ada-newegg"),
    sourceIds: ["rtx-6000-ada-newegg"],
    maxCatalogGpuCount: 4,
    priceBasis: usdRetailBasis("rtx-6000-ada-newegg"),
    note: "海外新品零售价换算；批量采购价格与进口成本需另询。",
  },
  "rtx-2000-ada-16": {
    price: cnySourcePrice("rtx-2000-ada-history"),
    priceMode: "reference",
    sourceIds: ["rtx-2000-ada-history"],
    maxCatalogGpuCount: 4,
    priceBasis: "GPU 按历史发布价折算（不用于整机总价）",
    note: "该来源不是中国大陆实时零售价；请按准确品牌、税票和保修条件询价。",
  },
  "rtx-5000-ada-32": {
    price: cnySourcePrice("rtx-5000-ada-cn-history"),
    priceMode: "reference",
    sourceIds: ["rtx-5000-ada-cn-history"],
    maxCatalogGpuCount: 4,
    priceBasis: "GPU 按历史国内电商上架价（不用于整机总价）",
    note: "该来源是历史电商上架报道；请按准确品牌、税票和保修条件询价。",
  },
  "rtx-pro-4000-24": {
    price: usdSourcePrice("rtx-pro-4000-newegg"),
    sourceIds: ["rtx-pro-4000-newegg"],
    maxCatalogGpuCount: 4,
    priceBasis: usdRetailBasis("rtx-pro-4000-newegg"),
    note: "海外新品零售价换算；税、运费、进口与国内保修另计。",
  },
  "rtx-pro-4500-32": {
    price: usdSourcePrice("rtx-pro-4500-newegg"),
    sourceIds: ["rtx-pro-4500-newegg"],
    maxCatalogGpuCount: 4,
    priceBasis: usdRetailBasis("rtx-pro-4500-newegg"),
    note: "海外新品零售价换算；税、运费、进口与国内保修另计。",
  },
  "rtx-pro-5000-48": {
    price: usdSourcePrice("rtx-pro-5000-newegg"),
    sourceIds: ["rtx-pro-5000-newegg"],
    maxCatalogGpuCount: 4,
    priceBasis: usdRetailBasis("rtx-pro-5000-newegg"),
    note: "第三方卖家海外新品价换算；税、运费、进口与国内保修另计。",
  },
  "rtx-pro-6000-96": {
    price: usdSourcePrice("rtx-pro-6000-newegg"),
    sourceIds: ["rtx-pro-6000-newegg"],
    maxCatalogGpuCount: 4,
    priceBasis: usdRetailBasis("rtx-pro-6000-newegg"),
    note: "第三方卖家海外新品价换算；税、运费、进口与国内保修另计。",
  },
  "l40s-48": {
    price: usdSourcePrice("l40s-newegg"),
    sourceIds: ["l40s-newegg"],
    maxCatalogGpuCount: 2,
    priceBasis: usdRetailBasis("l40s-newegg"),
    note: "页面标注限购 2 且不可退；批量供货、税、运费和进口成本需另询。",
  },
  "a100-80": {
    price: range(86_999, 148_000, 155_000),
    sourceIds: [
      "a100-80-cn-low",
      "a100-80-cn-latest",
      "a100-80-cn-warranty",
    ],
    maxCatalogGpuCount: 4,
    priceBasis: "GPU 按中国大陆渠道单卡公开报价区间 ¥86,999–¥155,000（报价快照 2026-06）",
    note: "默认值采用较新的 ¥148,000 报价；低位、原版 3 年保修、全新 / 工包和税票条件不同，SXM / HGX 方案仍需整机询价。",
  },
  "h100-pcie-80": {
    ...cnySnapshotTarget("h100-pcie-cn-retail", 4),
  },
  "h200-141": {
    price: cnySourcePrice("h200-cn-reported"),
    priceMode: "reference",
    sourceIds: ["h200-cn-reported"],
    maxCatalogGpuCount: 4,
    priceBasis: "GPU 按行业报道的国区芯片价（不用于整机总价）",
    note: "报道价格不是同 SKU 零售商品页；H200 PCIe、SXM、NVL 和整柜方案都应按准确配置询价。",
  },
  "mac-studio-m3-ultra-96": {
    kind: "appliance",
    price: cnySourcePrice("mac-studio-m3-ultra-cn"),
    sourceIds: ["mac-studio-m3-ultra-cn"],
    priceBasis: "整机按 Apple 中国在线商店同配置官方价",
    included: ["M3 Ultra SoC", "96GB 统一内存", "1TB SSD", "机箱 / 电源"],
    excluded: ["显示器", "外设", "AppleCare+ / 延保", "运保"],
    note: "完整 Mac Studio 整机价，不叠加 GPU 或服务器平台预算。",
  },
  "mac-studio-m4-max-64": {
    kind: "appliance",
    price: cnySourcePrice("mac-studio-m4-max-64-cn"),
    sourceIds: ["mac-studio-m4-max-64-cn"],
    priceBasis: "整机按 Apple 中国在线商店同配置定制价",
    included: ["M4 Max SoC", "64GB 统一内存", "512GB SSD", "机箱 / 电源"],
    excluded: ["显示器", "外设", "AppleCare+ / 延保", "运保"],
    note: "完整 Mac Studio 整机价，不叠加 GPU 或服务器平台预算。",
  },
  "mac-studio-m4-max-128": {
    kind: "appliance",
    sourceIds: ["mac-studio-m4-max-64-cn"],
    note: "当前 Apple 中国配置页没有 128GB 对应配置；不能用 64GB 设备价格代替，请按准确整机 SKU 询价。",
  },
  "mac-studio-m2-ultra-192": {
    kind: "appliance",
    sourceIds: ["mac-studio-m2-ultra-retired"],
    note: "该配置已停产且没有当前同配置官方价；请按二手、翻新或渠道整机询价。",
  },
  "mac-studio-m3-ultra-256": {
    kind: "appliance",
    sourceIds: ["mac-studio-m3-ultra-cn"],
    note: "Apple 配置页提供该内存档位，但本期未核验其精确总价；请在官方定制页确认。",
  },
  "mac-studio-m3-ultra-512": {
    kind: "appliance",
    sourceIds: ["mac-studio-m3-ultra-cn"],
    note: "Apple 配置页提供该内存档位，但本期未核验其精确总价；请在官方定制页确认。",
  },
  "dgx-spark-128": {
    kind: "appliance",
    price: usdSourcePrice("dgx-spark-asus-newegg"),
    sourceIds: ["dgx-spark-asus-newegg"],
    priceBasis: usdRetailBasis("dgx-spark-asus-newegg", "整机"),
    included: ["NVIDIA GB10", "128GB LPDDR5x", "1TB PCIe Gen4 NVMe", "机箱 / 电源"],
    excluded: ["进口税费", "运保", "显示器", "外设", "国内保修 / 延保"],
    note: "完整 ASUS Ascent GX10（DGX Spark）整机价格，不叠加 GPU 或服务器平台预算。",
  },
};

const APPLIANCE_PREFIXES = ["mac-", "dgx-spark", "ryzen-ai-"];

const INCLUDED = [
  "GPU",
  "CPU",
  "内存",
  "主板",
  "SSD",
  "机箱 / 电源 / 散热",
  "基础网络",
] as const;

const EXCLUDED = [
  "税费",
  "运保",
  "机柜 / PDU",
  "UPS",
  "电力",
  "运维",
  "软件许可",
] as const;

export function estimatePurchaseBudget(
  input: PurchaseBudgetInput,
): PurchaseBudget {
  if (input.contextExceedsWindow) {
    return {
      selected: blockedPlan(input.gpuId, input.gpuCount),
      deployable: null,
    };
  }

  const selected = planFor(input.gpuId, input.gpuCount, input);
  const deployable =
    !input.fits &&
    input.minimumGpuCount != null &&
    input.minimumGpuCount > input.gpuCount
      ? planFor(input.gpuId, input.minimumGpuCount, input)
      : null;

  return { selected, deployable };
}

export function getPurchaseSources(
  sourceIds: readonly PurchaseSourceId[],
): { sourceId: PurchaseSourceId; source: PurchaseSource }[] {
  return unique(sourceIds).map((sourceId) => ({
    sourceId,
    source: HARDWARE_PURCHASE_SOURCES[sourceId] as PurchaseSource,
  }));
}

function planFor(
  gpuId: GpuId,
  gpuCount: number,
  input: PurchaseBudgetInput,
): PurchasePlan {
  const gpu = GPUS[gpuId];
  const target = PURCHASE_TARGETS[gpuId];

  if (!target) {
    const isAppliance = APPLIANCE_PREFIXES.some((prefix) =>
      gpuId.startsWith(prefix),
    );
    return unavailablePlan(
      gpu.label,
      gpuCount,
      isAppliance
        ? "该设备应按完整整机 SKU 报价；当前未收录与统一内存 / 存储配置对应的可核验购置价。"
        : "当前设备未收录可核验的公开购置价；请按准确 SKU 向供应商询价。",
    );
  }

  if (target.kind === "appliance") {
    return appliancePlan(gpu.label, gpuCount, target);
  }

  if (!target.price) {
    return quotePlan(
      gpu.label,
      gpuCount,
      target.note ?? "当前未收录可用于整机加总的同 SKU 公开购置价，请按准确型号询价。",
      target.sourceIds,
    );
  }

  const maxCatalogGpuCount = target.maxCatalogGpuCount ?? 1;
  if (gpuCount > maxCatalogGpuCount) {
    return quotePlan(
      gpu.label,
      gpuCount,
      `当前目录最多覆盖 ${maxCatalogGpuCount} 卡的已知平台；更多 GPU 需要评估机箱槽位、散热、供电、互连与多节点网络后整机询价。`,
      target.sourceIds,
    );
  }

  const profile = HOST_PROFILES.find((item) => gpuCount <= item.maxGpuCount);
  if (!profile) {
    return quotePlan(
      gpu.label,
      gpuCount,
      "超过单机静态预算档位，需要按服务器拓扑和机柜网络获取整机报价。",
      target.sourceIds,
    );
  }

  const requiredMemoryGiB = requiredMemory(profile, input);
  const memory = memoryTemplate(profile, requiredMemoryGiB);
  const gpuLine: PurchaseLine = {
    id: "gpu",
    kind: "gpu",
    label: gpu.label,
    quantity: gpuCount,
    unit: "张",
    unitPrice: target.price,
    subtotal: multiply(target.price, gpuCount),
    sourceIds: target.sourceIds,
  };
  const profileLines = profile.lines
    .filter((line) => line.kind !== "memory" || memory != null)
    .map((line) => toLine(line.kind === "memory" ? memory ?? line : line));
  const lines = [gpuLine, ...profileLines];
  const sourceIds = unique([
    ...target.sourceIds,
    ...profileLines.flatMap((line) => line.sourceIds),
  ]);
  const planLabel = `${gpuCount} × ${gpu.label} + ${profile.label}`;

  if (!memory) {
    return {
      status: "partial",
      gpuCount,
      planLabel,
      lines,
      total: null,
      included: INCLUDED,
      excluded: EXCLUDED,
      sourceIds,
      priceBasis: target.priceBasis,
      message: `CPU 卸载建议至少 ${requiredMemoryGiB} GiB 系统内存；当前平台未收录该内存档位的可核验价格，不能给出完整整机总价。`,
    };
  }

  if (target.priceMode === "reference") {
    return {
      status: "partial",
      gpuCount,
      planLabel,
      lines,
      total: null,
      included: INCLUDED,
      excluded: EXCLUDED,
      sourceIds,
      priceBasis: target.priceBasis,
      message: `${target.note ?? "该 GPU 价格仅作参考。"} 因不是当期可核验成交价，本站不据此生成整机总价。`,
    };
  }

  return {
    status: "priced",
    gpuCount,
    planLabel,
    lines,
    total: sum(lines.map((line) => line.subtotal)),
    included: INCLUDED,
    excluded: EXCLUDED,
    sourceIds,
    priceBasis: target.priceBasis,
    message: target.note,
  };
}

function appliancePlan(
  gpuLabel: string,
  gpuCount: number,
  target: PurchaseTarget,
): PurchasePlan {
  if (!target.price) {
    return quotePlan(
      gpuLabel,
      gpuCount,
      target.note ?? "当前未收录该完整设备的同配置公开价格，请按整机 SKU 询价。",
      target.sourceIds,
    );
  }

  const included = target.included ?? ["SoC", "统一内存", "存储", "机箱 / 电源"];
  const excluded = target.excluded ?? EXCLUDED;
  const line: PurchaseLine = {
    id: "appliance",
    kind: "appliance",
    label: `${gpuLabel} 整机`,
    quantity: 1,
    unit: "套",
    unitPrice: target.price,
    subtotal: target.price,
    sourceIds: target.sourceIds,
  };

  return {
    status: "priced",
    gpuCount,
    planLabel: `${gpuLabel} 整机`,
    lines: [line],
    total: target.price,
    included,
    excluded,
    sourceIds: target.sourceIds,
    priceBasis: target.priceBasis,
    isAppliance: true,
    message: target.note,
  };
}

function blockedPlan(gpuId: GpuId, gpuCount: number): PurchasePlan {
  return {
    status: "blocked",
    gpuCount,
    planLabel: `${gpuCount} × ${GPUS[gpuId].label}`,
    lines: [],
    total: null,
    included: [],
    excluded: EXCLUDED,
    sourceIds: [],
    message: "输入与输出 token 已超过模型上下文窗口；增加硬件无法解决该限制。",
  };
}

function unavailablePlan(
  gpuLabel: string,
  gpuCount: number,
  message: string,
): PurchasePlan {
  return {
    status: "unavailable",
    gpuCount,
    planLabel: `${gpuCount} × ${gpuLabel}`,
    lines: [],
    total: null,
    included: [],
    excluded: EXCLUDED,
    sourceIds: [],
    message,
  };
}

function quotePlan(
  gpuLabel: string,
  gpuCount: number,
  message: string,
  sourceIds: readonly PurchaseSourceId[] = [],
): PurchasePlan {
  return {
    status: "requires-quote",
    gpuCount,
    planLabel: `${gpuCount} × ${gpuLabel}`,
    lines: [],
    total: null,
    included: [],
    excluded: EXCLUDED,
    sourceIds,
    message,
  };
}

function requiredMemory(profile: HostProfile, input: PurchaseBudgetInput) {
  if (!input.cpuOffload) return profile.baseMemoryGiB;
  const requested = 32 + Math.max(0, input.offloadedWeightsGiB) * 1.25;
  return Math.max(profile.baseMemoryGiB, memoryTier(requested));
}

function memoryTier(requiredGiB: number) {
  return [64, 128, 256, 512, 1_024].find((tier) => requiredGiB <= tier) ?? 2_048;
}

function memoryTemplate(
  profile: HostProfile,
  requiredGiB: number,
): HostLineTemplate | null {
  if (requiredGiB > profile.maxQuotedMemoryGiB) return null;
  const base = profile.lines.find((line) => line.kind === "memory");
  if (!base) return null;
  if (requiredGiB <= profile.baseMemoryGiB) return base;

  const upgradePrice: Record<number, PriceRange> = {
    256: range(4_200, 6_000, 8_000),
    512: range(9_000, 12_500, 16_000),
  };
  const price = upgradePrice[requiredGiB];
  if (!price) return null;
  return {
    ...base,
    id: `memory-${requiredGiB}`,
    label: `${requiredGiB}GB ECC 内存`,
    unitPrice: price,
  };
}

function toLine(template: HostLineTemplate): PurchaseLine {
  return {
    ...template,
    quantity: 1,
    subtotal: template.unitPrice,
  };
}

function multiply(price: PriceRange, quantity: number): PriceRange {
  return {
    lowCny: money(price.lowCny * quantity),
    typicalCny: money(price.typicalCny * quantity),
    highCny: money(price.highCny * quantity),
  };
}

function sum(prices: readonly PriceRange[]): PriceRange {
  return prices.reduce(
    (total, price) => ({
      lowCny: money(total.lowCny + price.lowCny),
      typicalCny: money(total.typicalCny + price.typicalCny),
      highCny: money(total.highCny + price.highCny),
    }),
    exact(0),
  );
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function unique<Value extends string>(values: readonly Value[]) {
  return [...new Set(values)];
}
