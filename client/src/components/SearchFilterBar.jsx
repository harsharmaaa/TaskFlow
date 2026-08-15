import React from 'react';

function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  assigneeFilter,
  setAssigneeFilter,
  priorityFilter,
  setPriorityFilter,
  selectedLabels,
  setSelectedLabels,
  onClear,
  members = [],
  allLabels = [],
}) {
  const toggleLabel = (label) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const hasActiveFilters =
    searchQuery ||
    assigneeFilter !== 'all' ||
    priorityFilter !== 'all' ||
    selectedLabels.length > 0;

  return (
    <div className="w-full bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-6 flex flex-col gap-4 select-none backdrop-blur-md">
      {/* Top Row: Search Input & Dropdown Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search Input Box */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-brand-500 focus:outline-none text-slate-200 text-xs placeholder-slate-600 transition-all duration-200"
          />
          <svg
            className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Dropdowns & Reset Button */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Assignee Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 focus:outline-none text-xs transition-all cursor-pointer font-medium"
            >
              <option value="all">Everyone</option>
              <option value="unassigned">Unassigned</option>
              {members.map((member) => {
                const mUser = member.user || {};
                return (
                  <option key={mUser._id} value={mUser._id}>
                    {mUser.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 focus:outline-none text-xs transition-all cursor-pointer font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Clear Filters Trigger */}
          {hasActiveFilters && (
            <button
              onClick={onClear}
              type="button"
              className="px-3.5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:border-rose-500/30 text-xs font-bold active:scale-95 transition-all duration-200"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Bottom Row: Label Pills filter */}
      {allLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1.5 select-none">
            Filter by Labels:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {allLabels.map((label) => {
              const isSelected = selectedLabels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all duration-150 border cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 border-brand-500 text-white font-bold shadow-md shadow-brand-500/15'
                      : 'bg-white/[0.01] border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFilterBar;
