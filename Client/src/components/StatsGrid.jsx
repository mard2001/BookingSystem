const colsMap = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

const getValueFontSize = (value) => {
  const length = String(value).length;
  if (length <= 6) return "text-lg";
  if (length <= 14) return "text-base";
  if (length <= 18) return "text-sm";
  return "text-xs";
};

export const StatsGrid = ({ items = [], maxCols = 4 }) => {
  const lgCols = colsMap[maxCols] ?? "lg:grid-cols-4";

  return (
    <div className=" mb-5">
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${lgCols} gap-4`}>
        {items.map((item, index) => (
          <div key={index} className="bg-card rounded-2xl p-4 shadow-xl flex items-start space-x-3">
            <div>
              <div className="bg-gradient-to-tr from-primary/50 to-primary-darker/30 p-3 rounded-lg">
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
            </div>
            <div className="">
              <p className="uppercase text-[10px] text-secondary font-bold">{item.label}</p>
              <p className={`text-primary font-bold -mb-2 truncate ${getValueFontSize(item.value)}`}>
                {item.value}
              </p>
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