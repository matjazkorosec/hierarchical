import { useCallback, useEffect, useRef, useState } from 'react';
import FileSelector from './components/FileSelector';
import { dataFiles, DataFileKey } from './utils/constants';
import TreeContainer from './components/TreeContainer';
import { Filtering } from './components/TreeFilter';
import { MenuMarkers } from './models/MenuMarkers';
import MarkerMenu from './components/MarkerMenu';
import { MenuType } from './types';
import TreeShape from './models/TreeShape';
import { TreeRenderer } from './models/TreeRenderer';
import SettingsModal from './components/SettingsModal';
import { getStoredSettings, applyStyles } from './utils/settings';
import Controls from './components/Controls';

function App() {
  const treePot = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<DataFileKey>('data-9.json');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuUtils, setMenuUtils] = useState<MenuType>({
    position: { top: 0, left: 0 },
    branchTarget: null,
    branchItem: null,
  });
  const [debug, setDebug] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [treeStyle, setTreeStyle] = useState(getStoredSettings);

  const treeShapeRef = useRef<TreeShape | null>(null);
  const treeRendererRef = useRef<TreeRenderer>(
    new TreeRenderer(debug, (menuData: MenuType) => {
      setMenuUtils(menuData);
      setShowMenu(true);
    })
  );

  const setSearchQueryStable = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const makeTree = useCallback(
    (tree: MenuMarkers) => {
      if (!selectedFile || !treePot.current) return;

      treePot.current.innerHTML = '';

      let filteredTree: MenuMarkers | null = tree;
      if (searchQuery.length >= 2) {
        filteredTree = Filtering(tree, searchQuery) ?? null;
      }

      if (!filteredTree || !filteredTree.children.length) {
        treeRendererRef.current.renderEmptyTree(treePot.current, selectedFile);
        setLoading(false);
        return;
      }

      treeRendererRef.current.renderTree(
        treePot.current,
        filteredTree,
        treeStyle,
        selectedFile
      );
      setLoading(false);
    },
    [selectedFile, searchQuery, treeStyle]
  );

  useEffect(() => {
    if (!selectedFile) return;

    setShowMenu(false);
    setLoading(true);

    // prevent freezing UI (large files)
    setTimeout(() => {
      const shapeData = new TreeShape(dataFiles[selectedFile]);
      treeShapeRef.current = shapeData;

      shapeData.triggerUpdate((tree) => {
        makeTree(tree);
        setLoading(false);
      });
    }, 0);
  }, [selectedFile, makeTree]);

  useEffect(() => {
    applyStyles(treeStyle);
  }, [treeStyle]);

  const toggleDebugMode = () => {
    const newDebug = !debug;
    setDebug(newDebug);

    treeRendererRef.current.toggleDebug(newDebug);
    setLoading(true);

    setTimeout(() => {
      treeShapeRef.current?.triggerUpdate(makeTree);
    }, 0);
  };

  return (
    <>
      <h1>{selectedFile}</h1>

      <FileSelector
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        setLoading={setLoading}
        disabled={loading}
      />

      <div className="landscape">
        <div className="tree-container">
          <TreeContainer
            searchQuery={searchQuery}
            setSearchQuery={setSearchQueryStable}
            loading={loading}
          />
          <Controls
            debug={debug}
            onToggleDebug={toggleDebugMode}
            onOpenSettings={() => setSettingsOpen(true)}
            disabled={loading}
          />
          {loading && <p className="loading-message">Loading...</p>}
          <div
            className={`tree-pot${loading ? ' loading-nodes' : ''}`}
            ref={treePot}
          ></div>
        </div>
      </div>

      {showMenu && menuUtils.branchTarget && (
        <MarkerMenu
          menuUtils={menuUtils}
          onUpdate={() => treeShapeRef.current?.triggerUpdate(makeTree)}
          onClose={() => setShowMenu(false)}
        />
      )}

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onApplySettings={(settings) => {
          setTreeStyle(settings);
          localStorage.setItem('treeSettings', JSON.stringify(settings));
        }}
      />
    </>
  );
}

export default App;
