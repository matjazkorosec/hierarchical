import React from 'react';
import TreeFilter from './TreeFilter';

interface TreeContainerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
}

function TreeContainer({
  searchQuery,
  setSearchQuery,
  loading,
}: TreeContainerProps) {
  return (
    <>
      <TreeFilter
        key="tree-filter"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        disabled={loading}
      />
    </>
  );
}

export default React.memo(TreeContainer, (prevProps, nextProps) => {
  return (
    prevProps.searchQuery === nextProps.searchQuery
    // kills focus so no loader
    // && prevProps.loading === nextProps.loading
  );
});
