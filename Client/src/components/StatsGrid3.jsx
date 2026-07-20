const colsMap = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

const getValueFontSize = (value) => {
  const length = String(value).length;
  if (length <= 6) return "text-2xl";
  if (length <= 14) return "text-xl";
  if (length <= 18) return "text-lg";
  return "text-base";
};


export const StatsGrid3 = ({ items = [], maxCols = 4 }) => {
  const lgCols = colsMap[maxCols] ?? "lg:grid-cols-4";

  return (
    <div className=" mb-5">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-4`}>
        {items.map((item) => (
          <div key={item.label} className="min-w-0 p-5 flex flex-col gap-2 bg-card rounded-2xl p-4 shadow-xl flex items-start space-x-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center shrink-0 bg-primary/30">
                <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
              </div>
              <p className="uppercase text-[10px] font-bold tracking-wide text-muted">
                {item.label}
              </p>
            </div>
            <p className={`text-primary font-bold leading-none ${getValueFontSize(item.value)} -mt-1`}>
              {item.value}
            </p>
            {item.subtext && (
              <span className="text-xs text-muted -mt-1">{item.subtext}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};