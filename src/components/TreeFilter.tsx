import { Search } from 'lucide-react';
import { MenuMarkers } from '../models/MenuMarkers';
import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

interface TreeFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  disabled: boolean;
}

// filter based on search query
export const Filtering = (
  tree: MenuMarkers,
  query: string
): MenuMarkers | null => {
  if (!tree) return null;

  const lowerQuery = query.toLowerCase();
  const valueMatch =
    tree.setValue && tree.setValue().toString().includes(query);
  const nameMatch = tree.name?.toLowerCase().includes(lowerQuery);

  if (nameMatch || valueMatch) {
    return tree;
  }

  const filteredChildren = tree.children
    ?.map((child) => Filtering(child, query))
    .filter(Boolean) as MenuMarkers[];

  // if matching children return new MenuMarkers
  if (filteredChildren.length > 0) {
    const clonedTree = Object.create(Object.getPrototypeOf(tree));
    return Object.assign(clonedTree, tree, { children: filteredChildren });
  }

  return null;
};

export default function TreeFilter({
  searchQuery,
  setSearchQuery,
  disabled,
}: TreeFilterProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // debouncing
  const debouncedUpdate = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
      }, 100),
    [setSearchQuery]
  );

  // maintain focus
  useEffect(() => {
    if (document.activeElement === inputRef.current) {
      inputRef.current?.focus();
    }
  }, [searchQuery]);

  return (
    <div className="filter-field">
      <label>
        <Search size={16} className="search-icon" />
        <input
          ref={inputRef}
          className="filter-input"
          type="text"
          placeholder="Filter nodes..."
          value={searchQuery}
          onChange={(e) => debouncedUpdate(e.target.value)}
          disabled={disabled}
        />
      </label>
    </div>
  );
}
