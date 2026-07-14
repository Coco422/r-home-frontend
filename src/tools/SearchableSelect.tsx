import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ChevronDown } from "lucide-react";

export type SearchableOption<Value extends string = string> = {
  value: Value;
  label: string;
  group: string;
  keywords?: string;
};

type Props<Value extends string> = {
  value: Value;
  options: readonly SearchableOption<Value>[];
  onChange: (value: Value) => void;
  placeholder: string;
  "aria-label"?: string;
};

export function filterSearchOptions<Value extends string>(
  options: readonly SearchableOption<Value>[],
  query: string,
) {
  const term = normaliseSearch(query);
  if (!term) return [...options];

  const directMatches = options.filter((option) =>
    normaliseSearch(`${option.label} ${option.keywords ?? ""}`).includes(term),
  );
  if (directMatches.length) return directMatches;

  return options.filter((option) => {
    const normalisedGroup = normaliseSearch(option.group);
    const exactGroupToken = option.group
      .split(/[·/\s]+/)
      .map(normaliseSearch)
      .some((token) => token === term);
    return normalisedGroup === term || exactGroupToken;
  });
}

export function SearchableSelect<Value extends string>({
  value,
  options,
  onChange,
  placeholder,
  "aria-label": ariaLabel = "选择项",
}: Props<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelPlacement, setPanelPlacement] = useState({
    opensUpward: false,
    maxHeight: 360,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(
    () => filterSearchOptions(options, query),
    [options, query],
  );
  const groupedOptions = useMemo(() => {
    const groups = new Map<string, SearchableOption<Value>[]>();
    for (const option of filteredOptions) {
      const group = groups.get(option.group) ?? [];
      group.push(option);
      groups.set(option.group, group);
    }
    return [...groups.entries()];
  }, [filteredOptions]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const updatePlacement = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = Math.max(0, window.innerHeight - rect.bottom - 12);
      const above = Math.max(0, rect.top - 12);
      const opensUpward = below < 240 && above > below;
      setPanelPlacement({
        opensUpward,
        maxHeight: Math.max(
          160,
          Math.min(360, opensUpward ? above : below),
        ),
      });
    };
    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const closeWhenOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", closeWhenOutside);
    return () => document.removeEventListener("pointerdown", closeWhenOutside);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [value]);

  const close = (restoreFocus = false) => {
    setIsOpen(false);
    setQuery("");
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  const choose = (nextValue: Value) => {
    onChange(nextValue);
    close(true);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    }
    if (event.key === "Enter" && filteredOptions.length === 1) {
      event.preventDefault();
      choose(filteredOptions[0].value);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`searchable-select ${isOpen ? "is-open" : ""} ${
        panelPlacement.opensUpward ? "opens-upward" : ""
      }`}
    >
      <button
        ref={triggerRef}
        className="searchable-select-trigger"
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={listId}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} aria-hidden />
      </button>

      {isOpen ? (
        <div
          id={listId}
          className="searchable-select-panel"
          role="dialog"
          aria-label={`${ariaLabel}搜索`}
          style={
            {
              "--search-panel-max-height": `${panelPlacement.maxHeight}px`,
            } as CSSProperties
          }
        >
          <input
            ref={inputRef}
            className="searchable-select-input"
            type="search"
            value={query}
            placeholder="搜索名称、系列或显存"
            aria-label={`搜索${ariaLabel}`}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <div className="searchable-select-results">
            {groupedOptions.length ? (
              groupedOptions.map(([group, groupOptions]) => (
                <section key={group} className="searchable-select-group">
                  <h3>{group}</h3>
                  {groupOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={option.value === value}
                      className={
                        option.value === value
                          ? "searchable-select-option is-selected"
                          : "searchable-select-option"
                      }
                      onClick={() => choose(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </section>
              ))
            ) : (
              <p className="searchable-select-empty">没有匹配项</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normaliseSearch(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[·/_.\-\s]+/g, "")
    .trim();
}
