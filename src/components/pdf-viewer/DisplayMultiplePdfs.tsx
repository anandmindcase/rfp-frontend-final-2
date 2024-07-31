import { ViewPdf } from "~/components/pdf-viewer/ViewPdf";
import { useMultiplePdfs } from "../../hooks/useMultiplePdfs";
import { SecDocument } from "~/types/document";
import cx from "classnames";

interface DisplayMultiplePdfsProps {
  fileUrls: SecDocument[];
}

export const DisplayMultiplePdfs: React.FC<DisplayMultiplePdfsProps> = ({ fileUrls }) => {
  const { isActivePdf, handlePdfFocus } = useMultiplePdfs(fileUrls);

  return (
    <div className="flex h-full items-start justify-center">
      {fileUrls.map((file) => (
        <div
          key={`viewing-${file.url}`}
          className={cx({ hidden: !isActivePdf(file) })}
        >
          <ViewPdf file={file} />
        </div>
      ))}
      <div className="flex h-full w-[80px] flex-col">
        <div className="flex h-[43px] w-[80px] items-center justify-center border-b border-l font-bold text-gray-90"></div>
        {fileUrls.map((file, index) => (
          <div key={index}>
            <button
              onClick={() => handlePdfFocus(file)}
              className={`group flex h-[80px] w-[80px] items-end overflow-hidden justify-start border px-2 py-1 font-nunito text-sm font-bold ${isActivePdf(file)
                ? "border-l-0 bg-gray-pdf"
                : "bg-white font-light text-gray-60"
                }`}
            >
              <div
                className={`flex flex-col items-start justify-start ${!isActivePdf(file)
                  ? "group-hover:border-l-4 group-hover:pl-1 group-hover:font-bold group-hover:text-gray-90"
                  : ""
                  }`}
              >
                <div className="text-left text-[11px] line-clamp-1 overflow-hidden">
                  {file.filename}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayMultiplePdfs;
