import {
  estimateCrackTime,
  generate,
  generatePin,
  generatePronounceable,
  strength,
  strengthLabel,
  type GeneratedPassword,
} from "../src/index";

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

type Mode = "random" | "pronounceable" | "pin";
let mode: Mode = "random";

const state = {
  length: 16,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
  pin: 6,
  pron: 14,
};

function barColor(bits: number): string {
  if (bits < 36) return "var(--bad)";
  if (bits < 60) return "var(--warn)";
  if (bits < 128) return "var(--ok)";
  return "var(--good)";
}

function setMeter(fill: HTMLElement, label: HTMLElement, info: HTMLElement, bits: number, extra: string) {
  const pct = Math.min(100, Math.round((bits / 128) * 100));
  fill.style.width = `${pct}%`;
  fill.style.background = barColor(bits);
  label.textContent = strengthLabel(bits);
  label.style.color = barColor(bits);
  info.textContent = extra;
}

function current(): GeneratedPassword {
  if (mode === "pin") return generatePin(state.pin);
  if (mode === "pronounceable") return generatePronounceable({ length: state.pron });
  return generate({
    length: state.length,
    lowercase: state.lowercase,
    uppercase: state.uppercase,
    digits: state.digits,
    symbols: state.symbols,
    excludeAmbiguous: state.excludeAmbiguous,
  });
}

function regenerate(): void {
  let result: GeneratedPassword;
  try {
    result = current();
  } catch (e) {
    $("pw").textContent = "⚠️ enable at least one character type";
    setMeter($("barFill"), $("label"), $("info"), 0, "");
    return;
  }
  $("pw").textContent = result.password;
  const ct = estimateCrackTime(result.entropyBits);
  setMeter($("barFill"), $("label"), $("info"), result.entropyBits, `${result.entropyBits} bits · cracks in ${ct.text}`);
}

function checkbox(key: keyof typeof state, label: string): string {
  return `<label class="opt"><input type="checkbox" data-key="${key}" ${state[key] ? "checked" : ""}/> ${label}</label>`;
}

function renderControls(): void {
  const c = $("controls");
  if (mode === "random") {
    c.innerHTML =
      `<label class="range">Length: <b id="lenVal">${state.length}</b>
         <input id="len" type="range" min="6" max="64" value="${state.length}"/></label>
       <div class="opts">
         ${checkbox("lowercase", "a-z")}${checkbox("uppercase", "A-Z")}
         ${checkbox("digits", "0-9")}${checkbox("symbols", "!@#")}
         ${checkbox("excludeAmbiguous", "No look-alikes")}
       </div>`;
    $("len").addEventListener("input", (e) => {
      state.length = Number((e.target as HTMLInputElement).value);
      $("lenVal").textContent = String(state.length);
      regenerate();
    });
    for (const el of Array.from(c.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))) {
      el.addEventListener("change", () => {
        (state as Record<string, unknown>)[el.dataset.key as string] = el.checked;
        regenerate();
      });
    }
  } else if (mode === "pin") {
    c.innerHTML = `<label class="range">Digits: <b id="pinVal">${state.pin}</b>
      <input id="pin" type="range" min="3" max="12" value="${state.pin}"/></label>`;
    $("pin").addEventListener("input", (e) => {
      state.pin = Number((e.target as HTMLInputElement).value);
      $("pinVal").textContent = String(state.pin);
      regenerate();
    });
  } else {
    c.innerHTML = `<label class="range">Length: <b id="pronVal">${state.pron}</b>
      <input id="pron" type="range" min="8" max="24" value="${state.pron}"/></label>
      <p class="note">Pronounceable = easier to type & remember (lower entropy than random).</p>`;
    $("pron").addEventListener("input", (e) => {
      state.pron = Number((e.target as HTMLInputElement).value);
      $("pronVal").textContent = String(state.pron);
      regenerate();
    });
  }
}

for (const btn of Array.from($("tabs").querySelectorAll("button"))) {
  btn.addEventListener("click", () => {
    mode = btn.dataset.mode as Mode;
    for (const b of Array.from($("tabs").querySelectorAll("button"))) b.classList.toggle("active", b === btn);
    renderControls();
    regenerate();
  });
}

$("regen").addEventListener("click", regenerate);
$("copy").addEventListener("click", (e) => {
  navigator.clipboard.writeText($("pw").textContent ?? "");
  const b = e.currentTarget as HTMLButtonElement;
  const t = b.textContent;
  b.textContent = "Copied!";
  setTimeout(() => (b.textContent = t), 1100);
});

const checkInput = $<HTMLInputElement>("check");
checkInput.addEventListener("input", () => {
  const s = strength(checkInput.value);
  setMeter(
    $("checkFill"),
    $("checkLabel"),
    $("checkInfo"),
    s.entropyBits,
    checkInput.value ? `${s.entropyBits} bits · cracks in ${s.crackTime.text}` : "",
  );
});

renderControls();
regenerate();
