// represents a tree node in a hierarchical data structure
export class MenuMarkers {
  name: string;
  value: number;
  children: MenuMarkers[] = [];
  marker: 'none' | 'invert' | 'skip' = 'none';
  parent: MenuMarkers | null = null;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  // set node value based on marker settings
  setValue(): number {
    if (this.marker === 'skip') return 0;

    let childSum = 0;
    for (const child of this.children) {
      childSum += child.setValue();
    }
    const totalValue = this.children.length > 0 ? childSum : this.value;

    return this.marker === 'invert'
      ? -Math.abs(Number(totalValue.toFixed(4)))
      : Number(totalValue.toFixed(4));
  }

  displayValue(): string {
    return this.value.toFixed(1);
  }

  // add marker to node and all children
  setMarker(marker: 'none' | 'invert' | 'skip') {
    this.marker = marker;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].setMarker(marker);
    }

    this.updateMarker();
  }

  // updates marker based on child markers
  updateMarker() {
    this.setValue();

    if (this.children.length > 0) {
      const allSkipped = this.children.every(
        (child) => child.marker === 'skip'
      );
      const allInverted = this.children.every(
        (child) => child.marker === 'invert'
      );

      if (allSkipped && this.marker !== 'skip') {
        this.marker = 'skip';
      } else if (allInverted && this.marker !== 'invert') {
        this.marker = 'invert';
      } else if (!allSkipped && !allInverted) {
        this.marker = 'none';
      }
    }

    if (this.parent) {
      this.parent.updateMarker();
    }
  }
}
