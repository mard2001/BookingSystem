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
    <div className=" mb-5">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-4`}>
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-xl flex items-center space-x-3">
            <div>
              <div className="bg-gradient-to-tr from-primary/50 to-primary-darker/30 p-3 rounded-lg">
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>
            <div>
              <p className="uppercase text-xs text-secondary font-bold">{item.label}</p>
              <p className="text-primary text-xl font-bold -mb-2">{item.value}</p>
              { item.subtext && (
                <span className="text-xs text-secondary">{item.subtext}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};