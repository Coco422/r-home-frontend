import { HARDWARE_PURCHASE_AS_OF } from "../lib/hardware-purchase";

const FAQ_ITEMS = [
  {
    question: "结果可以直接上线吗？",
    answer:
      "这是容量预算，包含权重、KV、工作区与运行时预留；上线前仍应以相同引擎、量化和并发做压测。",
  },
  {
    question: "为什么长上下文更吃显存？",
    answer:
      "KV Cache 按上下文 × 批量 × 并发增长，权重并不会。先检查输入长度、并发与 KV 精度。",
  },
  {
    question: "4-bit 后为什么还可能 OOM？",
    answer:
      "量化主要降低权重；KV、工作区和运行时仍会占用显存。长上下文服务优先控制 Cache。",
  },
  {
    question: "多卡能直接把显存相加吗？",
    answer:
      "需目标引擎支持张量或流水线并行，且会产生通信和分配器开销；工具的结果不等于任意多卡都可运行。",
  },
  {
    question: "Mac Studio / DGX Spark 怎么算？",
    answer:
      "它们使用统一内存，应按可供 GPU 使用的容量估算，并为系统留余量；不应把多台机器的内存简单相加。",
  },
  {
    question: "CPU 权重卸载是怎么估的？",
    answer:
      "这里按分层权重卸载近似：GPU 保留未卸载权重，CPU 内存承接卸载部分。紧凑 / 均衡 / 保守只改变显存安全余量，不会自动得出 PCIe、NVLink、层切分或具体引擎的实测速度；页面会单独显示 CPU 内存需求并标注容量近似。",
  },
  {
    question: "购置预算包括什么？",
    answer:
      "它是一次性硬件购置预算：GPU 外还会列入 CPU、内存、主板、SSD、机箱、电源、散热和基础网络。税费、运保、机柜、UPS、电力、运维与软件许可另计。",
  },
  {
    question: "为什么不能只把 GPU 单价相加？",
    answer:
      "多卡需要对应的 PCIe 槽位、供电、散热、CPU、ECC 内存和机箱；SXM/HGX、统一内存设备或多节点方案更应按完整整机询价，不能用普通工作站底座相加。",
  },
  {
    question: "价格能直接当采购报价吗？",
    answer: `不能。数据整理于 ${HARDWARE_PURCHASE_AS_OF}，只用于初筛；库存、地区、税率、二手成色、保修和整机配置都会改变成交价，请以供应商书面报价为准。`,
  },
];

export function CalculatorFaq() {
  return (
    <section className="calculator-faq" aria-labelledby="faq-title">
      <div className="faq-heading">
        <h2 id="faq-title">FAQ</h2>
        <a
          href="https://help.aliyun.com/zh/pai/product-overview/estimation-of-the-required-video-memory-for-the-model"
          target="_blank"
          rel="noreferrer"
        >
          计算口径 ↗
        </a>
      </div>
      <div className="faq-grid">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="faq-card">
            <summary>
              <span>{item.question}</span>
              <i aria-hidden="true">+</i>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
