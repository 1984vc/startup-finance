import { copyTextToClipboard } from '@/utils/clipboard';
import { compressState, decompressState } from '@/utils/stateCompression';
import { useState } from 'react';

const Share: React.FC<{url:string, state: any}> = ({
    url,
    state
}) => {

    let hash: string | undefined = undefined;
    const [showShare, setShowShare] = useState(false);
    if (showShare) {
        hash = compressState(state);
    }
    const shareUrl = `${url}#${hash}`;

  return (
    <div className="flex items-center space-x-4 mb-4">
      <button
        className={`w-24 px-4 py-2 rounded-md focus:outline-none focus:ring-2`}
        onClick={() => setShowShare(!showShare)}
      >
        Share
      </button>
      {showShare && (
        <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Share this worksheet
              </h3>
              <div className="mt-2">
                <p>{hash}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => copyTextToClipboard(shareUrl)}
              >
                Copy
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowShare(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Share;
