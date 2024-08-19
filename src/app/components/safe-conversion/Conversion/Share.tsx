import { copyTextToClipboard } from "@/utils/clipboard";
import { useRef, useState } from "react";
import { BookmarkIcon, BookmarkSquareIcon } from "@heroicons/react/24/outline";

const Share: React.FC<{ url: string }> = ({ url }) => {
  const [isCopied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const urlRef = useRef<string>(url);
  const isUpdatedRef = useRef<boolean>(false);

  if (urlRef.current !== url) {
    urlRef.current = url;
    isUpdatedRef.current = true;
  }

  const onClickCopy = () => {
    setTimeout(() => {
      setCopied(false);
    }, 2500);
    copyTextToClipboard(url);
    setCopied(true);
    isUpdatedRef.current = false;
  };

  const buttonText = () => {
    if (isUpdatedRef.current) {
      return (
        <span>
          Share
          <span className="inline">
            <BookmarkSquareIcon className="inline pl-2" width={20} />
          </span>
        </span>
      );
    }
    if (isCopied) {
      return "Copied!";
    }
    return (
      <span>
        Share
        <span className="inline">
            <BookmarkIcon className="inline pl-2" width={20}/>
        </span>
      </span>
    );
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <div className="">
      <button
        className={`w-28 px-4 py-2  focus:outline-none focus:ring-2 text-white  ${isUpdatedRef.current ? "bg-nt84orange hover:bg-nt84orangedarker focus:ring-nt84orangedarker" : "bg-gray-400 hover:bg-gray-500 focus:ring-gray-300"}`}
        onClick={() => setShowModal(true)}
      >
        {buttonText()}
      </button>
      {showModal && (
        <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div className=" text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-xl leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
                Save this worksheet
              </h3>
              <p>
                The link to this worksheet contains all your cap table data in
                the URL. If you update it make sure to share the updated link!
              </p>
              <div className="mt-4">
                <input
                  className="flex-1 w-full px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onFocus={handleFocus}
                  onChange={() => {}}
                  value={url}
                ></input>
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-36 justify-center  border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:text-sm"
                onClick={onClickCopy}
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                className="inline-flex justify-center  border border-transparent shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowModal(false)}
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
