import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../hooks/useLanguageContext";

export default function Toast() {
  const { toasts, removeToast } = useToast();
  const t = useTranslation();

  const metaByType = {
    success: {
      icon: CheckCircle2,
      title: t.toast?.successTitle || "Success",
      panel: "border-emerald-200/90 bg-white/90 text-emerald-900",
      iconWrap: "bg-emerald-100 text-emerald-600",
      progress: "bg-emerald-500",
    },
    error: {
      icon: XCircle,
      title: t.toast?.errorTitle || "Error",
      panel: "border-rose-200/90 bg-white/90 text-rose-900",
      iconWrap: "bg-rose-100 text-rose-600",
      progress: "bg-rose-500",
    },
    info: {
      icon: Info,
      title: t.toast?.infoTitle || "Info",
      panel: "border-sky-200/90 bg-white/90 text-sky-900",
      iconWrap: "bg-sky-100 text-sky-600",
      progress: "bg-sky-500",
    },
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        (() => {
          const meta = metaByType[toast.type] || metaByType.info;
          const Icon = meta.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 ${meta.panel}`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={`mt-0.5 rounded-full p-1.5 ${meta.iconWrap}`}>
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
                    {meta.title}
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-5 wrap-break-word">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full p-1 text-slate-500 transition hover:bg-black/5 hover:text-slate-700"
                  aria-label={t.toast?.close || "Close toast"}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="h-1 w-full bg-black/5">
                <div className={`h-full w-full opacity-80 ${meta.progress}`} />
              </div>
            </div>
          );
        })()
      ))}
    </div>
  );
}
