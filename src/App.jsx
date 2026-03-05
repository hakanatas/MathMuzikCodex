import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import {
  Music,
  Calculator,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  Layers,
  Award,
  ArrowRight,
  Info,
  Zap,
} from "lucide-react";

// ============================================================
// DATA & MATH UTILITIES
// ============================================================
const LOG2_3_2 = Math.log2(3 / 2);

function minErrorCents(n, ratio) {
  const target = 1200 * Math.log2(ratio);
  const step = 1200 / n;
  const k = Math.round(target / step);
  return Math.abs(target - k * step);
}

function continuedFraction(x, nTerms) {
  const coeffs = [];
  let val = x;
  for (let i = 0; i < nTerms; i += 1) {
    const a = Math.floor(val);
    coeffs.push(a);
    const rem = val - a;
    if (rem < 1e-12) break;
    val = 1 / rem;
  }
  return coeffs;
}

function convergentsFromCF(cf) {
  let pPrev2 = 0;
  let pPrev1 = 1;
  let qPrev2 = 1;
  let qPrev1 = 0;
  const results = [];

  for (const a of cf) {
    const p = a * pPrev1 + pPrev2;
    const q = a * qPrev1 + qPrev2;
    results.push({
      a,
      p,
      q,
      value: q > 0 ? p / q : 0,
      error: q > 0 ? Math.abs(p / q - LOG2_3_2) : Infinity,
    });
    pPrev2 = pPrev1;
    pPrev1 = p;
    qPrev2 = qPrev1;
    qPrev1 = q;
  }

  return results;
}

const CF_COEFFS = continuedFraction(LOG2_3_2, 8);
const CONVERGENTS = convergentsFromCF(CF_COEFFS);

const MAKAM_DATA = [
  { name: "Çargâh", opt53: 1.21, optN: 53, optErr: 1.21, group: "53-TET Optimal" },
  { name: "Buselik", opt53: 1.35, optN: 53, optErr: 1.35, group: "53-TET Optimal" },
  { name: "Kürdi", opt53: 1.28, optN: 53, optErr: 1.28, group: "53-TET Optimal" },
  { name: "Hicaz", opt53: 1.52, optN: 53, optErr: 1.52, group: "53-TET Optimal" },
  { name: "Nihavend", opt53: 1.44, optN: 53, optErr: 1.44, group: "53-TET Optimal" },
  { name: "Uzzal", opt53: 1.38, optN: 53, optErr: 1.38, group: "53-TET Optimal" },
  { name: "Hümayun", opt53: 1.61, optN: 53, optErr: 1.61, group: "53-TET Optimal" },
  { name: "Rast", opt53: 4.15, optN: 94, optErr: 1.16, group: "Farklı Optimum" },
  { name: "Segâh", opt53: 4.15, optN: 94, optErr: 1.16, group: "Farklı Optimum" },
  { name: "Uşşak", opt53: 3.89, optN: 87, optErr: 1.01, group: "Farklı Optimum" },
  { name: "Hüseyni", opt53: 3.89, optN: 87, optErr: 1.01, group: "Farklı Optimum" },
  { name: "Saba", opt53: 3.62, optN: 70, optErr: 1.27, group: "Farklı Optimum" },
  { name: "Hüzzam", opt53: 3.44, optN: 75, optErr: 1.09, group: "Farklı Optimum" },
];

// ============================================================
// SMALL COMPONENTS
// ============================================================
function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
          <Icon size={24} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-slate-500 text-sm mt-1 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

function Card({ children, className = "", highlight = false }) {
  return (
    <div
      className={`rounded-2xl p-5 md:p-6 shadow-sm border transition-all duration-300 ${
        highlight
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-amber-100"
          : "bg-white border-slate-200 hover:shadow-md"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function StatBox({ value, label, color = "text-amber-600" }) {
  return (
    <div className="text-center p-3">
      <div className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function Badge({ children, color = "amber" }) {
  const colors = {
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="font-semibold text-slate-700">{title}</span>
        {open ? (
          <ChevronDown size={18} className="text-slate-400" />
        ) : (
          <ChevronRight size={18} className="text-slate-400" />
        )}
      </button>
      {open && <div className="p-4 border-t border-slate-200">{children}</div>}
    </div>
  );
}

// ============================================================
// HERO SECTION
// ============================================================
function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white py-12 px-6 md:py-16 rounded-3xl mb-8">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center gap-3 mb-4">
          <span className="text-4xl">🎵</span>
          <span className="text-4xl">➕</span>
          <span className="text-4xl">🔢</span>
          <span className="text-4xl">➡️</span>
          <span className="text-4xl">🎯</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Sürekli Kesirler ile
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            Türk Makam Sistemi
          </span>
          'nin
          <br />
          Matematiksel Optimizasyonu
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
          Müzik ve matematik arasındaki binlerce yıllık köprüyü keşfedin. 12 ve 53
          sayılarının neden kültürel birer tesadüf değil, matematiksel birer
          zorunluluk olduğunu interaktif olarak görün.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge color="amber">Sayı Teorisi</Badge>
          <Badge color="blue">Sürekli Kesirler</Badge>
          <Badge color="green">Müzik Matematiği</Badge>
          <Badge color="purple">Makam Analizi</Badge>
        </div>
        <p className="text-sm text-slate-400 mt-6">
          İpek AR — 9. Sınıf Öğrencisi, Fen Bölümü
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PROBLEM SECTION
// ============================================================
function ProblemSection() {
  const [selectedRatio, setSelectedRatio] = useState("3/2");
  const ratios = {
    "3/2": {
      name: "Tam Beşli",
      val: 3 / 2,
      emoji: "🎻",
      desc: "En uyumlu aralık",
    },
    "5/4": {
      name: "Majör Üçlü",
      val: 5 / 4,
      emoji: "😊",
      desc: "Neşeli tını",
    },
    "6/5": {
      name: "Minör Üçlü",
      val: 6 / 5,
      emoji: "😢",
      desc: "Hüzünlü tını",
    },
  };
  const r = ratios[selectedRatio];
  const logVal = Math.log2(r.val);

  return (
    <section className="mb-10">
      <SectionTitle
        icon={BookOpen}
        title="Problem: Doğa vs. Matematik"
        subtitle="Doğadaki kusursuz ses oranlarını eşit adımlı bir enstrümana yerleştirmek neden imkânsız?"
      />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-lg text-slate-700 mb-3">
            Doğanın Kusursuz Oranları
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Pisagor'dan bu yana müziğin temeli basit tam sayı oranlarıdır. Bir
            telin uzunluğunu değiştirerek elde edilen sesler:
          </p>
          <div className="flex gap-2 mb-4">
            {Object.entries(ratios).map(([key, { name, emoji }]) => (
              <button
                key={key}
                onClick={() => setSelectedRatio(key)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  selectedRatio === key
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {emoji} {name}
              </button>
            ))}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">{r.emoji}</div>
            <div className="text-2xl font-bold text-slate-800">
              {r.name}: {selectedRatio}
            </div>
            <div className="text-sm text-slate-500">{r.desc}</div>
            <div className="mt-3 text-sm">
              <span className="text-slate-600">log₂({selectedRatio}) = </span>
              <span className="font-mono font-bold text-amber-600">
                {logVal.toFixed(10)}...
              </span>
            </div>
            <div className="mt-1 text-xs text-red-500 font-medium">
              ← İrrasyonel sayı! Asla tam temsil edilemez.
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-lg text-slate-700 mb-3">
            Entonasyon Problemi
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Bir oktavı <em>n</em> eşit parçaya böldüğümüzde her adım 2
            <sup>1/n</sup> olur. <em>k</em> adım sonra ulaşılan oran:
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-center font-mono text-lg mb-3">
            2<sup>k/n</sup> ≈ {selectedRatio}
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <ArrowRight size={16} className="text-slate-400" />
            <span className="text-sm text-slate-600">
              Her iki tarafın logaritmasını alırsak:
            </span>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center font-mono text-lg mb-3">
            k/n ≈ {logVal.toFixed(6)}...
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center text-sm">
            <span className="font-bold text-red-700">Çözümsüz!</span>
            <span className="text-red-600">
              {" "}
              Sol taraf rasyonel (k/n), sağ taraf irrasyonel. Asla eşit olamazlar
              — sadece yaklaşabilirler.
            </span>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ============================================================
// CONTINUED FRACTIONS INTERACTIVE
// ============================================================
function ContinuedFractionVisual({ coeffs, depth }) {
  const maxDepth = Math.min(depth, coeffs.length - 1);
  const colorClasses = [
    "text-amber-700 border-amber-300",
    "text-blue-700 border-blue-300",
    "text-green-700 border-green-300",
    "text-purple-700 border-purple-300",
    "text-red-700 border-red-300",
    "text-teal-700 border-teal-300",
    "text-pink-700 border-pink-300",
    "text-indigo-700 border-indigo-300",
  ];

  const renderTerm = (index) => {
    const colorClass = colorClasses[index % colorClasses.length];
    const box = (
      <span className={`inline-block rounded border px-1 py-0.5 font-bold ${colorClass}`}>
        {coeffs[index]}
      </span>
    );

    if (index === maxDepth) {
      return (
        <span>
          {box}
          {index < coeffs.length - 1 ? " + ..." : ""}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1">
        {box}
        <span>+</span>
        <span className="inline-flex flex-col items-center leading-none align-middle">
          <span className="border-b border-slate-500 px-1">1</span>
          <span className="px-1 mt-1">{renderTerm(index + 1)}</span>
        </span>
      </span>
    );
  };

  return (
    <div className="overflow-x-auto py-2 text-center font-mono text-sm md:text-base text-slate-700">
      <span className="font-semibold">log₂(3/2) ≈ </span>
      {renderTerm(0)}
    </div>
  );
}

function ConvergentCalculationDetail({ convergents, step }) {
  const current = convergents[step];
  if (!current || step < 0) return null;

  const rows = [];
  for (let k = 0; k <= step && k < convergents.length; k += 1) {
    const c = convergents[k];
    if (k === 0) {
      rows.push({ k, a: c.a, pFormula: `a₀ = ${c.a}`, qFormula: "1", p: c.p, q: c.q });
    } else if (k === 1) {
      rows.push({
        k,
        a: c.a,
        pFormula: `a₁·p₀ + 1 = ${c.a}·${convergents[0].p} + 1 = ${c.p}`,
        qFormula: `a₁·q₀ + 0 = ${c.a}·${convergents[0].q} + 0 = ${c.q}`,
        p: c.p,
        q: c.q,
      });
    } else {
      const prev1 = convergents[k - 1];
      const prev2 = convergents[k - 2];
      rows.push({
        k,
        a: c.a,
        pFormula: `a${subscript(k)}·p${subscript(k - 1)} + p${subscript(k - 2)} = ${c.a}·${prev1.p} + ${prev2.p} = ${c.p}`,
        qFormula: `a${subscript(k)}·q${subscript(k - 1)} + q${subscript(k - 2)} = ${c.a}·${prev1.q} + ${prev2.q} = ${c.q}`,
        p: c.p,
        q: c.q,
      });
    }
  }

  return (
    <Card className="mb-6">
      <h3 className="font-bold text-lg text-slate-700 mb-2 flex items-center gap-2">
        <Info size={18} className="text-amber-500" /> Yakınsak Nasıl Hesaplanır?
      </h3>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-500 mb-3 text-center">
          Kesir Gösterimi — slider'ı hareket ettirerek açılımı izleyin
        </h4>
        <div className="bg-slate-50 rounded-xl p-6 overflow-x-auto">
          <ContinuedFractionVisual coeffs={CF_COEFFS} depth={step} />
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-slate-400">
            =
            <span className="font-mono font-bold text-amber-700">
              {(convergents[step]?.p || 0)}/{convergents[step]?.q || 1}
            </span>
            <span className="text-slate-400"> = </span>
            <span className="font-mono text-slate-600">
              {convergents[step]?.q > 0
                ? (convergents[step].p / convergents[step].q).toFixed(8)
                : "—"}
              ...
            </span>
            <span className="text-slate-400"> (hedef: 0.58496250...)</span>
          </span>
        </div>
      </div>

      <Collapsible title="1. Adım: Sürekli Kesir Açılımı" defaultOpen>
        <p className="text-sm text-slate-600 mb-3">
          Hedef sayımız
          <span className="font-mono font-bold text-amber-700">
            {" "}
            x = log₂(3/2) = 0.58496...
          </span>
          {" "}
          olsun. Algoritma şöyle işler:
        </p>
        <div className="space-y-2 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="font-bold text-blue-700">i)</span> Sayının tam kısmını al:
            <span className="font-mono">
              {" "}
              a₀ = ⌊0.58496...⌋ = <strong>0</strong>
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="font-bold text-blue-700">ii)</span> Kalan kısmın tersini al:
            <span className="font-mono">
              {" "}
              1/(0.58496... - 0) = <strong>1.70951...</strong>
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="font-bold text-blue-700">iii)</span> Tekrarla:
            <span className="font-mono">
              {" "}
              a₁ = ⌊1.70951...⌋ = <strong>1</strong>
            </span>
            , sonra
            <span className="font-mono">
              {" "}
              1/(1.70951... - 1) = 1/(0.70951...) = <strong>1.40942...</strong>
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="font-bold text-blue-700">iv)</span> Devam:
            <span className="font-mono"> a₂ = <strong>1</strong></span>,
            <span className="font-mono"> a₃ = <strong>2</strong></span>,
            <span className="font-mono"> a₄ = <strong>3</strong></span>,
            <span className="font-mono"> a₅ = <strong>1</strong></span>,
            <span className="font-mono"> a₆ = <strong>2</strong></span>, ...
          </div>
        </div>
        <div className="mt-3 bg-amber-50 rounded-lg p-3 text-center">
          <span className="text-sm text-slate-600">Sonuç: </span>
          <span className="font-mono font-bold text-amber-700 text-lg">
            log₂(3/2) = [0; 1, 1, 2, 3, 1, 2, ...]
          </span>
        </div>
      </Collapsible>

      <Collapsible
        title="2. Adım: Yakınsakların Hesaplanması (Rekürans Formülleri)"
        defaultOpen
      >
        <p className="text-sm text-slate-600 mb-3">
          Katsayılardan yakınsak kesirleri
          <span className="font-mono"> p<sub>k</sub>/q<sub>k</sub></span> hesaplamak
          için şu rekürans bağıntıları kullanılır:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-500 mb-1 font-medium">Pay (p) Formülü</div>
            <div className="font-mono text-lg font-bold text-blue-800">
              p<sub>k</sub> = a<sub>k</sub> · p<sub>k-1</sub> + p<sub>k-2</sub>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <div className="text-xs text-green-500 mb-1 font-medium">
              Payda (q) Formülü
            </div>
            <div className="font-mono text-lg font-bold text-green-800">
              q<sub>k</sub> = a<sub>k</sub> · q<sub>k-1</sub> + q<sub>k-2</sub>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-3">
          <span className="font-bold">Başlangıç değerleri:</span> p<sub>-1</sub> = 1,
          p<sub>-2</sub> = 0, q<sub>-1</sub> = 0, q<sub>-2</sub> = 1
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-2 text-left text-slate-500 w-8">k</th>
                <th className="py-2 text-center text-slate-500 w-10">a<sub>k</sub></th>
                <th className="py-2 text-left text-slate-500">p<sub>k</sub> hesaplama</th>
                <th className="py-2 text-left text-slate-500">q<sub>k</sub> hesaplama</th>
                <th className="py-2 text-center text-slate-500">Yakınsak</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isSpecial = r.q === 12 || r.q === 53;
                return (
                  <tr
                    key={i}
                    className={`border-b border-slate-100 ${
                      isSpecial
                        ? "bg-amber-50"
                        : i === rows.length - 1
                          ? "bg-blue-50"
                          : ""
                    }`}
                  >
                    <td className="py-2 font-bold text-slate-700">{r.k}</td>
                    <td className="py-2 text-center font-bold text-amber-600">{r.a}</td>
                    <td className="py-2 font-mono text-xs text-blue-700">{r.pFormula}</td>
                    <td className="py-2 font-mono text-xs text-green-700">{r.qFormula}</td>
                    <td className="py-2 text-center font-mono font-bold">
                      {r.p}/{r.q}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Collapsible>

      <Collapsible title="3. Adım: Müzikal Yorumlama">
        <p className="text-sm text-slate-600 mb-3">
          Yakınsak
          <span className="font-mono"> p<sub>k</sub>/q<sub>k</sub></span> bize şunu
          söyler: "Bir oktavı <span className="font-bold">q<sub>k</sub></span> eşit
          parçaya bölersen, <span className="font-bold">p<sub>k</sub></span> adım atarak
          tam beşliye en yakın noktaya ulaşırsın."
        </p>
        <div className="space-y-2">
          {rows
            .filter((r) => r.q > 0)
            .map((r, i) => {
              const errorCents = minErrorCents(r.q, 3 / 2);
              const isSpecial = r.q === 12 || r.q === 53;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                    isSpecial
                      ? "bg-amber-100 border border-amber-300"
                      : "bg-slate-50"
                  }`}
                >
                  <span
                    className={`font-mono font-bold w-12 text-center ${
                      isSpecial ? "text-amber-700" : "text-slate-600"
                    }`}
                  >
                    {r.q}-TET
                  </span>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(2, Math.min(100, (1 - errorCents / 20) * 100))}%`,
                          backgroundColor: isSpecial
                            ? r.q === 12
                              ? "#3b82f6"
                              : "#f59e0b"
                            : "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-xs w-24 text-right">
                    {errorCents.toFixed(2)} sent hata
                  </span>
                  {isSpecial && (
                    <Badge color={r.q === 12 ? "blue" : "amber"}>
                      {r.q === 12 ? "Batı" : "Türk"}
                    </Badge>
                  )}
                </div>
              );
            })}
        </div>
        <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-green-800">
          <span className="font-bold">Neden "en iyi"?</span> Sürekli kesir teoreminin
          garantisi: q<sub>k</sub>'dan küçük hiçbir payda, p<sub>k</sub>/q<sub>k</sub>'dan
          daha iyi bir yaklaşım üretemez. Bu yüzden 12 ve 53 sayıları tesadüf
          değil, <em>matematiksel zorunluluktur</em>.
        </div>
      </Collapsible>
    </Card>
  );
}

function subscript(n) {
  const subs = "₀₁₂₃₄₅₆₇₈₉";
  return String(n)
    .split("")
    .map((d) => subs[+d] || d)
    .join("");
}

function ContinuedFractionSection() {
  const [step, setStep] = useState(6);

  const visibleConvergents = CONVERGENTS.slice(0, step + 1);
  const musicalNames = [
    "Başlangıç",
    "Oktav",
    "Tritone",
    "5-TET (Pentatonik)",
    "12-TET (Batı Müziği)",
    "41-TET",
    "53-TET (Türk Müziği)",
    "306-TET",
  ];

  const chartData = visibleConvergents
    .filter((c) => c.q > 0 && c.error > 0)
    .map((c, i) => ({
      name: `${c.p}/${c.q}`,
      hata: c.error,
      n: c.q,
      musical: musicalNames[i + (visibleConvergents[0].q === 0 ? 0 : 0)] || "",
    }));

  return (
    <section className="mb-10">
      <SectionTitle
        icon={Calculator}
        title="Sürekli Kesirler Algoritması"
        subtitle="İrrasyonel sayılara en iyi rasyonel yaklaşımları bulan güçlü bir araç"
      />

      <Card className="mb-6">
        <h3 className="font-bold text-lg text-slate-700 mb-3">Katsayılar Dizisi</h3>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <span className="text-sm text-slate-500 self-center">log₂(3/2) = [</span>
          {CF_COEFFS.map((a, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg transition-all ${
                i <= step
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-200 scale-110"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {a}
            </span>
          ))}
          <span className="text-sm text-slate-500 self-center">, ...]</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-slate-500">Adım sayısı:</span>
          <input
            type="range"
            min={1}
            max={7}
            value={step}
            onChange={(e) => setStep(+e.target.value)}
            className="w-48 accent-amber-500"
          />
          <Badge color="amber">{step + 1} adım</Badge>
        </div>
      </Card>

      <ConvergentCalculationDetail convergents={CONVERGENTS} step={step} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-slate-700 mb-3">Yakınsak Tablosu</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-2 text-left text-slate-500">Adım</th>
                  <th className="py-2 text-center text-slate-500">aₖ</th>
                  <th className="py-2 text-center text-slate-500">Yakınsak</th>
                  <th className="py-2 text-right text-slate-500">Hata</th>
                  <th className="py-2 text-right text-slate-500">Müzikal</th>
                </tr>
              </thead>
              <tbody>
                {visibleConvergents.map((c, i) => {
                  const isSpecial = c.q === 12 || c.q === 53;
                  return (
                    <tr
                      key={i}
                      className={`border-b border-slate-100 ${
                        isSpecial ? "bg-amber-50 font-bold" : ""
                      }`}
                    >
                      <td className="py-2">{i}</td>
                      <td className="py-2 text-center">{c.a}</td>
                      <td className="py-2 text-center font-mono">
                        {c.p}/{c.q}
                      </td>
                      <td className="py-2 text-right font-mono text-xs">
                        {c.error < 0.001
                          ? c.error.toExponential(2)
                          : c.error.toFixed(4)}
                      </td>
                      <td className="py-2 text-right text-xs">
                        {isSpecial ? (
                          <Badge color={c.q === 12 ? "blue" : "amber"}>
                            {musicalNames[i]}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">{musicalNames[i]}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-700 mb-3">Hata Düşüşü (Logaritmik)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis scale="log" domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [v.toFixed(6), "Hata"]}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="hata" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.n === 12 ? "#3b82f6" : d.n === 53 ? "#f59e0b" : "#94a3b8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 text-center mt-2">
            Her adımda hata dramatik biçimde düşer.
            <span className="text-blue-600 font-bold"> 12-TET</span> ve
            <span className="text-amber-600 font-bold"> 53-TET</span> en iyi
            yakınsaklardır.
          </p>
        </Card>
      </div>
    </section>
  );
}

// ============================================================
// 5-LIMIT COMPARISON
// ============================================================
function FiveLimitSection() {
  const [nValue, setNValue] = useState(53);

  const errFifth = minErrorCents(nValue, 3 / 2);
  const errMajor = minErrorCents(nValue, 5 / 4);
  const errMinor = minErrorCents(nValue, 6 / 5);
  const total = errFifth + errMajor + errMinor;

  const err12 = {
    fifth: minErrorCents(12, 3 / 2),
    major: minErrorCents(12, 5 / 4),
    minor: minErrorCents(12, 6 / 5),
  };
  const err53 = {
    fifth: minErrorCents(53, 3 / 2),
    major: minErrorCents(53, 5 / 4),
    minor: minErrorCents(53, 6 / 5),
  };

  const comparisonData = [
    { name: "Beşli (3:2)", "12-TET": err12.fifth, "53-TET": err53.fifth },
    { name: "Majör (5:4)", "12-TET": err12.major, "53-TET": err53.major },
    { name: "Minör (6:5)", "12-TET": err12.minor, "53-TET": err53.minor },
  ];

  const sweepData = useMemo(() => {
    const data = [];
    for (let n = 5; n <= 120; n += 1) {
      const e =
        minErrorCents(n, 3 / 2) +
        minErrorCents(n, 5 / 4) +
        minErrorCents(n, 6 / 5);
      data.push({ n, toplam: +e.toFixed(2), isSpecial: n === 12 || n === 53 });
    }
    return data;
  }, []);

  return (
    <section className="mb-10">
      <SectionTitle
        icon={Target}
        title="5-Limit Çoklu Aralık Analizi"
        subtitle="Tek bir aralık değil, üç temel aralığı aynı anda optimize etmek"
      />

      <Card highlight className="mb-6">
        <h3 className="font-bold text-lg text-slate-700 mb-4 text-center">
          İnteraktif n-TET Hesaplayıcı
        </h3>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-sm font-medium text-slate-600">n =</span>
          <input
            type="range"
            min={5}
            max={120}
            value={nValue}
            onChange={(e) => setNValue(+e.target.value)}
            className="w-64 accent-amber-500"
          />
          <span className="text-3xl font-bold text-amber-600 w-16 text-center">
            {nValue}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <StatBox value={`${errFifth.toFixed(2)}`} label="Beşli Hatası (sent)" />
          <StatBox value={`${errMajor.toFixed(2)}`} label="Majör Hatası (sent)" />
          <StatBox value={`${errMinor.toFixed(2)}`} label="Minör Hatası (sent)" />
          <StatBox
            value={`${total.toFixed(2)}`}
            label="TOPLAM (sent)"
            color={
              total < 5
                ? "text-green-600"
                : total < 15
                  ? "text-amber-600"
                  : "text-red-600"
            }
          />
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {[12, 19, 31, 41, 53, 72, 94].map((n) => (
            <button
              key={n}
              onClick={() => setNValue(n)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                nValue === n
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {n}-TET
            </button>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-slate-700 mb-3">12-TET vs 53-TET Karşılaştırma</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{
                  value: "Sent",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
                formatter={(v) => [`${v.toFixed(2)} sent`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="12-TET" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="53-TET" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
            <div className="bg-blue-50 rounded-lg p-2">
              <span className="font-bold text-blue-700">12-TET toplam:</span>
              <br />
              {(err12.fifth + err12.major + err12.minor).toFixed(2)} sent
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <span className="font-bold text-amber-700">53-TET toplam:</span>
              <br />
              {(err53.fifth + err53.major + err53.minor).toFixed(2)} sent
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <span className="font-bold text-green-700">İyileşme:</span>
              <br />
              {(
                (err12.fifth + err12.major + err12.minor) /
                (err53.fifth + err53.major + err53.minor)
              ).toFixed(1)}
              x
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-700 mb-3">Toplam Hata Taraması (n = 5...120)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={sweepData}
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="n" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                label={{
                  value: "Sent",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
                formatter={(v, name, props) => [
                  `${v} sent (n=${props.payload.n})`,
                  "Toplam Hata",
                ]}
              />
              <Line
                type="monotone"
                dataKey="toplam"
                stroke="#94a3b8"
                strokeWidth={1.5}
                dot={false}
              />
              {sweepData
                .filter((d) => d.isSpecial)
                .map((d) => (
                  <Line
                    key={d.n}
                    type="monotone"
                    dataKey="toplam"
                    data={[d]}
                    stroke={d.n === 12 ? "#3b82f6" : "#f59e0b"}
                    strokeWidth={0}
                    dot={{
                      r: 6,
                      fill: d.n === 12 ? "#3b82f6" : "#f59e0b",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 text-center mt-2">
            <span className="text-amber-600 font-bold">53-TET</span> belirgin bir
            global minimum (vadi) oluşturur.
          </p>
        </Card>
      </div>
    </section>
  );
}

// ============================================================
// MAKAM OPTIMIZATION
// ============================================================
function MakamSection() {
  const makamBarData = MAKAM_DATA.map((m) => ({
    name: m.name,
    "53-TET": m.opt53,
    Optimum: m.optErr,
    optN: m.optN,
    group: m.group,
  }));

  return (
    <section className="mb-10">
      <SectionTitle
        icon={Layers}
        title="Makam-Bazlı Optimizasyon"
        subtitle="53-TET her makam için gerçekten en iyi mi? Ağırlıklı hata fonksiyonu ile test"
      />

      <Card className="mb-6">
        <h3 className="font-bold text-slate-700 mb-2">Ağırlıklı Hata Fonksiyonu</h3>
        <div className="bg-slate-50 rounded-xl p-4 text-center font-mono text-base mb-3">
          E<sub>makam</sub>(n) = Σ w<sub>i</sub> · |C<sub>i</sub> - k
          <sub>i</sub>·(1200/n)| / Σ w<sub>i</sub>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-red-50 rounded-lg p-3">
            <span className="font-bold text-red-700">Karar & Güçlü Perdeler:</span>
            {" "}
            w = 2.0
            <p className="text-xs text-red-600 mt-1">
              Makamın bitişini ve karakterini belirler
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <span className="font-bold text-slate-700">Diğer Perdeler:</span> w =
            1.0
            <p className="text-xs text-slate-500 mt-1">Dizi içindeki seyir perdeleri</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="font-bold text-slate-700 mb-3">
          13 Makam: 53-TET vs. Optimum Karşılaştırma
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={makamBarData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, angle: -35 }}
              interval={0}
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{
                value: "Hata (sent)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
              formatter={(v, name, props) => {
                if (name === "Optimum") {
                  return [`${v.toFixed(2)} sent (${props.payload.optN}-TET)`, "Optimum"];
                }
                return [`${v.toFixed(2)} sent`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="53-TET" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Optimum" radius={[4, 4, 0, 0]}>
              {makamBarData.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.optN === 53
                      ? "#94a3b8"
                      : d.optN === 94
                        ? "#f59e0b"
                        : d.optN === 87
                          ? "#8b5cf6"
                          : d.optN === 70
                            ? "#10b981"
                            : "#ec4899"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card highlight>
          <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <Zap size={18} /> Temel Bulgu
          </h3>
          <p className="text-sm text-slate-700">
            53-TET sistemi 13 makamdan yalnızca <span className="font-bold">7'si</span>
            için en iyidir. Geriye kalan <span className="font-bold text-amber-700">6
            makam</span> için daha düşük hata üreten farklı n değerleri mevcuttur.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Bu, 53-TET'in tüm makamlar için evrensel bir doğru değil,
            <span className="font-bold"> tarihsel bir uzlaşma</span> olduğunu gösterir.
          </p>
        </Card>
        <Card>
          <h3 className="font-bold text-slate-700 mb-2">Makam Grupları ve Optimumlar</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
              <span>Rast, Segâh</span>
              <Badge color="amber">94-TET (%72 iyileşme)</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
              <span>Uşşak, Hüseyni</span>
              <Badge color="purple">87-TET (%74 iyileşme)</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
              <span>Saba</span>
              <Badge color="green">70-TET (%65 iyileşme)</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
              <span>Hüzzam</span>
              <Badge color="red">75-TET (%68 iyileşme)</Badge>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ============================================================
// CENTS RULER INTERACTIVE
// ============================================================
function CentsRulerSection() {
  const [showTarget, setShowTarget] = useState("fifth");
  const targets = {
    fifth: {
      name: "Tam Beşli",
      cents: 1200 * Math.log2(3 / 2),
      color: "#ef4444",
    },
    major: {
      name: "Majör Üçlü",
      cents: 1200 * Math.log2(5 / 4),
      color: "#22c55e",
    },
    minor: {
      name: "Minör Üçlü",
      cents: 1200 * Math.log2(6 / 5),
      color: "#8b5cf6",
    },
  };
  const t = targets[showTarget];

  const steps12 = Array.from({ length: 13 }, (_, i) => i * 100);
  const steps53 = Array.from({ length: 54 }, (_, i) => +(i * 1200 / 53).toFixed(1));

  const nearest12 = steps12.reduce((a, b) =>
    Math.abs(b - t.cents) < Math.abs(a - t.cents) ? b : a
  );
  const nearest53 = steps53.reduce((a, b) =>
    Math.abs(b - t.cents) < Math.abs(a - t.cents) ? b : a
  );

  return (
    <section className="mb-10">
      <SectionTitle
        icon={Music}
        title="Sent Cetveli"
        subtitle="12-TET ve 53-TET sistemlerinin perde yoğunluklarını karşılaştırın"
      />
      <Card>
        <div className="flex gap-2 justify-center mb-4">
          {Object.entries(targets).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setShowTarget(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                showTarget === key
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="relative bg-slate-50 rounded-xl p-4 overflow-x-auto">
          <div className="relative w-full" style={{ minWidth: 700, height: 120 }}>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300" />

            {steps12.map((c) => (
              <div
                key={`12-${c}`}
                className="absolute"
                style={{ left: `${(c / 1200) * 100}%`, top: "20%", height: "20%" }}
              >
                <div className="w-0.5 h-full bg-blue-500 mx-auto" />
              </div>
            ))}

            {steps53.map((c) => (
              <div
                key={`53-${c}`}
                className="absolute"
                style={{ left: `${(c / 1200) * 100}%`, top: "60%", height: "15%" }}
              >
                <div className="w-px h-full bg-amber-500 mx-auto opacity-70" />
              </div>
            ))}

            <div
              className="absolute"
              style={{ left: `${(t.cents / 1200) * 100}%`, top: "5%", height: "90%" }}
            >
              <div
                className="w-0.5 h-full mx-auto"
                style={{ backgroundColor: t.color, borderStyle: "dashed" }}
              />
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold px-1 py-0.5 rounded"
                style={{ color: t.color }}
              >
                {t.name} ({t.cents.toFixed(1)})
              </div>
            </div>

            <div className="absolute right-0 top-[20%] text-xs text-blue-600 font-medium">
              12-TET
            </div>
            <div className="absolute right-0 top-[60%] text-xs text-amber-600 font-medium">
              53-TET
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="text-blue-700 font-bold">12-TET en yakın:</span> {nearest12}
            sent
            <br />
            <span className="text-blue-600">
              Hata: {Math.abs(nearest12 - t.cents).toFixed(2)} sent
            </span>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <span className="text-amber-700 font-bold">53-TET en yakın:</span> {nearest53}
            sent
            <br />
            <span className="text-amber-600">
              Hata: {Math.abs(nearest53 - t.cents).toFixed(2)} sent
            </span>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ============================================================
// CONCLUSION SECTION
// ============================================================
function ConclusionSection() {
  return (
    <section className="mb-6">
      <SectionTitle
        icon={Award}
        title="Sonuç"
        subtitle="Projenin temel bulguları ve katkıları"
      />
      <Card highlight>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🔢</div>
            <h3 className="font-bold text-slate-700 mb-1">Matematiksel Kanıt</h3>
            <p className="text-sm text-slate-600">
              12 ve 53 sayıları kültürel tesadüf değil, sürekli kesir teorisinin
              ürettiği <strong>matematiksel zorunluluklardır</strong>.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-bold text-slate-700 mb-1">11x İyileşme</h3>
            <p className="text-sm text-slate-600">
              53-TET sistemi, 5-limit toplam hatasını 12-TET'e kıyasla
              <strong> ~11 kat</strong> azaltarak üstün bir denge sunar.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🎵</div>
            <h3 className="font-bold text-slate-700 mb-1">Özgün Katkı</h3>
            <p className="text-sm text-slate-600">
              53-TET tüm makamlar için en iyi değil;
              <strong> dinamik mikrotonal</strong> geçiş ile her makam kendi
              optimumunda icra edilebilir.
            </p>
          </div>
        </div>
      </Card>

      <Collapsible title="Gelecek Araştırma Yönleri">
        <ul className="text-sm text-slate-600 space-y-2">
          <li className="flex gap-2">
            <ArrowRight size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            7-limit sistemi (doğal yedili, 7:4 oranı) analize dahil edilebilir
          </li>
          <li className="flex gap-2">
            <ArrowRight size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            Psikoakustik JND (5-8 sent) testleri ile matematiksel optimumların
            algısal karşılığı doğrulanabilir
          </li>
          <li className="flex gap-2">
            <ArrowRight size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            Çalınan makama göre anlık bölüntü geçişi yapan akıllı algoritmalar
            (dynamic microtonal retuning) geliştirilebilir
          </li>
        </ul>
      </Collapsible>
    </section>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const sections = [
    { id: "problem", label: "Problem", icon: BookOpen },
    { id: "cf", label: "Sürekli Kesirler", icon: Calculator },
    { id: "ruler", label: "Sent Cetveli", icon: Music },
    { id: "5limit", label: "5-Limit", icon: Target },
    { id: "makam", label: "Makam", icon: Layers },
    { id: "sonuc", label: "Sonuç", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 py-2 px-4">
        <div className="max-w-5xl mx-auto flex gap-1 overflow-x-auto">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all"
            >
              <s.icon size={14} />
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <HeroSection />
        <div id="problem">
          <ProblemSection />
        </div>
        <div id="cf">
          <ContinuedFractionSection />
        </div>
        <div id="ruler">
          <CentsRulerSection />
        </div>
        <div id="5limit">
          <FiveLimitSection />
        </div>
        <div id="makam">
          <MakamSection />
        </div>
        <div id="sonuc">
          <ConclusionSection />
        </div>

        <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100">
          Bu interaktif sayfa, İpek AR'ın "Sürekli Kesirler ve Diophant Yaklaşımı
          ile Türk Makam Sisteminin Matematiksel Optimizasyonu" projesi temel
          alınarak hazırlanmıştır.
        </footer>
      </div>
    </div>
  );
}
