const GIB = 1024 ** 3;
const CACHE_BLOCK_TOKENS = 16;

export const PRECISIONS = {
  fp32: { label: "FP32", bytesPerValue: 4, description: "最高精度" },
  fp16: { label: "FP16 / BF16", bytesPerValue: 2, description: "通用默认" },
  fp8: { label: "FP8", bytesPerValue: 1, description: "需要引擎支持" },
  int8: { label: "INT8", bytesPerValue: 1, description: "常见量化" },
  int4: { label: "INT4", bytesPerValue: 0.5, description: "最低显存" },
} as const;

export type PrecisionId = keyof typeof PRECISIONS;

export const GPU_CATEGORIES = [
  "NVIDIA · GeForce",
  "NVIDIA · 专业卡",
  "NVIDIA · 数据中心",
  "NVIDIA · 本地 AI",
  "Apple Silicon",
  "AMD",
  "AMD · APU",
  "Intel / Habana",
  "自定义",
] as const;

export type DeviceCategory = (typeof GPU_CATEGORIES)[number];

const appleSiliconDevice = (
  label: string,
  memoryGiB: number,
  bandwidthGBs: number,
  tflops: number,
) =>
  ({
    label,
    category: "Apple Silicon",
    memoryGiB,
    bandwidthGBs,
    tflops,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  }) as const;

const amdApuDevice = (
  label: string,
  memoryGiB: number,
  bandwidthGBs: number,
  tflops: number,
) =>
  ({
    label,
    category: "AMD · APU",
    memoryGiB,
    bandwidthGBs,
    tflops,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  }) as const;

export const GPUS = {
  "rtx-2060-6": {
    label: "GeForce RTX 2060",
    category: "NVIDIA · GeForce",
    memoryGiB: 6,
    bandwidthGBs: 336,
    tflops: 6.5,
  },
  "rtx-2080ti-11": {
    label: "GeForce RTX 2080 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 11,
    bandwidthGBs: 616,
    tflops: 13.4,
  },
  "rtx-3060-12": {
    label: "GeForce RTX 3060",
    category: "NVIDIA · GeForce",
    memoryGiB: 12,
    bandwidthGBs: 360,
    tflops: 25,
  },
  "rtx-3060ti-8": {
    label: "GeForce RTX 3060 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 8,
    bandwidthGBs: 448,
    tflops: 16,
  },
  "rtx-3070-8": {
    label: "GeForce RTX 3070",
    category: "NVIDIA · GeForce",
    memoryGiB: 8,
    bandwidthGBs: 448,
    tflops: 20,
  },
  "rtx-3070ti-8": {
    label: "GeForce RTX 3070 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 8,
    bandwidthGBs: 608,
    tflops: 22,
  },
  "rtx-3080-10": {
    label: "GeForce RTX 3080",
    category: "NVIDIA · GeForce",
    memoryGiB: 10,
    bandwidthGBs: 760,
    tflops: 29.8,
  },
  "rtx-3080-12": {
    label: "GeForce RTX 3080 12GB",
    category: "NVIDIA · GeForce",
    memoryGiB: 12,
    bandwidthGBs: 912,
    tflops: 29.8,
  },
  "rtx-3080ti-12": {
    label: "GeForce RTX 3080 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 12,
    bandwidthGBs: 912,
    tflops: 34,
  },
  "rtx-3090-24": {
    label: "GeForce RTX 3090",
    category: "NVIDIA · GeForce",
    memoryGiB: 24,
    bandwidthGBs: 936,
    tflops: 35.6,
  },
  "rtx-3090ti-24": {
    label: "GeForce RTX 3090 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 24,
    bandwidthGBs: 1008,
    tflops: 40,
  },
  "rtx-4060ti-8": {
    label: "GeForce RTX 4060 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 8,
    bandwidthGBs: 288,
    tflops: 35,
  },
  "rtx-4060-8": {
    label: "GeForce RTX 4060",
    category: "NVIDIA · GeForce",
    memoryGiB: 8,
    bandwidthGBs: 272,
    tflops: 15,
  },
  "rtx-4060ti-16": {
    label: "GeForce RTX 4060 Ti 16GB",
    category: "NVIDIA · GeForce",
    memoryGiB: 16,
    bandwidthGBs: 288,
    tflops: 35,
  },
  "rtx-4070-12": {
    label: "GeForce RTX 4070",
    category: "NVIDIA · GeForce",
    memoryGiB: 12,
    bandwidthGBs: 504,
    tflops: 29,
  },
  "rtx-4070ti-12": {
    label: "GeForce RTX 4070 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 12,
    bandwidthGBs: 504,
    tflops: 40,
  },
  "rtx-4070super-12": {
    label: "GeForce RTX 4070 SUPER",
    category: "NVIDIA · GeForce",
    memoryGiB: 12,
    bandwidthGBs: 504,
    tflops: 35,
  },
  "rtx-4070ti-super-16": {
    label: "GeForce RTX 4070 Ti SUPER",
    category: "NVIDIA · GeForce",
    memoryGiB: 16,
    bandwidthGBs: 672,
    tflops: 44,
  },
  "rtx-4080-16": {
    label: "GeForce RTX 4080",
    category: "NVIDIA · GeForce",
    memoryGiB: 16,
    bandwidthGBs: 716,
    tflops: 49,
  },
  "rtx-4080super-16": {
    label: "GeForce RTX 4080 SUPER",
    category: "NVIDIA · GeForce",
    memoryGiB: 16,
    bandwidthGBs: 736,
    tflops: 52,
  },
  "rtx-4090": {
    label: "GeForce RTX 4090",
    category: "NVIDIA · GeForce",
    memoryGiB: 24,
    bandwidthGBs: 1008,
    tflops: 83,
  },
  "rtx-5060-8": {
    label: "GeForce RTX 5060",
    category: "NVIDIA · GeForce",
    memoryGiB: 8,
    bandwidthGBs: 448,
    tflops: 20,
  },
  "rtx-5060ti-8": {
    label: "GeForce RTX 5060 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 8,
    bandwidthGBs: 448,
    tflops: 50,
  },
  "rtx-5060ti-16": {
    label: "GeForce RTX 5060 Ti 16GB",
    category: "NVIDIA · GeForce",
    memoryGiB: 16,
    bandwidthGBs: 448,
    tflops: 50,
  },
  "rtx-5070-12": {
    label: "GeForce RTX 5070",
    category: "NVIDIA · GeForce",
    memoryGiB: 12,
    bandwidthGBs: 672,
    tflops: 62,
  },
  "rtx-5070ti-16": {
    label: "GeForce RTX 5070 Ti",
    category: "NVIDIA · GeForce",
    memoryGiB: 16,
    bandwidthGBs: 896,
    tflops: 88,
  },
  "rtx-5080-16": {
    label: "GeForce RTX 5080",
    category: "NVIDIA · GeForce",
    memoryGiB: 16,
    bandwidthGBs: 960,
    tflops: 112,
  },
  "rtx-5090": {
    label: "GeForce RTX 5090",
    category: "NVIDIA · GeForce",
    memoryGiB: 32,
    bandwidthGBs: 1792,
    tflops: 105,
  },

  "rtx-a2000-12": {
    label: "RTX A2000",
    category: "NVIDIA · 专业卡",
    memoryGiB: 12,
    bandwidthGBs: 288,
    tflops: 8,
  },
  "rtx-a4000-16": {
    label: "RTX A4000",
    category: "NVIDIA · 专业卡",
    memoryGiB: 16,
    bandwidthGBs: 448,
    tflops: 19,
  },
  "rtx-a5000-24": {
    label: "RTX A5000",
    category: "NVIDIA · 专业卡",
    memoryGiB: 24,
    bandwidthGBs: 768,
    tflops: 28,
  },
  "rtx-a6000-48": {
    label: "RTX A6000",
    category: "NVIDIA · 专业卡",
    memoryGiB: 48,
    bandwidthGBs: 768,
    tflops: 39,
  },
  "rtx-6000-ada-48": {
    label: "RTX 6000 Ada",
    category: "NVIDIA · 专业卡",
    memoryGiB: 48,
    bandwidthGBs: 960,
    tflops: 91,
  },
  "rtx-2000-ada-16": {
    label: "RTX 2000 Ada Generation",
    category: "NVIDIA · 专业卡",
    memoryGiB: 16,
    bandwidthGBs: 288,
    tflops: 8,
  },
  "rtx-4000-ada-20": {
    label: "RTX 4000 Ada",
    category: "NVIDIA · 专业卡",
    memoryGiB: 20,
    bandwidthGBs: 360,
    tflops: 26,
  },
  "rtx-4500-ada-24": {
    label: "RTX 4500 Ada",
    category: "NVIDIA · 专业卡",
    memoryGiB: 24,
    bandwidthGBs: 432,
    tflops: 39,
  },
  "rtx-5000-ada-32": {
    label: "RTX 5000 Ada",
    category: "NVIDIA · 专业卡",
    memoryGiB: 32,
    bandwidthGBs: 576,
    tflops: 65,
  },
  "rtx-pro-4000-24": {
    label: "RTX PRO 4000 Blackwell",
    category: "NVIDIA · 专业卡",
    memoryGiB: 24,
    bandwidthGBs: 448,
    tflops: 70,
  },
  "rtx-pro-4500-32": {
    label: "RTX PRO 4500 Blackwell",
    category: "NVIDIA · 专业卡",
    memoryGiB: 32,
    bandwidthGBs: 576,
    tflops: 95,
  },
  "rtx-pro-5000-48": {
    label: "RTX PRO 5000 Blackwell",
    category: "NVIDIA · 专业卡",
    memoryGiB: 48,
    bandwidthGBs: 896,
    tflops: 120,
  },
  "rtx-pro-6000-96": {
    label: "RTX PRO 6000 Blackwell",
    category: "NVIDIA · 专业卡",
    memoryGiB: 96,
    bandwidthGBs: 1792,
    tflops: 125,
  },

  "t4-16": {
    label: "NVIDIA T4",
    category: "NVIDIA · 数据中心",
    memoryGiB: 16,
    bandwidthGBs: 320,
    tflops: 8,
  },
  "a2-16": {
    label: "NVIDIA A2",
    category: "NVIDIA · 数据中心",
    memoryGiB: 16,
    bandwidthGBs: 200,
    tflops: 9,
  },
  "a16-64": {
    label: "NVIDIA A16",
    category: "NVIDIA · 数据中心",
    memoryGiB: 64,
    bandwidthGBs: 512,
    tflops: 18,
  },
  "a30-24": {
    label: "NVIDIA A30",
    category: "NVIDIA · 数据中心",
    memoryGiB: 24,
    bandwidthGBs: 933,
    tflops: 165,
  },
  "a40-48": {
    label: "NVIDIA A40",
    category: "NVIDIA · 数据中心",
    memoryGiB: 48,
    bandwidthGBs: 696,
    tflops: 37,
  },
  "l4-24": {
    label: "NVIDIA L4",
    category: "NVIDIA · 数据中心",
    memoryGiB: 24,
    bandwidthGBs: 300,
    tflops: 30,
  },
  "a10-24": {
    label: "NVIDIA A10G",
    category: "NVIDIA · 数据中心",
    memoryGiB: 24,
    bandwidthGBs: 600,
    tflops: 31,
  },
  "l40s-48": {
    label: "NVIDIA L40S",
    category: "NVIDIA · 数据中心",
    memoryGiB: 48,
    bandwidthGBs: 864,
    tflops: 91,
  },
  "l40-48": {
    label: "NVIDIA L40",
    category: "NVIDIA · 数据中心",
    memoryGiB: 48,
    bandwidthGBs: 864,
    tflops: 91,
  },
  "a100-40": {
    label: "NVIDIA A100 40GB",
    category: "NVIDIA · 数据中心",
    memoryGiB: 40,
    bandwidthGBs: 1555,
    tflops: 312,
  },
  "a800-40": {
    label: "NVIDIA A800 40GB",
    category: "NVIDIA · 数据中心",
    memoryGiB: 40,
    bandwidthGBs: 1555,
    tflops: 312,
  },
  "a100-80": {
    label: "NVIDIA A100 80GB",
    category: "NVIDIA · 数据中心",
    memoryGiB: 80,
    bandwidthGBs: 2039,
    tflops: 312,
  },
  "a800-80": {
    label: "NVIDIA A800 80GB",
    category: "NVIDIA · 数据中心",
    memoryGiB: 80,
    bandwidthGBs: 1935,
    tflops: 312,
  },
  "h100-80": {
    label: "NVIDIA H100 80GB",
    category: "NVIDIA · 数据中心",
    memoryGiB: 80,
    bandwidthGBs: 3350,
    tflops: 989,
  },
  "h100-pcie-80": {
    label: "NVIDIA H100 PCIe",
    category: "NVIDIA · 数据中心",
    memoryGiB: 80,
    bandwidthGBs: 2000,
    tflops: 756,
  },
  "h800-80": {
    label: "NVIDIA H800 80GB",
    category: "NVIDIA · 数据中心",
    memoryGiB: 80,
    bandwidthGBs: 3000,
    tflops: 989,
  },
  "h100-nvl-94": {
    label: "NVIDIA H100 NVL",
    category: "NVIDIA · 数据中心",
    memoryGiB: 94,
    bandwidthGBs: 3900,
    tflops: 835,
  },
  "h200-141": {
    label: "NVIDIA H200 141GB",
    category: "NVIDIA · 数据中心",
    memoryGiB: 141,
    bandwidthGBs: 4800,
    tflops: 989,
  },
  "b100-192": {
    label: "NVIDIA B100",
    category: "NVIDIA · 数据中心",
    memoryGiB: 192,
    bandwidthGBs: 8000,
    tflops: 2000,
  },
  "b200-192": {
    label: "NVIDIA B200",
    category: "NVIDIA · 数据中心",
    memoryGiB: 192,
    bandwidthGBs: 8000,
    tflops: 2250,
  },
  "b300-288": {
    label: "NVIDIA B300",
    category: "NVIDIA · 数据中心",
    memoryGiB: 288,
    bandwidthGBs: 8000,
    tflops: 2500,
  },
  "r100-288": {
    label: "NVIDIA R100",
    category: "NVIDIA · 数据中心",
    memoryGiB: 288,
    bandwidthGBs: 8000,
    tflops: 2500,
  },

  "dgx-spark-128": {
    label: "NVIDIA DGX Spark (GB10)",
    category: "NVIDIA · 本地 AI",
    memoryGiB: 128,
    bandwidthGBs: 273,
    tflops: 1000,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "gh200-96": {
    label: "NVIDIA GH200 Grace Hopper",
    category: "NVIDIA · 本地 AI",
    memoryGiB: 96,
    bandwidthGBs: 3000,
    tflops: 989,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "gb200-192": {
    label: "NVIDIA GB200 Grace Blackwell",
    category: "NVIDIA · 本地 AI",
    memoryGiB: 192,
    bandwidthGBs: 8000,
    tflops: 2500,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },

  "mac-mini-m4-32": {
    label: "Mac mini · M4 Pro",
    category: "Apple Silicon",
    memoryGiB: 32,
    bandwidthGBs: 273,
    tflops: 15,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  // Apple Silicon options mirror the memory configurations exposed by ApXML.
  "apple-m2-pro-16": appleSiliconDevice("Apple M2 Pro", 16, 200, 7),
  "apple-m2-max-32": appleSiliconDevice("Apple M2 Max", 32, 400, 14),
  "apple-m2-max-64": appleSiliconDevice("Apple M2 Max", 64, 400, 14),
  "apple-m2-ultra-64": appleSiliconDevice("Apple M2 Ultra", 64, 800, 27),
  "apple-m2-ultra-128": appleSiliconDevice(
    "Apple M2 Ultra",
    128,
    800,
    27,
  ),
  "apple-m2-ultra-192": appleSiliconDevice(
    "Apple M2 Ultra",
    192,
    800,
    27,
  ),
  "apple-m3-pro-18": appleSiliconDevice("Apple M3 Pro", 18, 150, 7),
  "apple-m3-max-36": appleSiliconDevice("Apple M3 Max", 36, 300, 12),
  "apple-m3-max-48": appleSiliconDevice("Apple M3 Max", 48, 400, 16),
  "apple-m3-max-64": appleSiliconDevice("Apple M3 Max", 64, 400, 16),
  "apple-m3-max-96": appleSiliconDevice("Apple M3 Max", 96, 400, 16),
  "apple-m3-max-128": appleSiliconDevice("Apple M3 Max", 128, 400, 16),
  "apple-m3-ultra-256": appleSiliconDevice(
    "Apple M3 Ultra",
    256,
    819,
    55,
  ),
  "apple-m3-ultra-512": appleSiliconDevice(
    "Apple M3 Ultra",
    512,
    819,
    55,
  ),
  "apple-m4-16": appleSiliconDevice("Apple M4", 16, 120, 4),
  "apple-m4-24": appleSiliconDevice("Apple M4", 24, 120, 4),
  "apple-m4-32": appleSiliconDevice("Apple M4", 32, 120, 4),
  "apple-m4-pro-32": appleSiliconDevice("Apple M4 Pro", 32, 273, 15),
  "apple-m4-pro-48": appleSiliconDevice("Apple M4 Pro", 48, 273, 15),
  "apple-m4-pro-64": appleSiliconDevice("Apple M4 Pro", 64, 273, 15),
  "apple-m4-max-64": appleSiliconDevice("Apple M4 Max", 64, 546, 20),
  "apple-m4-max-96": appleSiliconDevice("Apple M4 Max", 96, 546, 20),
  "apple-m4-max-128": appleSiliconDevice("Apple M4 Max", 128, 546, 20),
  "apple-m5-16": appleSiliconDevice("Apple M5", 16, 153, 5),
  "apple-m5-24": appleSiliconDevice("Apple M5", 24, 153, 5),
  "apple-m5-32": appleSiliconDevice("Apple M5", 32, 153, 5),
  "apple-m5-pro-24": appleSiliconDevice("Apple M5 Pro", 24, 307, 18),
  "apple-m5-pro-48": appleSiliconDevice("Apple M5 Pro", 48, 307, 18),
  "apple-m5-pro-64": appleSiliconDevice("Apple M5 Pro", 64, 307, 18),
  "apple-m5-max-48": appleSiliconDevice("Apple M5 Max", 48, 614, 27),
  "apple-m5-max-64": appleSiliconDevice("Apple M5 Max", 64, 614, 27),
  "apple-m5-max-96": appleSiliconDevice("Apple M5 Max", 96, 614, 27),
  "apple-m5-max-128": appleSiliconDevice("Apple M5 Max", 128, 614, 27),
  "apple-m1-16": {
    label: "Apple M1",
    category: "Apple Silicon",
    memoryGiB: 16,
    bandwidthGBs: 68,
    tflops: 3,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "apple-m1-pro-32": {
    label: "Apple M1 Pro",
    category: "Apple Silicon",
    memoryGiB: 32,
    bandwidthGBs: 200,
    tflops: 5,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "apple-m1-max-64": {
    label: "Apple M1 Max",
    category: "Apple Silicon",
    memoryGiB: 64,
    bandwidthGBs: 400,
    tflops: 10,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "apple-m2-24": {
    label: "Apple M2",
    category: "Apple Silicon",
    memoryGiB: 24,
    bandwidthGBs: 100,
    tflops: 4,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "apple-m2-pro-32": {
    label: "Apple M2 Pro",
    category: "Apple Silicon",
    memoryGiB: 32,
    bandwidthGBs: 200,
    tflops: 7,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "apple-m2-max-96": {
    label: "Apple M2 Max",
    category: "Apple Silicon",
    memoryGiB: 96,
    bandwidthGBs: 400,
    tflops: 14,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "apple-m3-24": {
    label: "Apple M3",
    category: "Apple Silicon",
    memoryGiB: 24,
    bandwidthGBs: 100,
    tflops: 4,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "apple-m3-pro-36": {
    label: "Apple M3 Pro",
    category: "Apple Silicon",
    memoryGiB: 36,
    bandwidthGBs: 150,
    tflops: 7,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "macbook-pro-m3-max-128": {
    label: "MacBook Pro · M3 Max",
    category: "Apple Silicon",
    memoryGiB: 128,
    bandwidthGBs: 400,
    tflops: 16,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "macbook-pro-m4-max-128": {
    label: "MacBook Pro · M4 Max",
    category: "Apple Silicon",
    memoryGiB: 128,
    bandwidthGBs: 546,
    tflops: 20,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m1-ultra-64": {
    label: "Mac Studio · M1 Ultra",
    category: "Apple Silicon",
    memoryGiB: 64,
    bandwidthGBs: 800,
    tflops: 22,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m1-ultra-128": {
    label: "Mac Studio · M1 Ultra",
    category: "Apple Silicon",
    memoryGiB: 128,
    bandwidthGBs: 800,
    tflops: 22,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m2-max-64": {
    label: "Mac Studio · M2 Max",
    category: "Apple Silicon",
    memoryGiB: 64,
    bandwidthGBs: 400,
    tflops: 14,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m2-max-96": {
    label: "Mac Studio · M2 Max",
    category: "Apple Silicon",
    memoryGiB: 96,
    bandwidthGBs: 400,
    tflops: 14,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m2-ultra-128": {
    label: "Mac Studio · M2 Ultra",
    category: "Apple Silicon",
    memoryGiB: 128,
    bandwidthGBs: 800,
    tflops: 27,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m2-ultra-192": {
    label: "Mac Studio · M2 Ultra",
    category: "Apple Silicon",
    memoryGiB: 192,
    bandwidthGBs: 800,
    tflops: 27,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m3-ultra-96": {
    label: "Mac Studio · M3 Ultra",
    category: "Apple Silicon",
    memoryGiB: 96,
    bandwidthGBs: 819,
    tflops: 55,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m3-ultra-256": {
    label: "Mac Studio · M3 Ultra",
    category: "Apple Silicon",
    memoryGiB: 256,
    bandwidthGBs: 819,
    tflops: 55,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m3-ultra-512": {
    label: "Mac Studio · M3 Ultra",
    category: "Apple Silicon",
    memoryGiB: 512,
    bandwidthGBs: 819,
    tflops: 55,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m4-max-64": {
    label: "Mac Studio · M4 Max",
    category: "Apple Silicon",
    memoryGiB: 64,
    bandwidthGBs: 546,
    tflops: 20,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mac-studio-m4-max-128": {
    label: "Mac Studio · M4 Max",
    category: "Apple Silicon",
    memoryGiB: 128,
    bandwidthGBs: 546,
    tflops: 20,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },

  "rx-6600-8": {
    label: "Radeon RX 6600",
    category: "AMD",
    memoryGiB: 8,
    bandwidthGBs: 224,
    tflops: 9,
  },
  "rx-6600xt-8": {
    label: "Radeon RX 6600 XT",
    category: "AMD",
    memoryGiB: 8,
    bandwidthGBs: 256,
    tflops: 10,
  },
  "rx-6650xt-8": {
    label: "Radeon RX 6650 XT",
    category: "AMD",
    memoryGiB: 8,
    bandwidthGBs: 280,
    tflops: 11,
  },
  "rx-6700-10": {
    label: "Radeon RX 6700",
    category: "AMD",
    memoryGiB: 10,
    bandwidthGBs: 320,
    tflops: 11,
  },
  "rx-6700xt-12": {
    label: "Radeon RX 6700 XT",
    category: "AMD",
    memoryGiB: 12,
    bandwidthGBs: 384,
    tflops: 13,
  },
  "rx-6750xt-12": {
    label: "Radeon RX 6750 XT",
    category: "AMD",
    memoryGiB: 12,
    bandwidthGBs: 432,
    tflops: 13.7,
  },
  "rx-6800-16": {
    label: "Radeon RX 6800",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 512,
    tflops: 16,
  },
  "rx-6800xt-16": {
    label: "Radeon RX 6800 XT",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 512,
    tflops: 21,
  },
  "rx-6900xt-16": {
    label: "Radeon RX 6900 XT",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 512,
    tflops: 23,
  },
  "rx-6950xt-16": {
    label: "Radeon RX 6950 XT",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 576,
    tflops: 23,
  },
  "rx-7600xt-16": {
    label: "Radeon RX 7600 XT",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 288,
    tflops: 22,
  },
  "rx-7600-8": {
    label: "Radeon RX 7600",
    category: "AMD",
    memoryGiB: 8,
    bandwidthGBs: 288,
    tflops: 22,
  },
  "rx-7700xt-12": {
    label: "Radeon RX 7700 XT",
    category: "AMD",
    memoryGiB: 12,
    bandwidthGBs: 432,
    tflops: 35,
  },
  "rx-7900xtx-24": {
    label: "Radeon RX 7900 XTX",
    category: "AMD",
    memoryGiB: 24,
    bandwidthGBs: 960,
    tflops: 61,
  },
  "rx-7900xt-20": {
    label: "Radeon RX 7900 XT",
    category: "AMD",
    memoryGiB: 20,
    bandwidthGBs: 800,
    tflops: 52,
  },
  "rx-7800xt-16": {
    label: "Radeon RX 7800 XT",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 624,
    tflops: 38,
  },
  "rx-7900gre-16": {
    label: "Radeon RX 7900 GRE",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 576,
    tflops: 46,
  },
  "rx-9070xt-16": {
    label: "Radeon RX 9070 XT",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 640,
    tflops: 60,
  },
  "rx-9070-16": {
    label: "Radeon RX 9070",
    category: "AMD",
    memoryGiB: 16,
    bandwidthGBs: 640,
    tflops: 37,
  },
  "radeon-pro-w6600-8": {
    label: "Radeon PRO W6600",
    category: "AMD",
    memoryGiB: 8,
    bandwidthGBs: 256,
    tflops: 10,
  },
  "radeon-pro-w6800-32": {
    label: "Radeon PRO W6800",
    category: "AMD",
    memoryGiB: 32,
    bandwidthGBs: 512,
    tflops: 17,
  },
  "radeon-pro-w7900-48": {
    label: "Radeon PRO W7900",
    category: "AMD",
    memoryGiB: 48,
    bandwidthGBs: 864,
    tflops: 62,
  },
  "radeon-pro-w7800-32": {
    label: "Radeon PRO W7800",
    category: "AMD",
    memoryGiB: 32,
    bandwidthGBs: 576,
    tflops: 45,
  },
  "mi210-64": {
    label: "AMD Instinct MI210",
    category: "AMD",
    memoryGiB: 64,
    bandwidthGBs: 1638,
    tflops: 181,
  },
  "mi250x-128": {
    label: "AMD Instinct MI250X",
    category: "AMD",
    memoryGiB: 128,
    bandwidthGBs: 3276,
    tflops: 383,
  },
  "mi250-128": {
    label: "AMD Instinct MI250",
    category: "AMD",
    memoryGiB: 128,
    bandwidthGBs: 3200,
    tflops: 383,
  },
  "mi300a-128": {
    label: "AMD Instinct MI300A",
    category: "AMD",
    memoryGiB: 128,
    bandwidthGBs: 5300,
    tflops: 1307,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "mi300x-192": {
    label: "AMD Instinct MI300X",
    category: "AMD",
    memoryGiB: 192,
    bandwidthGBs: 5300,
    tflops: 1307,
  },
  "mi325x-256": {
    label: "AMD Instinct MI325X",
    category: "AMD",
    memoryGiB: 256,
    bandwidthGBs: 6000,
    tflops: 1307,
  },
  "ryzen-ai-max-395-64": {
    label: "Ryzen AI Max+ 395",
    category: "AMD · APU",
    memoryGiB: 64,
    bandwidthGBs: 256,
    tflops: 30,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },
  "ryzen-ai-hx370-32": {
    ...amdApuDevice(
      "Ryzen AI 9 HX 370 (32GB system, 24GB GPU-accessible)",
      24,
      90,
      10,
    ),
  },
  "ryzen-ai-hx370-64": {
    ...amdApuDevice(
      "Ryzen AI 9 HX 370 (64GB system, 48GB GPU-accessible)",
      48,
      102,
      12,
    ),
  },
  "ryzen-ai-hx370-96": {
    ...amdApuDevice(
      "Ryzen AI 9 HX 370 (96GB system, 72GB GPU-accessible)",
      72,
      128,
      14,
    ),
  },
  "ryzen-ai-max-395-128": {
    label: "Ryzen AI Max+ 395 (96GB 可用)",
    category: "AMD · APU",
    memoryGiB: 96,
    bandwidthGBs: 256,
    tflops: 30,
    memoryType: "统一内存",
    supportsMultiGpu: false,
  },

  "arc-a770-16": {
    label: "Intel Arc A770",
    category: "Intel / Habana",
    memoryGiB: 16,
    bandwidthGBs: 560,
    tflops: 17,
  },
  "arc-b580-12": {
    label: "Intel Arc B580",
    category: "Intel / Habana",
    memoryGiB: 12,
    bandwidthGBs: 456,
    tflops: 20,
  },
  "gaudi2-96": {
    label: "Intel Gaudi 2",
    category: "Intel / Habana",
    memoryGiB: 96,
    bandwidthGBs: 2450,
    tflops: 432,
  },
  "gaudi3-128": {
    label: "Intel Gaudi 3",
    category: "Intel / Habana",
    memoryGiB: 128,
    bandwidthGBs: 3700,
    tflops: 1835,
  },

  custom: {
    label: "自定义设备",
    category: "自定义",
    memoryGiB: 24,
    bandwidthGBs: 1000,
    tflops: 80,
  },
} as const satisfies Record<string, GpuDefinition>;

export type GpuId = keyof typeof GPUS;

export const MODEL_CATEGORIES = [
  "Qwen",
  "Llama",
  "DeepSeek",
  "Mistral",
  "Gemma",
  "GLM / 智谱",
  "Hunyuan / ERNIE / MiniMax",
  "Kimi / OpenAI / Phi",
  "自定义",
] as const;

export type ModelCategory = (typeof MODEL_CATEGORIES)[number];

export const MODELS = {
  "qwen3-0-6b": {
    label: "Qwen3 0.6B",
    category: "Qwen",
    totalParametersB: 0.6,
    activeParametersB: 0.6,
    layers: 28,
    hiddenSize: 1024,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 40_960,
  },
  "qwen3-1-7b": {
    label: "Qwen3 1.7B",
    category: "Qwen",
    totalParametersB: 1.7,
    activeParametersB: 1.7,
    layers: 28,
    hiddenSize: 2048,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 40_960,
  },
  "qwen3-4b": {
    label: "Qwen3 4B",
    category: "Qwen",
    totalParametersB: 4,
    activeParametersB: 4,
    layers: 36,
    hiddenSize: 2560,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 40_960,
  },
  "qwen3-8b": {
    label: "Qwen3 8B",
    category: "Qwen",
    totalParametersB: 8.2,
    activeParametersB: 8.2,
    layers: 36,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 40_960,
  },
  "qwen3-14b": {
    label: "Qwen3 14B",
    category: "Qwen",
    totalParametersB: 14.8,
    activeParametersB: 14.8,
    layers: 40,
    hiddenSize: 5120,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 40_960,
  },
  "qwen3-6-27b": {
    label: "Qwen3.6 27B",
    category: "Qwen",
    totalParametersB: 27,
    activeParametersB: 27,
    layers: 64,
    hiddenSize: 5120,
    kvHeads: 4,
    headDim: 256,
    // Every fourth layer has full attention; the other layers use a
    // recurrent DeltaNet state rather than a token-growing KV cache.
    kvElementsPerToken: 32_768,
    attention: "Hybrid · Gated DeltaNet + Gated Attention",
    contextWindow: 262_144,
  },
  "qwen3-6-35b-a3b": {
    label: "Qwen3.6 35B-A3B",
    category: "Qwen",
    totalParametersB: 35,
    activeParametersB: 3,
    layers: 40,
    hiddenSize: 2048,
    kvHeads: 2,
    headDim: 256,
    // Ten full-attention layers; the remaining DeltaNet layers have a
    // constant recurrent state and are not counted in token-growing KV.
    kvElementsPerToken: 10_240,
    attention: "Hybrid · Gated DeltaNet + Gated Attention · MoE (256/8)",
    contextWindow: 262_144,
  },
  "llama-3-8b": {
    label: "Llama 3.1 8B",
    category: "Llama",
    totalParametersB: 8.03,
    activeParametersB: 8.03,
    layers: 32,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "qwen3-32b": {
    label: "Qwen3 32B",
    category: "Qwen",
    totalParametersB: 32.8,
    activeParametersB: 32.8,
    layers: 64,
    hiddenSize: 5120,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 40_960,
  },
  "qwen2-5-72b": {
    label: "Qwen2.5 72B",
    category: "Qwen",
    totalParametersB: 72.706,
    activeParametersB: 72.706,
    layers: 80,
    hiddenSize: 8192,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA · 128K RoPE 扩展",
    contextWindow: 131_072,
  },
  "qwen3-235b-a22b": {
    label: "Qwen3 235B-A22B",
    category: "Qwen",
    totalParametersB: 235,
    activeParametersB: 22,
    layers: 94,
    hiddenSize: 4096,
    kvHeads: 4,
    headDim: 128,
    attention: "GQA · MoE (128/8)",
    contextWindow: 40_960,
  },
  "qwen3-coder-480b-a35b": {
    label: "Qwen3-Coder 480B-A35B",
    category: "Qwen",
    totalParametersB: 480,
    activeParametersB: 35,
    layers: 62,
    hiddenSize: 6144,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA · MoE (160/8)",
    contextWindow: 262_144,
  },
  "llama-3-2-1b": {
    label: "Llama 3.2 1B",
    category: "Llama",
    totalParametersB: 1.23,
    activeParametersB: 1.23,
    layers: 16,
    hiddenSize: 2048,
    kvHeads: 8,
    headDim: 64,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "llama-3-2-3b": {
    label: "Llama 3.2 3B",
    category: "Llama",
    totalParametersB: 3.21,
    activeParametersB: 3.21,
    layers: 28,
    hiddenSize: 3072,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "llama-3-70b": {
    label: "Llama 3.3 70B",
    category: "Llama",
    totalParametersB: 70.6,
    activeParametersB: 70.6,
    layers: 80,
    hiddenSize: 8192,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "llama-3-1-405b": {
    label: "Llama 3.1 405B",
    category: "Llama",
    totalParametersB: 405.853,
    activeParametersB: 405.853,
    layers: 126,
    hiddenSize: 16384,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "deepseek-r1-distill-qwen-7b": {
    label: "DeepSeek-R1-Distill-Qwen-7B",
    category: "DeepSeek",
    totalParametersB: 7,
    activeParametersB: 7,
    layers: 28,
    hiddenSize: 3584,
    kvHeads: 4,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "deepseek-r1-32b": {
    label: "DeepSeek-R1-Distill-Qwen-32B",
    category: "DeepSeek",
    totalParametersB: 32.764,
    activeParametersB: 32.764,
    layers: 64,
    hiddenSize: 5120,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "deepseek-v4-flash": {
    label: "DeepSeek-V4-Flash 284B-A13B",
    category: "DeepSeek",
    totalParametersB: 284,
    activeParametersB: 13,
    layers: 43,
    hiddenSize: 4096,
    kvHeads: 1,
    headDim: 512,
    // CSA/HCA cache compression is derived from the public reference config.
    kvElementsPerToken: 3_440,
    attention: "CSA / HCA · MoE (256/6 + shared) · 压缩缓存估算",
    contextWindow: 1_048_576,
  },
  "deepseek-v4-pro": {
    label: "DeepSeek-V4-Pro 1.6T-A49B",
    category: "DeepSeek",
    totalParametersB: 1_600,
    activeParametersB: 49,
    layers: 61,
    hiddenSize: 7168,
    kvHeads: 1,
    headDim: 512,
    // CSA/HCA cache compression is derived from the public reference config.
    kvElementsPerToken: 4_924,
    attention: "CSA / HCA · MoE (384/6 + shared) · 压缩缓存估算",
    contextWindow: 1_048_576,
  },
  "mistral-7b-v0-3": {
    label: "Mistral 7B Instruct v0.3",
    category: "Mistral",
    totalParametersB: 7.3,
    activeParametersB: 7.3,
    layers: 32,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 32_768,
  },
  "mistral-small-3-1-24b": {
    label: "Mistral Small 3.1 24B",
    category: "Mistral",
    totalParametersB: 24,
    activeParametersB: 24,
    layers: 40,
    hiddenSize: 5120,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "mixtral-8x7b": {
    label: "Mixtral 8×7B",
    category: "Mistral",
    totalParametersB: 46.7,
    activeParametersB: 12.9,
    layers: 32,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA · MoE (8/2)",
    contextWindow: 32_768,
  },
  "mixtral-8x22b": {
    label: "Mixtral 8×22B",
    category: "Mistral",
    totalParametersB: 140.621,
    activeParametersB: 39,
    layers: 56,
    hiddenSize: 6144,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA · MoE (8/2)",
    contextWindow: 65_536,
  },
  "gemma-3-4b": {
    label: "Gemma 3 4B",
    category: "Gemma",
    totalParametersB: 4,
    activeParametersB: 4,
    layers: 34,
    hiddenSize: 2560,
    kvHeads: 4,
    headDim: 256,
    attention: "GQA · SWA（保守 KV）",
    contextWindow: 131_072,
  },
  "gemma-3-12b": {
    label: "Gemma 3 12B",
    category: "Gemma",
    totalParametersB: 12,
    activeParametersB: 12,
    layers: 48,
    hiddenSize: 3840,
    kvHeads: 8,
    headDim: 256,
    attention: "GQA · SWA（保守 KV）",
    contextWindow: 131_072,
  },
  "gemma-3-27b": {
    label: "Gemma 3 27B",
    category: "Gemma",
    totalParametersB: 27,
    activeParametersB: 27,
    layers: 62,
    hiddenSize: 5376,
    kvHeads: 16,
    headDim: 128,
    attention: "GQA · SWA（保守 KV）",
    contextWindow: 131_072,
  },
  "glm-4-9b": {
    label: "GLM-4-9B-Chat",
    category: "GLM / 智谱",
    totalParametersB: 9,
    activeParametersB: 9,
    layers: 40,
    hiddenSize: 4096,
    kvHeads: 2,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "glm-5-2": {
    label: "GLM-5.2 744B-A40B",
    category: "GLM / 智谱",
    totalParametersB: 744,
    activeParametersB: 40,
    layers: 78,
    hiddenSize: 6144,
    kvHeads: 64,
    headDim: 192,
    // MLA/DSA cache estimate: 78 compact latent layers plus 21 full indexers.
    kvElementsPerToken: 47_616,
    attention: "MLA + DSA / IndexShare · MoE (256/8 + shared) · 优化 KV 估算",
    contextWindow: 1_048_576,
  },
  "hunyuan-a13b": {
    label: "Hunyuan-A13B（32K 原生 / 256K 扩展）",
    category: "Hunyuan / ERNIE / MiniMax",
    totalParametersB: 80.405,
    activeParametersB: 13,
    layers: 32,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA · MoE",
    contextWindow: 32_768,
  },
  "ernie-4-5-21b-a3b": {
    label: "ERNIE-4.5 21B-A3B",
    category: "Hunyuan / ERNIE / MiniMax",
    totalParametersB: 21.953,
    activeParametersB: 3,
    layers: 28,
    hiddenSize: 2560,
    kvHeads: 4,
    headDim: 128,
    attention: "GQA · MoE (64/6 + shared) · MTP",
    contextWindow: 131_072,
  },
  "ernie-4-5-300b-a47b": {
    label: "ERNIE-4.5 300B-A47B",
    category: "Hunyuan / ERNIE / MiniMax",
    totalParametersB: 300.501,
    activeParametersB: 47,
    layers: 54,
    hiddenSize: 8192,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA · MoE (64/8) · MTP",
    contextWindow: 131_072,
  },
  "minimax-m2": {
    label: "MiniMax M2 230B-A10B",
    category: "Hunyuan / ERNIE / MiniMax",
    totalParametersB: 240.418,
    activeParametersB: 10,
    layers: 62,
    hiddenSize: 3072,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA · MoE · MTP（KV 估算）",
    contextWindow: 196_608,
  },
  "kimi-k2-instruct": {
    label: "Kimi K2 1T-A32B",
    category: "Kimi / OpenAI / Phi",
    totalParametersB: 1000,
    activeParametersB: 32,
    layers: 61,
    hiddenSize: 7168,
    kvHeads: 1,
    headDim: 1,
    kvElementsPerToken: 61 * 576,
    attention: "MLA · MoE (384/8 + shared)",
    contextWindow: 131_072,
  },
  "gpt-oss-20b": {
    label: "GPT-OSS 20B-A3.6B",
    category: "Kimi / OpenAI / Phi",
    totalParametersB: 21,
    activeParametersB: 3.6,
    layers: 24,
    hiddenSize: 2880,
    kvHeads: 8,
    headDim: 64,
    kvElementsPerToken: 2 * 12 * 8 * 64,
    attention: "GQA · MoE (32/4) · SWA",
    contextWindow: 131_072,
  },
  "gpt-oss-120b": {
    label: "GPT-OSS 120B-A5.1B",
    category: "Kimi / OpenAI / Phi",
    totalParametersB: 117,
    activeParametersB: 5.1,
    layers: 36,
    hiddenSize: 2880,
    kvHeads: 8,
    headDim: 64,
    kvElementsPerToken: 2 * 18 * 8 * 64,
    attention: "GQA · MoE (128/4) · SWA",
    contextWindow: 131_072,
  },
  "phi-4": {
    label: "Phi-4 14B",
    category: "Kimi / OpenAI / Phi",
    totalParametersB: 14,
    activeParametersB: 14,
    layers: 40,
    hiddenSize: 5120,
    kvHeads: 10,
    headDim: 128,
    attention: "GQA",
    contextWindow: 16_384,
  },
  "phi-4-mini": {
    label: "Phi-4 Mini 3.8B",
    category: "Kimi / OpenAI / Phi",
    totalParametersB: 3.8,
    activeParametersB: 3.8,
    layers: 32,
    hiddenSize: 3072,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  custom: {
    label: "自定义模型",
    category: "自定义",
    totalParametersB: 8,
    activeParametersB: 8,
    layers: 32,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "自定义",
    contextWindow: 32_768,
  },
} as const satisfies Record<string, ModelDefinition>;

export type ModelId = keyof typeof MODELS;

// Keep existing shared URLs usable after compacting the visible catalogue.
// The target is the closest retained profile, not an exact compatibility claim.
const LEGACY_MODEL_ALIASES: Record<string, ModelId> = {
  "qwen2-5-0-5b": "qwen3-0-6b",
  "qwen2-5-1-5b": "qwen3-1-7b",
  "qwen2-5-3b": "qwen3-4b",
  "qwen2-5-7b": "qwen3-8b",
  "qwen2-5-14b": "qwen3-14b",
  "qwen2-5-32b": "qwen3-32b",
  "qwen3-30b-a3b": "qwen3-6-35b-a3b",
  "deepseek-r1-distill-qwen-1-5b": "deepseek-r1-distill-qwen-7b",
  "deepseek-r1-distill-qwen-14b": "deepseek-r1-32b",
  "deepseek-r1-distill-llama-8b": "deepseek-r1-distill-qwen-7b",
  "deepseek-r1-distill-llama-70b": "deepseek-r1-32b",
  "deepseek-v3": "deepseek-v4-flash",
  "glm-4-5-air": "glm-5-2",
  "glm-4-5": "glm-5-2",
};

export const RESERVES = {
  tight: { label: "紧凑", fragmentationRate: 0.1, fixedSafetyGiB: 0.25 },
  balanced: { label: "均衡", fragmentationRate: 0.15, fixedSafetyGiB: 0.5 },
  conservative: { label: "保守", fragmentationRate: 0.2, fixedSafetyGiB: 0.75 },
} as const;

export type ReserveLevel = keyof typeof RESERVES;
export type SafetyLevel = "comfortable" | "caution" | "tight" | "oom";

export type CalculatorInput = {
  modelId: ModelId;
  weightPrecision: PrecisionId;
  kvPrecision: PrecisionId;
  gpuId: GpuId;
  gpuCount: number;
  contextTokens: number;
  outputTokens: number;
  batchSize: number;
  concurrency: number;
  cpuOffload: boolean;
  offloadPercent: number;
  reserve: ReserveLevel;
  customParametersB: number;
  customLayers: number;
  customKvHeads: number;
  customHeadDim: number;
  customGpuMemoryGiB: number;
  customGpuBandwidthGBs: number;
  customGpuTflops: number;
};

export const DEFAULT_CALCULATOR_INPUT: CalculatorInput = {
  modelId: "qwen3-8b",
  weightPrecision: "fp16",
  kvPrecision: "fp16",
  gpuId: "rtx-4090",
  gpuCount: 1,
  contextTokens: 4096,
  outputTokens: 1024,
  batchSize: 1,
  concurrency: 1,
  cpuOffload: false,
  offloadPercent: 45,
  reserve: "balanced",
  customParametersB: 8,
  customLayers: 32,
  customKvHeads: 8,
  customHeadDim: 128,
  customGpuMemoryGiB: 24,
  customGpuBandwidthGBs: 1000,
  customGpuTflops: 80,
};

export type ModelDefinition = {
  label: string;
  category: ModelCategory;
  totalParametersB: number;
  activeParametersB: number;
  layers: number;
  hiddenSize: number;
  kvHeads: number;
  headDim: number;
  attention: string;
  contextWindow: number;
  kvElementsPerToken?: number;
};

export type GpuDefinition = {
  label: string;
  category: DeviceCategory;
  memoryGiB: number;
  bandwidthGBs: number;
  tflops: number;
  memoryType?: "统一内存";
  supportsMultiGpu?: boolean;
};

function inRange(value: unknown, fallback: number, min: number, max: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? Math.min(Math.max(numeric, min), max)
    : fallback;
}

function idFrom<T extends Record<string, unknown>>(
  collection: T,
  value: unknown,
  fallback: keyof T,
) {
  return typeof value === "string" && value in collection
    ? (value as keyof T)
    : fallback;
}

export function normaliseInput(
  input: Partial<CalculatorInput> = {},
): CalculatorInput {
  const merged = { ...DEFAULT_CALCULATOR_INPUT, ...input };
  const gpuId = idFrom(GPUS, merged.gpuId, DEFAULT_CALCULATOR_INPUT.gpuId);
  const modelId =
    typeof merged.modelId === "string"
      ? (LEGACY_MODEL_ALIASES[merged.modelId] ?? merged.modelId)
      : merged.modelId;
  const requestedGpuCount = Math.round(inRange(merged.gpuCount, 1, 1, 32));
  const selectedGpu = GPUS[gpuId];
  const gpuCount =
    "supportsMultiGpu" in selectedGpu && selectedGpu.supportsMultiGpu === false
      ? 1
      : requestedGpuCount;

  return {
    ...merged,
    modelId: idFrom(MODELS, modelId, DEFAULT_CALCULATOR_INPUT.modelId),
    gpuId,
    weightPrecision: idFrom(
      PRECISIONS,
      merged.weightPrecision,
      DEFAULT_CALCULATOR_INPUT.weightPrecision,
    ),
    kvPrecision: idFrom(
      PRECISIONS,
      merged.kvPrecision,
      DEFAULT_CALCULATOR_INPUT.kvPrecision,
    ),
    reserve: idFrom(RESERVES, merged.reserve, DEFAULT_CALCULATOR_INPUT.reserve),
    gpuCount,
    contextTokens: Math.round(
      inRange(merged.contextTokens, 4096, 64, 1_000_000),
    ),
    outputTokens: Math.round(inRange(merged.outputTokens, 1024, 1, 131_072)),
    batchSize: Math.round(inRange(merged.batchSize, 1, 1, 128)),
    concurrency: Math.round(inRange(merged.concurrency, 1, 1, 128)),
    offloadPercent: inRange(merged.offloadPercent, 45, 5, 95),
    customParametersB: inRange(merged.customParametersB, 8, 0.1, 2_000),
    customLayers: Math.round(inRange(merged.customLayers, 32, 1, 512)),
    customKvHeads: Math.round(inRange(merged.customKvHeads, 8, 1, 256)),
    customHeadDim: Math.round(inRange(merged.customHeadDim, 128, 8, 1_024)),
    customGpuMemoryGiB: inRange(merged.customGpuMemoryGiB, 24, 1, 2_048),
    customGpuBandwidthGBs: inRange(
      merged.customGpuBandwidthGBs,
      1000,
      10,
      10_000,
    ),
    customGpuTflops: inRange(merged.customGpuTflops, 80, 1, 10_000),
    cpuOffload: Boolean(merged.cpuOffload),
  };
}

export function getModel(
  modelId: ModelId,
  input: Partial<CalculatorInput> = {},
): ModelDefinition {
  const config = normaliseInput({ ...input, modelId });
  const model = MODELS[config.modelId];
  if (config.modelId !== "custom") return model;
  return {
    ...model,
    totalParametersB: config.customParametersB,
    activeParametersB: config.customParametersB,
    layers: config.customLayers,
    kvHeads: config.customKvHeads,
    headDim: config.customHeadDim,
  };
}

export function getGpu(
  gpuId: GpuId,
  input: Partial<CalculatorInput> = {},
): GpuDefinition {
  const config = normaliseInput({ ...input, gpuId });
  const gpu = GPUS[config.gpuId];
  if (config.gpuId !== "custom") return gpu;
  return {
    ...gpu,
    memoryGiB: config.customGpuMemoryGiB,
    bandwidthGBs: config.customGpuBandwidthGBs,
    tflops: config.customGpuTflops,
  };
}

export function exceedsContextWindow(input: Partial<CalculatorInput> = {}) {
  const config = normaliseInput(input);
  const model = getModel(config.modelId, config);
  return config.contextTokens + config.outputTokens > model.contextWindow;
}

function kvElementsPerToken(model: ModelDefinition) {
  return (
    model.kvElementsPerToken ?? 2 * model.layers * model.kvHeads * model.headDim
  );
}

function perGpuLayout({
  gpuWeightsGiB,
  kvCacheGiB,
  workspaceGiB,
  gpuCount,
  runtimePerGpuGiB,
  reserve,
}: {
  gpuWeightsGiB: number;
  kvCacheGiB: number;
  workspaceGiB: number;
  gpuCount: number;
  runtimePerGpuGiB: number;
  reserve: (typeof RESERVES)[ReserveLevel];
}) {
  const rawModelMemory = gpuWeightsGiB + kvCacheGiB + workspaceGiB;
  const fragmentationGiB = rawModelMemory * reserve.fragmentationRate;
  // TP has a small communication/allocator tax. This is explicitly an estimate.
  const parallelTax =
    gpuCount > 1 ? 1 + Math.min(0.12, 0.025 * (gpuCount - 1)) : 1;
  const distributableGiB = (rawModelMemory + fragmentationGiB) * parallelTax;
  const perGpu =
    distributableGiB / gpuCount + runtimePerGpuGiB + reserve.fixedSafetyGiB;
  return {
    fragmentationGiB,
    totalPerGpuGiB: perGpu,
    clusterGiB:
      distributableGiB + (runtimePerGpuGiB + reserve.fixedSafetyGiB) * gpuCount,
  };
}

function performanceEstimate({
  config,
  gpu,
  model,
  weightsGiB,
  totalPerGpuGiB,
}: {
  config: CalculatorInput;
  gpu: GpuDefinition;
  model: ModelDefinition;
  weightsGiB: number;
  totalPerGpuGiB: number;
}) {
  const precisionGain: Record<PrecisionId, number> = {
    fp32: 0.5,
    fp16: 1,
    fp8: 1.3,
    int8: 1.45,
    int4: 1.82,
  };
  const memoryBound =
    (gpu.bandwidthGBs *
      config.gpuCount *
      0.68 *
      precisionGain[config.weightPrecision]) /
    Math.max(weightsGiB, 0.1);
  const computeBound =
    (gpu.tflops * config.gpuCount * 500) /
    Math.max(model.activeParametersB, 0.1);
  const batchingGain =
    1 +
    Math.min(0.32, Math.log2(config.batchSize * config.concurrency) * 0.075);
  const contextPenalty =
    1 / (1 + Math.max(0, config.contextTokens - 4096) / 180_000);
  const offloadPenalty = config.cpuOffload
    ? 1 + (config.offloadPercent / 100) * 1.75
    : 1;
  const totalTokensPerSecond = Math.max(
    0.1,
    (Math.min(memoryBound, computeBound) * batchingGain * contextPenalty) /
      offloadPenalty,
  );
  const perUserTokensPerSecond = totalTokensPerSecond / config.concurrency;
  const timeToFirstTokenMs =
    Math.max(
      70,
      (config.contextTokens * model.activeParametersB * 0.95) /
        Math.max(gpu.tflops * config.gpuCount, 1) +
        (totalPerGpuGiB / gpu.memoryGiB) * 48,
    ) * offloadPenalty;

  return {
    totalTokensPerSecond,
    perUserTokensPerSecond,
    timeToFirstTokenMs,
  };
}

export function estimateVram(input: Partial<CalculatorInput> = {}) {
  const config = normaliseInput(input);
  const model = getModel(config.modelId, config);
  const gpu = getGpu(config.gpuId, config);
  const weightPrecision = PRECISIONS[config.weightPrecision];
  const kvPrecision = PRECISIONS[config.kvPrecision];
  const reserve = RESERVES[config.reserve];
  const effectiveSequences = config.batchSize * config.concurrency;
  const rawTokensPerSequence = config.contextTokens + config.outputTokens;
  const cachedTokensPerSequence =
    Math.ceil(rawTokensPerSequence / CACHE_BLOCK_TOKENS) * CACHE_BLOCK_TOKENS;
  const cachedTokens = cachedTokensPerSequence * effectiveSequences;
  const weightsGiB =
    (model.totalParametersB * 1e9 * weightPrecision.bytesPerValue) / GIB;
  const residentFraction = config.cpuOffload
    ? 1 - config.offloadPercent / 100
    : 1;
  const gpuWeightsGiB = weightsGiB * residentFraction;
  const kvCacheGiB =
    (kvElementsPerToken(model) * cachedTokens * kvPrecision.bytesPerValue) /
    GIB;
  // In inference mode activations are not retained layer-by-layer. Treat this
  // as a prefill/workspace approximation rather than a training activation formula.
  const attentionWorkspaceGiB =
    (model.hiddenSize * config.contextTokens * config.batchSize * 6) / GIB;
  const engineWorkspaceGiB =
    0.3 + Math.min(2.2, model.activeParametersB * 0.018);
  const workspaceGiB =
    attentionWorkspaceGiB + engineWorkspaceGiB + (config.cpuOffload ? 0.1 : 0);
  const runtimePerGpuGiB = 1 + Math.min(0.45, model.hiddenSize / 32_768);
  const layout = perGpuLayout({
    gpuWeightsGiB,
    kvCacheGiB,
    workspaceGiB,
    gpuCount: config.gpuCount,
    runtimePerGpuGiB,
    reserve,
  });
  const headroomPerGpuGiB = gpu.memoryGiB - layout.totalPerGpuGiB;

  let minimumGpuCount: number | null = null;
  if (gpu.supportsMultiGpu === false) {
    minimumGpuCount = layout.totalPerGpuGiB <= gpu.memoryGiB ? 1 : null;
  } else {
    for (let count = 1; count <= 32; count += 1) {
      const candidate = perGpuLayout({
        gpuWeightsGiB,
        kvCacheGiB,
        workspaceGiB,
        gpuCount: count,
        runtimePerGpuGiB,
        reserve,
      });
      if (candidate.totalPerGpuGiB <= gpu.memoryGiB) {
        minimumGpuCount = count;
        break;
      }
    }
  }

  const utilization = Math.max(0, layout.totalPerGpuGiB / gpu.memoryGiB);
  const fits = utilization <= 1;
  const safety: SafetyLevel = !fits
    ? "oom"
    : utilization > 0.9
      ? "tight"
      : utilization > 0.72
        ? "caution"
        : "comfortable";
  const performance = performanceEstimate({
    config,
    gpu,
    model,
    weightsGiB,
    totalPerGpuGiB: layout.totalPerGpuGiB,
  });

  return {
    config,
    model,
    gpu,
    reserve,
    weightPrecision,
    kvPrecision,
    effectiveSequences,
    rawTokensPerSequence,
    cachedTokensPerSequence,
    cachedTokens,
    weightsGiB,
    gpuWeightsGiB,
    kvCacheGiB,
    workspaceGiB,
    attentionWorkspaceGiB,
    engineWorkspaceGiB,
    runtimePerGpuGiB,
    fragmentationGiB: layout.fragmentationGiB,
    totalPerGpuGiB: layout.totalPerGpuGiB,
    clusterGiB: layout.clusterGiB,
    capacityGiB: gpu.memoryGiB * config.gpuCount,
    headroomPerGpuGiB,
    headroomClusterGiB: gpu.memoryGiB * config.gpuCount - layout.clusterGiB,
    utilization,
    fits,
    safety,
    minimumGpuCount,
    performance,
  };
}

export function formatGiB(value: number, digits = 1) {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatTokens(value: number) {
  return value >= 1000
    ? `${(value / 1000).toLocaleString("zh-CN", { maximumFractionDigits: 1 })}K`
    : value.toLocaleString("zh-CN");
}
