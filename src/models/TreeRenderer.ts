import * as d3 from 'd3';
import { MenuMarkers } from './MenuMarkers';
import { MenuType } from '../types';
import { EditIcon, ChevronDown, ChevronRight } from '../utils/icons';
import { PerformanceTracker } from './PerformanceTracker';

// global menu state
declare global {
  interface Window {
    menuOpen: boolean;
  }
}

window.menuOpen = false;

// renders hierarchical tree structure with D3.js
export class TreeRenderer {
  private debug: boolean;
  private onMenuOpen: (menuData: MenuType) => void;
  private performanceTracker: PerformanceTracker;

  constructor(debug: boolean, onMenuOpen: (menuData: MenuType) => void) {
    this.debug = debug;
    this.onMenuOpen = onMenuOpen;
    this.performanceTracker = new PerformanceTracker();
  }

  // renders tree structure
  async renderTree(
    containerRef: HTMLDivElement | null,
    tree: MenuMarkers,
    settings: { usePositiveNegativeColors: boolean },
    selectedFile: string
  ): Promise<void> {
    if (!containerRef) {
      console.warn('renderTree cant be called with null containerRef');
      return;
    }

    this.performanceTracker.clear();
    this.performanceTracker.start('Tree');

    const container = d3.select(containerRef);
    container.html('');

    const rootUl = container
      .append('ul')
      .attr('class', `tree ${selectedFile.replace('.json', '')}`);

    const renderedNodes = new Set<MenuMarkers>();
    const nodes = this.getAllNodes(tree);
    console.log('Total nodes:', nodes.length);

    // direct rendering
    if (this.debug) {
      this.renderBranch(
        rootUl,
        tree,
        settings,
        this.performanceTracker,
        renderedNodes
      );
    } else {
      for (const child of tree.children) {
        this.renderBranch(
          rootUl,
          child,
          settings,
          this.performanceTracker,
          renderedNodes
        );
      }
    }

    // batch processing
    // if (this.debug) {
    //   this.renderBatched(
    //     rootUl,
    //     nodes,
    //     settings,
    //     this.performanceTracker,
    //     renderedNodes
    //   );
    // } else {
    //   for (const child of tree.children) {
    //     this.renderBatched(
    //       rootUl,
    //       [child],
    //       settings,
    //       this.performanceTracker,
    //       renderedNodes
    //     );
    //   }
    // }

    this.performanceTracker.stop('Tree');

    if (this.debug) {
      const logs = await this.performanceTracker.getLogs();
      const logContainer = container
        .append('div')
        .attr('class', 'performance-logs');

      for (let i = 0; i < logs.length; i++) {
        logContainer.append('p').text(logs[i]);
      }
    }
  }

  // get all tree nodes
  private getAllNodes(tree: MenuMarkers): MenuMarkers[] {
    const nodes: MenuMarkers[] = [];
    const recurse = (node: MenuMarkers) => {
      nodes.push(node);
      for (const child of node.children) {
        recurse(child);
      }
    };
    recurse(tree);
    return nodes;
  }

  // render branch + children
  private renderBranch(
    parentElement: d3.Selection<HTMLUListElement, unknown, null, undefined>,
    branch: MenuMarkers,
    settings: { usePositiveNegativeColors: boolean },
    tracker: PerformanceTracker,
    renderedNodes: Set<MenuMarkers>
  ): void {
    if (renderedNodes.has(branch)) return;
    renderedNodes.add(branch);

    const branchId = `Branch "${branch.name}"`;
    tracker.incrementBranchCount();
    tracker.start(branchId);

    // adds CSS coloring class
    let colorClass = '  default';
    if (branch.marker === 'skip') {
      colorClass = 'skipped';
    } else if (settings.usePositiveNegativeColors) {
      colorClass = branch.setValue() < 0 ? 'negative' : 'positive';
    }

    const li = parentElement.append('li').classed(colorClass, true);

    // marker area
    const markerArea = li
      .append('span')
      .attr('class', `marker-area ${branch.marker}`)
      .on('mouseenter', function () {
        d3.select(this).select('.edit-icon').style('opacity', '1');
      })
      .on('mouseleave', function () {
        if (!window.menuOpen) {
          d3.select(this).select('.edit-icon').style('opacity', '0');
        }
      })
      .on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.menuOpen = true;

        this.onMenuOpen({
          position: {
            top: (e as MouseEvent).pageY,
            left: (e as MouseEvent).pageX,
          },
          branchTarget: branch,
          branchItem: markerArea,
        });
      });

    // edit icon
    const editIcon = markerArea.append('span').attr('class', 'edit-icon');
    editIcon.html(EditIcon);

    // marker label
    const markerLabel = branch.marker !== 'none' ? `[${branch.marker}]` : '';
    const calculatedValue =
      branch.marker === 'skip' ? branch.displayValue() : branch.setValue();

    markerArea.html(`
      <span class="label">${branch.name}</span>
      <span class="value">${calculatedValue}</span>
      ${
        this.debug
          ? `<span class="debug">(${branch.displayValue()}) ${markerLabel}</span>`
          : ''
      }
    `);
    markerArea.node()?.appendChild(editIcon.node() as HTMLElement);

    // arrow toggling
    if (branch.children.length > 0) {
      const isInitiallyExpanded = true;

      const arrowArea = li
        .insert('span', ':first-child')
        .attr('class', 'arrow-area')
        .html(this.getChevronIcon(isInitiallyExpanded))
        .attr('data-expanded', isInitiallyExpanded.toString())
        .on('click', (e) => {
          e.stopPropagation();
          const childUl = li.select('ul');
          const childUlNode = childUl.node() as HTMLElement | null;
          if (childUlNode) {
            const isExpanded = arrowArea.attr('data-expanded') === 'true';
            arrowArea.html(this.getChevronIcon(!isExpanded));
            arrowArea.attr('data-expanded', (!isExpanded).toString());

            if (!isExpanded) {
              childUl
                .style('display', 'block')
                .style('overflow', 'hidden')
                .style('max-height', '0px');

              const totalHeight = `${childUlNode.scrollHeight}px`;
              childUl
                .transition()
                .duration(300)
                .style('max-height', totalHeight)
                .style('opacity', 1);
            } else {
              const totalHeight = `${childUlNode.scrollHeight}px`;
              childUl.style('max-height', totalHeight);

              childUl
                .transition()
                .duration(300)
                .style('max-height', '0px')
                .style('opacity', 0)
                .on('end', function () {
                  d3.select(this).style('display', 'none');
                });
            }
          }
        });

      const childUl = li.append('ul').style('display', 'block');

      // children rendering
      for (const child of branch.children) {
        this.renderBranch(childUl, child, settings, tracker, renderedNodes);
      }
    }

    tracker.stop(branchId);
  }

  // render in batches for huge tree
  private renderBatched(
    parentElement: d3.Selection<HTMLUListElement, unknown, null, undefined>,
    nodes: MenuMarkers[],
    settings: { usePositiveNegativeColors: boolean },
    tracker: PerformanceTracker,
    renderedNodes: Set<MenuMarkers> = new Set(),
    batchSize: number = 500,
    batchNumber: number = 1
  ): void {
    if (nodes.length === 0) {
      tracker.stop('Batch processing');
      return;
    }

    const batchLabel = `Batch ${batchNumber}`;
    tracker.incrementBatchCount();
    tracker.start(batchLabel);

    const batchNodes = nodes.slice(0, batchSize);
    const remainingNodes: MenuMarkers[] = nodes.slice(batchSize);
    // let processedCount = 0;

    for (let i = 0; i < batchNodes.length; i++) {
      const node = batchNodes[i];

      if (!renderedNodes.has(node)) {
        // console.log(`Rendering node: ${node.name} in ${batchLabel}`);
        this.renderBranch(
          parentElement,
          node,
          settings,
          tracker,
          renderedNodes
        );
        renderedNodes.add(node);

        if (node.children.length > 0) {
          remainingNodes.push(...node.children);
        }

        // processedCount++;
      }
    }

    tracker.stop(batchLabel);
    // console.log(`Finished ${batchLabel}, processed ${processedCount} nodes`);

    if (remainingNodes.length > 0) {
      setTimeout(
        () =>
          this.renderBatched(
            parentElement,
            remainingNodes,
            settings,
            tracker,
            renderedNodes,
            batchSize,
            batchNumber + 1
          ),
        0
      );
    }
  }

  // chevron icon
  private getChevronIcon(isExpanded: boolean): string {
    return isExpanded ? ChevronDown : ChevronRight;
  }

  // empty tree message
  renderEmptyTree(containerRef: HTMLDivElement | null, fileName: string): void {
    if (!containerRef) return;
    d3.select(containerRef)
      .html('')
      .append('ul')
      .attr('class', `tree ${fileName}`)
      .append('li')
      .attr('class', 'no-results')
      .text('No results found');
  }

  toggleDebug(debug: boolean): void {
    this.debug = debug;
  }
}
