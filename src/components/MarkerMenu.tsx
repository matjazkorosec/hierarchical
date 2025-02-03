import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { useMemo } from 'react';
import { MenuType } from '../types';
import { debounce } from 'lodash';

export type MenuProps = {
  menuUtils: MenuType;
  onUpdate: () => void;
  onClose: () => void;
};

const MarkerMenu: React.FC<MenuProps> = ({ menuUtils, onUpdate, onClose }) => {
  const { position, branchTarget } = menuUtils;

  const isSkipChecked = useMemo(
    () => branchTarget?.marker === 'skip',
    [branchTarget]
  );
  const isInvertChecked = useMemo(
    () => branchTarget?.marker === 'invert',
    [branchTarget]
  );

  if (!branchTarget) return null;

  // defer UI update
  const debouncedUpdate = debounce(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => onUpdate());
    } else {
      setTimeout(() => onUpdate(), 0);
    }
  }, 50);

  const handleToggle = (marker: 'skip' | 'invert') => {
    if (!branchTarget) return;

    // update after the marker change
    const newMarker = branchTarget.marker === marker ? 'none' : marker;
    // console.log(`Toggled "${marker}": ${newMarker}`);
    branchTarget.setMarker(newMarker);
    debouncedUpdate();
  };

  return (
    <DropdownMenu.Root
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          window.menuOpen = false;

          const markers = document.querySelectorAll('.marker-area');
          for (let i = 0; i < markers.length; i++) {
            const marker = markers[i] as HTMLElement;
            const isStillHovered = marker.matches(':hover');

            if (!isStillHovered) {
              marker
                .querySelector('.edit-icon')
                ?.setAttribute('style', 'opacity: 0');
            }
          }

          onClose();
        }
      }}
    >
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dropdown-menu"
          style={{ top: position.top - 25, left: position.left - 25 }}
        >
          <DropdownMenu.Item className="dropdown-item">
            <label
              className="checkbox-label"
              onClick={() => handleToggle('skip')}
            >
              <Checkbox.Root checked={isSkipChecked} className="radix-checkbox">
                <Checkbox.Indicator className="checkbox-indicator">
                  <Check size={14} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span>Skip</span>
            </label>
          </DropdownMenu.Item>

          <DropdownMenu.Item className="dropdown-item">
            <label
              className="checkbox-label"
              onClick={() => handleToggle('invert')}
            >
              <Checkbox.Root
                checked={isInvertChecked}
                className="radix-checkbox"
              >
                <Checkbox.Indicator className="checkbox-indicator">
                  <Check size={14} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span>Invert</span>
            </label>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default MarkerMenu;
