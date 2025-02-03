import { Dispatch, SetStateAction } from 'react';
import { dataFiles, DataFileKey } from '../utils/constants';

interface FileSelectorProps {
  selectedFile: DataFileKey;
  setSelectedFile: Dispatch<SetStateAction<DataFileKey>>;
  setLoading: (loading: boolean) => void;
  disabled: boolean;
}

export default function FileSelector({
  selectedFile,
  setSelectedFile,
  setLoading,
  disabled,
}: FileSelectorProps) {
  return (
    <div className="select-data">
      <label>
        Select data:
        <div className="select-wrapper">
          <select
            value={selectedFile}
            onChange={(e) => {
              const newFile = e.target.value as DataFileKey;
              if (newFile !== selectedFile) {
                setLoading(true);
                console.log('Loading file: ', selectedFile);
                setSelectedFile(newFile);
              }
            }}
            disabled={disabled}
          >
            {Object.keys(dataFiles).map((file) => (
              <option key={file} value={file}>
                {file.replace('.json', '').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </label>
    </div>
  );
}
