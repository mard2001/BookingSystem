const colsMap = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export const StatsGrid = ({ items = [], maxCols = 4 }) => {
  const lgCols = colsMap[maxCols] ?? "lg:grid-cols-4";

  return (
    <div className="mt-10 mb-5">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-4`}>
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-xl">
            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            <p className="uppercase text-xs text-secondary font-bold mt-2">{item.label}</p>
            <p className="text-primary text-xl font-bold -mb-1">{item.value}</p>
            { item.subtext && (
              <span className="text-xs text-secondary">{item.subtext}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};