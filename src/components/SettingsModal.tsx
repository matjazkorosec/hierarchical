import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import { X, Check } from 'lucide-react';
import { useEffect, useRef, useState, useDeferredValue } from 'react';
import {
  FONT_FAMILIES,
  DEFAULT_SETTINGS,
  getStoredSettings,
  applyStyles,
} from '../utils/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySettings: (
    settings: typeof DEFAULT_SETTINGS,
    hasChanges: boolean
  ) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onApplySettings,
}: SettingsModalProps) {
  const [tempSettings, setTempSettings] = useState(getStoredSettings);
  const [appliedSettings, setAppliedSettings] = useState(getStoredSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const deferredSettings = useDeferredValue(tempSettings);

  const settingsRef = useRef(tempSettings);
  const isApplyingStyles = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // defer heavy operations to prevent blocking UI
      setTimeout(() => {
        setTempSettings(appliedSettings);
        setAppliedSettings(appliedSettings);
        settingsRef.current = appliedSettings;
        setHasChanges(false);
        applyStyles(appliedSettings);
      }, 0);
    }
  }, [isOpen, appliedSettings]);

  // update temps settings & apply styles
  const updateTempSettings = (newSettings: typeof DEFAULT_SETTINGS) => {
    settingsRef.current = newSettings;
    setTempSettings({ ...newSettings });

    // Check for changes compared to applied settings
    setHasChanges(
      JSON.stringify(newSettings) !== JSON.stringify(appliedSettings)
    );

    if (!isApplyingStyles.current) {
      isApplyingStyles.current = true;
      setTimeout(() => {
        applyStyles(newSettings);
        isApplyingStyles.current = false;
      }, 0);
    }
  };

  // save button
  const applySettings = () => {
    if (hasChanges) {
      localStorage.setItem('treeSettings', JSON.stringify(tempSettings));
      setAppliedSettings(tempSettings);
      onApplySettings(tempSettings, true);
    }
    onClose();
  };

  // close and reset to saved
  const handleClose = () => {
    setTempSettings(appliedSettings);
    settingsRef.current = appliedSettings;
    applyStyles(appliedSettings);
    setHasChanges(false);
    onClose();
  };

  // reset button
  const resetToDefault = () => {
    const defaultSettings = DEFAULT_SETTINGS;
    setTempSettings(defaultSettings);
    settingsRef.current = defaultSettings;
    applyStyles(defaultSettings);
    setHasChanges(true);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">Tree settings</Dialog.Title>
          <Dialog.Description className="dialog-description">
            Customize tree appearance
          </Dialog.Description>

          <ul className="tree-settings">
            {/* Font size */}
            <li>
              <label>
                <span className="text">Font size:</span>
                <input
                  type="number"
                  value={parseInt(deferredSettings.fontSize)}
                  onChange={(e) =>
                    updateTempSettings({
                      ...tempSettings,
                      fontSize: `${e.target.value}px`,
                    })
                  }
                  min={11}
                  max={20}
                />
              </label>
            </li>

            {/* Font family */}
            <li>
              <label>
                <span className="text">Font family:</span>
                <select
                  value={
                    FONT_FAMILIES.find(
                      (f) => f.stack === deferredSettings.fontFamily
                    )?.name || FONT_FAMILIES[0].name
                  }
                  onChange={(event) => {
                    const selectedFont = FONT_FAMILIES.find(
                      (f) => f.name === event.target.value
                    );
                    updateTempSettings({
                      ...tempSettings,
                      fontFamily: selectedFont?.stack || FONT_FAMILIES[0].stack,
                    });
                  }}
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </label>
            </li>

            {/* Use Positive/Negative colors */}
            <li className="has-checkbox">
              <label className="checkbox-label">
                <Checkbox.Root
                  checked={deferredSettings.usePositiveNegativeColors}
                  onCheckedChange={(checked) => {
                    const updatedSettings = {
                      ...tempSettings,
                      usePositiveNegativeColors: checked as boolean,
                    };
                    updateTempSettings(updatedSettings);
                    applyStyles(updatedSettings);
                    onApplySettings(updatedSettings, false);
                  }}
                  className="radix-checkbox"
                >
                  <Checkbox.Indicator className="checkbox-indicator">
                    <Check size={14} />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span className="text">Use Positive/Negative colors</span>
              </label>
            </li>

            {/* Color pickers */}
            {[
              {
                key: 'defaultColor',
                label: 'Default color',
                disabled: deferredSettings.usePositiveNegativeColors,
              },
              {
                key: 'positiveColor',
                label: 'Positive color',
                disabled: !deferredSettings.usePositiveNegativeColors,
              },
              {
                key: 'negativeColor',
                label: 'Negative color',
                disabled: !deferredSettings.usePositiveNegativeColors,
              },
              { key: 'skippedColor', label: 'Skipped color', disabled: false },
              { key: 'debugColor', label: 'Debug color', disabled: false },
            ].map(({ key, label, disabled }) => (
              <li key={key} className={disabled ? 'option-disabled' : ''}>
                <label>
                  <span className="text">{label}:</span>
                  <input
                    type="color"
                    value={deferredSettings[key]}
                    onChange={(e) =>
                      updateTempSettings({
                        ...tempSettings,
                        [key]: e.target.value,
                      })
                    }
                    disabled={disabled}
                  />
                </label>
              </li>
            ))}
          </ul>

          {/* Buttons */}
          <div className="dialog-buttons">
            <button onClick={resetToDefault} className="reset-button">
              Reset
            </button>
            <button onClick={applySettings} className="save-button">
              Save
            </button>
          </div>

          <Dialog.Close asChild>
            <button className="close-button">
              <X size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
