import { useState } from 'react'

export const Tabs = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id)

  return (
    <div>
      <div className="flex flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab.id
                ? "border-b-3 border-primary text-primary"
                : "border-b border-secondary/50 text-secondary hover:text-primary hover:cursor-pointer"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className='py-5'>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}