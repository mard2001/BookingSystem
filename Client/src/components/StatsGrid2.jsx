const colsMap = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export const StatsGrid2 = ({ items = [], maxCols = 4 }) => {
  const lgCols = colsMap[maxCols] ?? "lg:grid-cols-4";

  return (
    <div className="mb-5">
      <div className={`grid grid-cols-2 sm:grid-cols-2 ${lgCols} gap-4`}>
        {items.map((item, index) => (
          <div key={index} className="bg-card rounded-2xl py-2 px-4  shadow-md flex items-center gap-3">
            <span className={`w-1.5 h-10 rounded-full shrink-0 ${item.accentColor ?? "bg-primary"}`}/>
            <div>
              <p className="uppercase text-[10px] tracking-wide text-secondary font-bold">
                {item.label}
              </p>
              <p className="text-primary text-2xl font-bold -mt-0.5">{item.value}</p>
              {item.subtext && (
                <span className="text-xs text-secondary">{item.subtext}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};