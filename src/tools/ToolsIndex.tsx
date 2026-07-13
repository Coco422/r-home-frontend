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
          主页
        </a>
      </header>

      <main className="tools-shell tools-main" aria-label="工具列表">
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
            <h1>LLM 显存计算器</h1>
            <span>
              显存 · 速度 · 分享 <b>进入 →</b>
            </span>
          </div>
        </a>
      </main>
    </div>
  );
}
