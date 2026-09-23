import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Trash2, Copy, Check, MessageSquareCode } from 'lucide-react';
import MathView from './MathView';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

/**
 * Renders syntax-highlighted code blocks in chat messages with a copy button.
 */
function ChatCodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded border border-zinc-800 bg-zinc-950 overflow-hidden text-xs font-mono shadow-xs max-w-full">
      <div className="px-3 py-1 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="font-bold text-orange-400">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-300 hover:text-white cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-zinc-200 leading-relaxed max-w-full">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Parses markdown inline math $...$, code backticks `...`, bold **...**, and headers.
 */
function FormattedInlineText({ text }) {
  if (!text) return null;

  const parts = text.split(/(`[^`]+`|\$[^\$]+\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;

        if (part.startsWith('$') && part.endsWith('$')) {
          return <MathView key={i} math={part.slice(1, -1)} className="mx-1" />;
        }

        if (part.startsWith('`') && part.endsWith('`')) {
          const content = part.slice(1, -1);
          if (/^(O\(|Ω\(|Θ\(|\\Omega|\\Theta|N\^|T\(N\))/i.test(content)) {
            return (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-orange-600/10 text-orange-800 dark:text-orange-300 font-mono text-xs border border-orange-600/20">
                <MathView math={content} />
              </span>
            );
          }
          return (
            <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-stone-200 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 font-mono text-[11px] border border-stone-300 dark:border-zinc-700">
              {content}
            </code>
          );
        }

        const subParts = part.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i}>
            {subParts.map((sub, j) => {
              if (sub.startsWith('**') && sub.endsWith('**')) {
                return <strong key={j} className="font-bold text-stone-900 dark:text-stone-100">{sub.slice(2, -2)}</strong>;
              }
              return sub;
            })}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Renders a complete markdown message with headers, list items, and code blocks.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_]*)\n([\s\S]*?)```/g;
  const sections = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      sections.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    sections.push({
      type: 'code',
      lang: match[1] || 'code',
      code: match[2].trim()
    });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    sections.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return (
    <div className="space-y-2 font-sans leading-relaxed text-xs sm:text-sm break-words overflow-hidden max-w-full">
      {sections.map((sec, sIdx) => {
        if (sec.type === 'code') {
          return <ChatCodeBlock key={sIdx} code={sec.code} lang={sec.lang} />;
        }

        const lines = sec.content.split('\n');
        return (
          <div key={sIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-sm font-mono font-bold text-orange-700 dark:text-orange-400 pt-1 pb-0.5 border-b border-stone-300 dark:border-zinc-800">
                    <FormattedInlineText text={trimmed.slice(4)} />
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={lIdx} className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 pt-1">
                    <FormattedInlineText text={trimmed.slice(5)} />
                  </h4>
                );
              }

              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                    <span className="font-mono font-bold text-orange-700 dark:text-orange-400 text-xs shrink-0 mt-0.5">{numMatch[1]}.</span>
                    <div className="flex-1">
                      <FormattedInlineText text={numMatch[2]} />
                    </div>
                  </div>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2 my-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <FormattedInlineText text={trimmed.slice(2)} />
                    </div>
                  </div>
                );
              }

              return (
                <p key={lIdx}>
                  <FormattedInlineText text={line} />
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function AlgorithmChatPanel({ code, language, analysis, apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your Algorithmic Assistant. Ask me to **explain your ${language.toUpperCase()} code step-by-step**, suggest **optimizations**, or list **edge cases**!`
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesFeedRef = useRef(null);

  const timeO = analysis?.time_complexity_o || 'O(N)';
  const spaceO = analysis?.space_complexity || 'O(1)';
  const formulaStr = analysis?.formula_str || '';

  const scrollToBottom = () => {
    if (messagesFeedRef.current) {
      messagesFeedRef.current.scrollTo({
        top: messagesFeedRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          time_complexity_o: timeO,
          space_complexity: spaceO,
          formula: formulaStr,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          api_key: apiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error('Chat API error');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.warn("Chat API error, using smart fallback response:", err);
      let reply = "";
      const query = text.toLowerCase();
      const codeLines = (code || '').split('\n');

      const lineMatch = query.match(/\bline[s]?\s*(\d+)/i);

      const conceptKB = {
        recursion: {
          title: "What is Recursion?",
          def: "Recursion is a programming paradigm where a function calls itself to solve smaller instances of the same problem until reaching a **Base Case**.",
          pts: ["Base Case stops infinite recursion.", "Consumes call stack frames.", "Used in Divide & Conquer algorithms."]
        },
        "dynamic programming": {
          title: "What is Dynamic Programming (DP)?",
          def: "Dynamic Programming is an algorithmic optimization technique that breaks problems into overlapping subproblems and caches intermediate results.",
          pts: ["Memoization: Top-down caching.", "Tabulation: Bottom-up DP table.", "Reduces exponential $O(2^N)$ down to $O(N)$ or $O(N^2)$."]
        },
        dp: {
          title: "What is Dynamic Programming (DP)?",
          def: "DP avoids redundant calculations by storing intermediate subproblem answers in tables or hash maps.",
          pts: ["Eliminates repeated recursive computations.", "Saves exponential time."]
        },
        memoization: {
          title: "What is Memoization?",
          def: "Memoization is a top-down DP caching technique that stores return values of expensive function calls.",
          pts: ["Checks cache before running recursive calculations.", "Trades $O(N)$ space for drastic speedup."]
        },
        "binary search": {
          title: "What is Binary Search?",
          def: "Binary Search is a logarithmic $O(\\log N)$ search algorithm that locates targets in a **sorted array** by halving the search space per step.",
          pts: ["Requires a sorted input array.", "Eliminates 50% of remaining elements per check.", "At most $\\log_2(N)$ iterations."]
        },
        "divide and conquer": {
          title: "What is Divide & Conquer?",
          def: "Divide & Conquer splits a problem into smaller independent subproblems, solves them recursively, and combines subproblem answers.",
          pts: ["Used in Merge Sort ($O(N \\log N)$) and Quick Sort.", "Recursive tree structure."]
        },
        "sliding window": {
          title: "What is the Sliding Window Technique?",
          def: "Sliding Window maintains continuous subarray/substring bounds using index pointers to eliminate nested loops.",
          pts: ["Reduces $O(N^2)$ loops to linear $O(N)$ time.", "Maintains running sums/counts."]
        },
        "two pointers": {
          title: "What is the Two Pointers Technique?",
          def: "Two Pointers uses two index variables iterating simultaneously across arrays to solve search/pair problems in $O(N)$ time.",
          pts: ["Ideal for sorted array target matching.", "Executes in linear $O(N)$ time with $O(1)$ space."]
        },
        "base case": {
          title: "What is a Base Case?",
          def: "A Base Case is the anchor condition in a recursive function that returns a direct value without further recursive calls.",
          pts: ["Prevents infinite recursion and stack overflow.", "Constant $O(1)$ execution."]
        },
        lambda: {
          title: "What is a Lambda Function?",
          def: "A `lambda` function is a small, inline anonymous function defined without a formal function header.",
          pts: ["Syntax in Python: `lambda args: expression`.", "Used in inline callbacks, `sorted()`, `map()`."]
        },
        yield: {
          title: "What is the `yield` Keyword?",
          def: "`yield` turns a standard function into a Generator, producing values lazily on-demand.",
          pts: ["Saves memory by producing items one-at-a-time ($O(1)$ space).", "Pauses function state between iterations."]
        },
        self: {
          title: "What is `self` in Python?",
          def: "`self` represents the instance of the object within class methods, granting access to attributes.",
          pts: ["Passed as first parameter to instance methods.", "Binds variables to object instance."]
        },
        vector: {
          title: "What is a `std::vector` in C++?",
          def: "`std::vector` is a dynamic array in C++ that resizes automatically.",
          pts: ["Constant $O(1)$ lookup via `vec[i]`.", "Amortized $O(1)$ tail insertion via `push_back()`."]
        },
        hashmap: {
          title: "What is a HashMap / Dictionary?",
          def: "A HashMap (`dict` in Python, `unordered_map` in C++) maps keys to values using hash tables for rapid $O(1)$ indexing.",
          pts: ["Constant $O(1)$ average time key lookups.", "Consumes $O(N)$ space."]
        }
      };

      const matchedConceptKey = Object.keys(conceptKB).find(k => query.includes(k));

      if (matchedConceptKey) {
        const c = conceptKB[matchedConceptKey];
        reply = `### ${c.title}\n\n${c.def}\n\n#### Key Mechanics & Properties:\n` +
          c.pts.map(p => `- ${p}`).join('\n') +
          `\n\n#### Context in Your ${language.toUpperCase()} Code:\n- **Time Complexity:** **${timeO}**\n- **Space Complexity:** **${spaceO}**\n- **Formula:** \`${formulaStr}\``;
      } else if (isSymbolQuery && symbolMatch) {
        const fnName = symbolMatch.toLowerCase();
        const builtins = {
          append: "In Python, `list.append(item)` adds a single element to the end of a dynamic list in **O(1) amortized constant time**. It appends elements into memory without needing array copies.",
          pop: "In Python, `list.pop()` removes and returns the last element in **O(1)** time. `list.pop(0)` removes from the front in **O(N)** linear time.",
          extend: "In Python, `list.extend(iterable)` appends all items from another collection to the list in **O(K)** time.",
          insert: "In Python, `list.insert(index, item)` places an element at a specific index in **O(N)** linear time.",
          range: "In Python, `range(start, stop)` generates an arithmetic sequence on-demand in **O(1)** memory.",
          len: "Returns element count in constant **O(1)** time.",
          sort: "Sorts elements in-place with worst-case **O(N log N)** time complexity.",
          sorted: "Returns a new sorted array in **O(N log N)** time.",
          push: "In JavaScript/C++, `array.push(val)` appends an element to the container tail in **O(1)** amortized time.",
          push_back: "In C++, `std::vector::push_back(val)` appends an element to the container tail in **O(1)** amortized time."
        };
        const occurrences = codeLines.map((l, i) => ({ line: i + 1, text: l })).filter(item => item.text.includes(symbolMatch));
        
        reply = `### Code Symbol & Method Analysis: \`${symbolMatch}\`\n\n` +
          `#### 1. Definition & Technical Purpose\n` +
          `${builtins[fnName] || `\`${symbolMatch}\` is a variable or function in your code used to process or store state during execution.`}\n\n` +
          `#### 2. Occurrences & Role in Your Code\n` +
          `Found \`${symbolMatch}\` on **${occurrences.length} line(s)**:\n` +
          (occurrences.length > 0 ? occurrences.map(o => `- **Line ${o.line}:** \`${o.text.trim()}\``).join('\n') : `\`${symbolMatch}\` does not explicitly appear in your active code lines, but is a core programming language symbol.`) + `\n\n` +
          `#### 3. Asymptotic & Performance Impact\n` +
          (fnName === 'append' || fnName === 'push' || fnName === 'push_back'
            ? `- **Time Complexity:** Executed in **$O(1)$ amortized constant time** per call.\n- **Space Complexity:** Allocates **$O(N)$ auxiliary space** across $N$ elements.`
            : `- **Time Complexity:** Constant **$O(1)$** operation per step pass.\n- **Space Complexity:** Operates within allocated scope memory.`);
      } else if (lineMatch) {
        const lineNo = parseInt(lineMatch[1], 10);
        if (lineNo > 0 && lineNo <= codeLines.length) {
          const lineText = codeLines[lineNo - 1];
          reply = `### Line ${lineNo} Inquiry\n\n\`\`\`${language}\n${lineNo}: ${lineText}\n\`\`\`\n- **Statement:** \`${lineText.trim()}\`\n- **Impact:** Contributes to overall **${timeO}** time complexity.`;
        } else {
          reply = `Line ${lineNo} is out of bounds for the current code snippet (${codeLines.length} lines total).`;
        }
      } else if (query.includes("each line") || query.includes("all lines") || query.includes("line by line") || query.includes("step by step") || query.includes("explain code") || query.includes("walkthrough") || query.includes("explain")) {
        const breakdownLines = codeLines.map((lText, idx) => {
          const stripped = lText.trim();
          if (!stripped) return null;
          let role = "Statement execution — Performs operation within block scope.";
          let cost = "$O(1)$ step cost";
          if (stripped.startsWith("def ") || stripped.startsWith("function ") || stripped.includes("main(")) {
            role = "Function declaration — Defines scope entry point, allocates parameter call stack frame.";
            cost = "$O(1)$ constant setup";
          } else if (stripped.startsWith("if ") || stripped.startsWith("elif ") || stripped.startsWith("else")) {
            role = "Conditional branch evaluation — Directs execution flow based on boolean condition.";
            cost = "$O(1)$ constant evaluation";
          } else if (stripped.startsWith("for ") || stripped.startsWith("while ")) {
            role = "Loop control header — Drives iterative pass over dataset across N steps.";
            cost = "$O(N)$ linear pass";
          } else if (stripped.startsWith("return ")) {
            role = "Return statement — Returns computed result to caller and releases stack frame memory.";
            cost = "$O(1)$ constant return";
          } else if (stripped.includes("append(") || stripped.includes("push(")) {
            role = "Element insertion — Appends element to dynamic container tail in amortized constant time.";
            cost = "$O(1)$ amortized";
          }
          return `#### **Line ${idx + 1}:** \`${stripped}\`\n- **Explanation:** ${role}\n- **Asymptotic Cost:** ${cost}`;
        }).filter(Boolean);

        reply = `### Line-by-Line Breakdown of ${language.toUpperCase()} Code (${codeLines.length} Lines)\n\n**Time Complexity:** **${timeO}** | **Space Complexity:** **${spaceO}**\n\n` + breakdownLines.join('\n\n');
      } else if (query.includes("time") || query.includes("big-o") || query.includes("slow") || query.includes("complexity")) {
        reply = `### Time Complexity: **${timeO}**\n\nGoverned by operation formula \`${formulaStr}\`. Loop nesting levels dictate how execution steps scale as input size $N$ grows.`;
      } else if (query.includes("space") || query.includes("memory") || query.includes("ram")) {
        reply = `### Space Complexity: **${spaceO}**\n\nMemory footprint accounts for scalar variables, dynamic data structures, and call stack frames allocated during execution.`;
      } else if (query.includes("optimize") || query.includes("refactor") || query.includes("improve") || query.includes("rewrite")) {
        if (timeO.includes("N²") || timeO.includes("N^2")) {
          reply = `### Optimization Strategy (${language.toUpperCase()})\n\nTo optimize from **${timeO}** to **O(N)**:\n1. Use a **Hash Map / HashSet** for constant-time $O(1)$ lookups.\n2. Sort the input array upfront to apply a **Two-Pointer** sliding window.`;
        } else {
          reply = `Your implementation is already operating at an optimal **${timeO}** asymptotic bound!`;
        }
      } else if (query.includes("edge") || query.includes("corner") || query.includes("test")) {
        reply = `### Key Edge Cases to Test:\n1. **Empty input ($N=0$):** Verify no index out of bounds exception.\n2. **Single element ($N=1$):** Check loop termination.\n3. **Large inputs ($N > 100,000$):** Test for timeout or stack overflow.`;
      } else {
        reply = `### ${language.toUpperCase()} Algorithm Assistant\n\n- **Time Complexity:** **${timeO}**\n- **Space Complexity:** **${spaceO}**\n- **Formula:** \`${formulaStr}\`\n\nAsk me about **recursion, DP, binary search**, **what is use of append**, **explain line numbers**, or **optimizations**!`;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setIsTyping(false);
    }
  };

  const PROMPT_CHIPS = [
    "Explain this algorithm step-by-step",
    "How can I optimize this code?",
    "What edge cases should I test?",
    "Explain space complexity memory footprint"
  ];

  return (
    <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 p-4 flex flex-col overflow-hidden shadow-xs bg-[#f8f6f0] dark:bg-[#18181b] min-h-0 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-300 dark:border-zinc-800 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-orange-600/10 text-orange-600 dark:text-orange-400 border border-orange-600/20">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Algorithm Chatbot
            </h3>
            <p className="text-[11px] text-stone-600 dark:text-zinc-400 font-mono">
              Context: {language.toUpperCase()} • {timeO} • {spaceO}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{
            role: 'assistant',
            content: `Chat cleared. Ask me any question about your ${language.toUpperCase()} code!`
          }])}
          className="p-1 rounded text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 shrink-0 border-b border-stone-300/60 dark:border-zinc-800/60 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0 ml-1" />
        {PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-stone-200/80 dark:bg-zinc-900 text-stone-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-800 hover:border-orange-600/50 hover:text-orange-700 dark:hover:text-orange-400 transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div ref={messagesFeedRef} className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] p-3 rounded border shadow-xs break-words overflow-hidden ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white border-orange-700 text-xs sm:text-sm leading-relaxed'
                  : 'bg-stone-200/60 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-zinc-800'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <FormattedMessage text={msg.content} />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-xs text-stone-600 dark:text-zinc-400 flex items-center gap-2 font-mono">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="ml-1 text-[11px]">Assistant generating response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2.5 border-t border-stone-300 dark:border-zinc-800 flex items-center gap-2 shrink-0 font-mono"
      >
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={`Ask a question about your ${language.toUpperCase()} algorithm...`}
          className="flex-1 px-3 py-2 rounded bg-stone-100 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-orange-600 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMsg.trim() || isTyping}
          className="px-3 py-2 rounded bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
