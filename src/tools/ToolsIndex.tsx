import { useEffect } from "react";

export function ToolsIndex() {
  useEffect(() => {
    document.title = "工具 / Ray";
  }, []);

  return (
    <div className="tools-page">
      <header className="tools-topbar tools-shell">
        <a className="tools-wordmark" href="/" aria-label="返回安落滢主页">
          <span className="tools-wordmark-dot" aria-hidden="true" />
          <span>Ray / 工具</span>
        </a>
        <a className="tools-back-link" href="/">
          ← 返回主页
        </a>
      </header>

      <main className="tools-shell tools-main">
        <p className="tools-kicker">独立的小器物 · 都在浏览器完成</p>
        <h1>器</h1>
        <p className="tools-intro">
          把反复要算、要解释、要分享的事，做成一件可以直接使用的小工具。
        </p>

        <section className="tool-grid" aria-label="工具列表">
          <a
            className="tool-card tool-card--featured"
            href="/tools/vram-calculator"
          >
            <div className="tool-card-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="tool-card-copy">
              <p>AI / 推理</p>
              <h2>LLM 显存计算器</h2>
              <span>
                拆开权重、KV Cache
                与运行时余量，模拟内存变化，分享一组可复现的配置。 <b>进入 →</b>
              </span>
            </div>
            <div className="tool-card-spark" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </a>
          <div
            className="tool-card tool-card--quiet"
            aria-label="更多工具即将发布"
          >
            <p>Next</p>
            <h2>下一件器物</h2>
            <span>正在酝酿中。</span>
          </div>
        </section>
      </main>
    </div>
  );
}
