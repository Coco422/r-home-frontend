import { DEPLOYMENT_PRICE_AS_OF } from "../lib/deployment-pricing";

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
    question: "部署价格如何估算？",
    answer:
      "按所选硬件的公开云租赁参考价 × 设备数量 × 运行时长计算；多卡按单卡价线性估算，地域、库存与实例规格都会改变结算价。",
  },
  {
    question: "报价包含什么、不包含什么？",
    answer: `价格数据截至 ${DEPLOYMENT_PRICE_AS_OF}，仅供预算；实例规格、存储、税费与运维以服务商结算页为准。`,
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
