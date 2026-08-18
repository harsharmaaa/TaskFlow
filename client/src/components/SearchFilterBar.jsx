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
    <div className="w-full bg-cardBg border border-borderSep rounded-card p-4 mb-6 flex flex-col gap-4 select-none">
      {/* Top Row: Search Input & Dropdown Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search Input Box */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full pl-10 pr-4 py-2 rounded-input bg-appBg border border-borderSep focus:border-accent focus:outline-none text-textPrimary text-xs placeholder-textMuted/40 transition-all duration-200"
          />
          <svg
            className="absolute left-3.5 top-2.5 w-4 h-4 text-textMuted/40"
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
            <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 rounded-input bg-appBg border border-borderSep hover:border-textMuted/30 text-textPrimary focus:outline-none text-xs transition-all cursor-pointer font-semibold"
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
            <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-input bg-appBg border border-borderSep hover:border-textMuted/30 text-textPrimary focus:outline-none text-xs transition-all cursor-pointer font-semibold"
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
              className="px-3.5 py-2 rounded-btn border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/30 text-rose-400 text-xs font-semibold active:scale-95 transition-all duration-200"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Bottom Row: Label Pills filter */}
      {allLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-borderSep pt-4">
          <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mr-1.5 select-none">
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
                      ? 'bg-accent border-accent text-white font-semibold'
                      : 'bg-appBg border-borderSep hover:border-textMuted/30 text-textMuted hover:text-textPrimary'
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
