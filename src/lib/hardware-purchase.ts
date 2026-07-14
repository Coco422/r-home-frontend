import { GPUS, type GpuId } from "./vram";

export const HARDWARE_PURCHASE_AS_OF = "2026-07-14";

export type PriceRange = {
  lowCny: number;
  typicalCny: number;
  highCny: number;
};

export type PurchaseSource = {
  seller: string;
  label: string;
  url: string;
  checkedOn: string;
  market: string;
  condition: string;
  note: string;
};

export const HARDWARE_PURCHASE_SOURCES = {
  "rtx-4090d-history": {
    seller: "中关村在线 / 京东促销观察",
    label: "RTX 4090 D 24GB 历史促销价",
    url: "https://m.zol.com.cn/article/8494506.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "历史促销参考",
    note: "对应 4090 D 24GB，而非当前统一新卡现货；旧卡、二手和地区库存波动很大。",
  },
  "rtx-5090d-retail": {
    seller: "什么值得买公开零售记录",
    label: "RTX 5090 D 32GB 零售锚点",
    url: "https://www.smzdm.com/p/142952535/",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "公开零售参考",
    note: "以 5090 D 32GB 为参考，显存相同但并非国际版同一算力 SKU。",
  },
  "rtx-5080-msrp": {
    seller: "NVIDIA 中国",
    label: "GeForce RTX 5080 官方建议零售价",
    url: "https://www.nvidia.cn/geforce/news/gfecnt/20251/rtx-5090-5080-out-now/",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "官方建议零售价",
    note: "¥8,299 为建议零售价，不代表当前渠道或品牌非公版的实际成交价。",
  },
  "rtx-6000-ada-history": {
    seller: "丽台公开上架价转载",
    label: "RTX 6000 Ada 48GB 上架价",
    url: "https://www.163.com/dy/article/HTAT1CP20511B8LM.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "历史公开零售参考",
    note: "公开上架记录较早；实际渠道价、保修和税票条件须另行确认。",
  },
  "rtx-pro-6000-overseas": {
    seller: "Newegg",
    label: "RTX PRO 6000 Blackwell 96GB OEM",
    url: "https://www.newegg.com/p/N82E16888892012",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "海外",
    condition: "海外公开零售",
    note: "页面价 US$11,499.99，按 7.18 折算约 ¥82,600；未含进口、税费、运保与国内保修。",
  },
  "l40s-channel": {
    seller: "中关村在线渠道商品页",
    label: "NVIDIA L40S 48GB 渠道标价",
    url: "https://detail.zol.com.cn/vga/index2102802.shtml",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "渠道标价",
    note: "渠道 SKU、是否含税及供货状态会影响成交价。",
  },
  "a100-pcie-channel": {
    seller: "中关村在线渠道商品页",
    label: "A100 80GB PCIe / 工包公开参考",
    url: "https://vga.zol.com.cn/948/9483965_all.html",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "渠道参考",
    note: "仅适用于 PCIe / 工包公开口径；SXM、HGX 整机和原厂保修须询价。",
  },
  "h100-pcie-channel": {
    seller: "百度爱采购",
    label: "H100 PCIe 80GB 公开 SKU",
    url: "https://b2b.baidu.com/land?id=1bb92e49fc4f1400f349f5579865003310",
    checkedOn: HARDWARE_PURCHASE_AS_OF,
    market: "中国大陆",
    condition: "渠道标价",
    note: "公开 SKU 的报价不等同于企业合同价；请确认 PCIe、税票和保修条件。",
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
  price?: PriceRange;
  sourceIds: readonly PurchaseSourceId[];
  maxCatalogGpuCount: number;
  priceBasis?: string;
  note?: string;
};

const exact = (amount: number): PriceRange => ({
  lowCny: amount,
  typicalCny: amount,
  highCny: amount,
});

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
  "rtx-4090": {
    sourceIds: ["rtx-4090d-history"],
    maxCatalogGpuCount: 2,
    note: "公开记录是 4090 D 的历史促销价，不是所选 RTX 4090 的当前同 SKU 价格；请按准确型号、成色和保修条件询价。",
  },
  "rtx-5090": {
    sourceIds: ["rtx-5090d-retail"],
    maxCatalogGpuCount: 2,
    note: "公开记录是 RTX 5090 D，而非所选国际版 RTX 5090 的同一算力 SKU；请按准确型号和供货条件询价。",
  },
  "rtx-5080-16": {
    price: exact(8_299),
    sourceIds: ["rtx-5080-msrp"],
    maxCatalogGpuCount: 2,
    priceBasis: "GPU 按官方建议零售价（非实时成交价）",
    note: "按 NVIDIA 中国官方建议零售价参考；品牌非公版、库存和税票条件会改变实际成交价。",
  },
  "rtx-6000-ada-48": {
    sourceIds: ["rtx-6000-ada-history"],
    maxCatalogGpuCount: 4,
    note: "公开上架记录较早，不能作为当前成交价；请按准确 SKU、含税和保修条件询价。",
  },
  "rtx-pro-6000-96": {
    price: exact(82_600),
    sourceIds: ["rtx-pro-6000-overseas"],
    maxCatalogGpuCount: 4,
    priceBasis: "GPU 按海外公开零售价折算",
    note: "海外零售价折算，未计进口、税费、运保与国内保修。",
  },
  "l40s-48": {
    price: exact(68_750),
    sourceIds: ["l40s-channel"],
    maxCatalogGpuCount: 4,
    priceBasis: "GPU 按中国大陆渠道标价",
    note: "按渠道标价参考；请确认供货、税票与整机兼容性。",
  },
  "a100-80": {
    sourceIds: ["a100-pcie-channel"],
    maxCatalogGpuCount: 4,
    note: "公开记录只对应 PCIe / 工包口径；所选 A100 80GB 不能据此区分 SXM、HGX 与保修状态，需整机询价。",
  },
  "h100-pcie-80": {
    price: range(225_000, 230_900, 236_800),
    sourceIds: ["h100-pcie-channel"],
    maxCatalogGpuCount: 4,
    priceBasis: "GPU 按中国大陆公开渠道标价",
    note: "公开 PCIe SKU 的渠道参考，企业合同价、税票和保修条件不同。",
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

export function getPurchaseSources(sourceIds: readonly PurchaseSourceId[]) {
  return unique(sourceIds).map((sourceId) => ({
    sourceId,
    source: HARDWARE_PURCHASE_SOURCES[sourceId],
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

  if (!target.price) {
    return quotePlan(
      gpu.label,
      gpuCount,
      target.note ?? "当前未收录可用于整机加总的同 SKU 公开购置价，请按准确型号询价。",
      target.sourceIds,
    );
  }

  if (gpuCount > target.maxCatalogGpuCount) {
    return quotePlan(
      gpu.label,
      gpuCount,
      `当前目录最多覆盖 ${target.maxCatalogGpuCount} 卡的已知平台；更多 GPU 需要评估机箱槽位、散热、供电、互连与多节点网络后整机询价。`,
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
      message: `CPU 卸载建议至少 ${requiredMemoryGiB} GiB 系统内存；当前平台未收录该内存档位的可核验价格，不能给出完整整机总价。`,
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
    lowCny: price.lowCny * quantity,
    typicalCny: price.typicalCny * quantity,
    highCny: price.highCny * quantity,
  };
}

function sum(prices: readonly PriceRange[]): PriceRange {
  return prices.reduce(
    (total, price) => ({
      lowCny: total.lowCny + price.lowCny,
      typicalCny: total.typicalCny + price.typicalCny,
      highCny: total.highCny + price.highCny,
    }),
    exact(0),
  );
}

function unique<Value extends string>(values: readonly Value[]) {
  return [...new Set(values)];
}
