import { useState } from "react";
import { usePdfFocus } from "~/context/pdf";
import { Citation } from "~/types/conversation";
import { useQuestionStore } from "~/utils/store/questionStore";

export const ChunkDisplay = () => {
  const { setPdfFocusState } = usePdfFocus();
  const apiResponse = useQuestionStore((state) => state.apiResponse);
  const activeQuery = useQuestionStore((state) => state.activeQuery);
  const activeChunk = useQuestionStore((state) => state.activeChunk);
  const setActiveChunk = useQuestionStore((state) => state.setActiveChunk);
  const activeChunkIndex = useQuestionStore((state) => state.activeChunkIndex);
  const setActiveChunkIndex = useQuestionStore((state) => state.setActiveChunkIndex);

  const handleCitationClick = (
    documentId: string,
    pageNumber: number,
    citation: Citation
  ) => {
    setPdfFocusState({ documentId, pageNumber, citation });
  };

  const handleChunkClick = (
    documentId: string,
    pageNumber: number,
    chunk: string,
    pdfName: string,
    i: number
  ) => {
    if (activeChunk === chunk && activeChunkIndex === i) {
      return; // Do nothing if the clicked chunk is already active
    }

    const citation: Citation = {
      documentId: pdfName,
      snippet: chunk,
      pageNumber: pageNumber,
      highlightColor: "yellow",
    };

    setActiveChunkIndex(i);
    setActiveChunk(chunk);
    handleCitationClick(documentId, pageNumber, citation);
  };

  return (
    <div className="mt-1 flex gap-x-2 overflow-auto">
      {apiResponse[activeQuery] &&
        apiResponse[activeQuery]?.chunks.map((d, i) => (
          <div
            key={i}
            onClick={() =>
              handleChunkClick(
                d.pdfName || "",
                d.pageno,
                d.chunk,
                d.pdfName || "",
                i
              )
            }
            className={`line-clamp-2 w-full border bg-gray-50 p-2 text-[12px] text-gray-700 hover:cursor-pointer hover:bg-slate-200 ${
              activeChunkIndex === i ? 'bg-slate-300' : ''
            }`}
            style={{ borderRadius: 0, margin: 0 }}
          >
            <p className="border-l-4 border-gray-700 pl-1">{d.chunk}</p>
          </div>
        ))}
    </div>
  );
};