import type { CSSProperties } from "react";
import React, { useCallback, useState, useEffect, useRef, forwardRef, memo } from "react";
import { VariableSizeList as List } from "react-window";
import { useWindowWidth, useWindowHeight } from "@wojtekmaj/react-hooks";
import { useInView } from "react-intersection-observer";
import debounce from "lodash.debounce";
import {
  HORIZONTAL_GUTTER_SIZE_PX,
  OBSERVER_THRESHOLD_PERCENTAGE,
  PAGE_HEIGHT,
  PDF_HEADER_SIZE_PX,
  PDF_SIDEBAR_SIZE_PX,
  PDF_WIDTH_PERCENTAGE,
  VERTICAL_GUTTER_SIZE_PX,
} from "~/components/pdf-viewer/pdfDisplayConstants";
import type { SecDocument as PdfDocument } from "~/types/document";
import { useQuestionStore } from "~/utils/store/questionStore";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { usePdfFocus } from "~/context/pdf";
import { multiHighlight } from "~/utils/multi-line-highlight";
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;


// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const pdfjsOptions = pdfjs.GlobalWorkerOptions;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const pdfjsVersion = pdfjs.version;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
pdfjsOptions.workerSrc =
  "//unpkg.com/pdfjs-dist@" +
  String(pdfjsVersion) +
  "/legacy/build/pdf.worker.min.js";


interface PageType {
  getViewport: (arg0: { scale: number }) => { width: number };
}
interface PdfType {
  numPages: number;
  getPage: (val: number) => Promise<PageType>;
}

interface PageRenderer {
  file: PdfDocument;
  pageNumber: number;
  style: CSSProperties;
  scale: number;
  listWidth: number;
  setPageInView: (n: number) => void;
}
const PageRenderer: React.FC<PageRenderer> = ({
  file,
  pageNumber,
  style,
  scale,
  listWidth,
  setPageInView,
}) => {
  const { pdfFocusState } = usePdfFocus();
  const [shouldCenter, setShouldCenter] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const { ref: inViewRef, inView } = useInView({
    threshold: OBSERVER_THRESHOLD_PERCENTAGE * Math.min(1 / scale, 1),
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null | undefined) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node as HTMLDivElement | null;
      inViewRef(node);
    },
    [inViewRef]
  );

  useEffect(() => {
    if (inView) {
      setPageInView(pageNumber);
    }
  }, [inView, pageNumber, setPageInView, inViewRef]);

  const hidePageCanvas = useCallback(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) canvas.style.visibility = "hidden";
    }
  }, [containerRef]);

  const showPageCanvas = useCallback(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) canvas.style.visibility = "visible";
    }
  }, [containerRef]);

  const onPageLoadSuccess = useCallback(() => {
    hidePageCanvas();
  }, [hidePageCanvas]);

  const onPageRenderError = useCallback(() => {
    showPageCanvas();
  }, [showPageCanvas]);

  const onPageRenderSuccess = useCallback(
    (page: { width: number }) => {
      showPageCanvas();
      maybeHighlight();
      if (listWidth > page.width) {
        setShouldCenter(true);
      } else {
        setShouldCenter(false);
      }
    },
    [showPageCanvas, listWidth]
  );

  const documentFocused = pdfFocusState.documentId === file.id;

  useEffect(() => {
    maybeHighlight();
  }, [documentFocused, inView]);

  const maybeHighlight = useCallback(
    debounce(() => {
      if (
        documentFocused &&
        pdfFocusState.citation?.pageNumber === pageNumber + 1
      ) {
        multiHighlight(
          pdfFocusState.citation?.snippet,
          pageNumber,
          "yellow"
        );
        setIsHighlighted(true);
      }
    }, 500),
    [pdfFocusState.citation?.snippet, pageNumber, documentFocused]
  );

  return (
    <div
      key={`${file.id}-${pageNumber}`}
      ref={setRefs}
      style={{
        ...style,
        padding: "10px",
        backgroundColor: "WhiteSmoke",
        display: `${shouldCenter ? "flex" : ""}`,
        justifyContent: "center",
      }}
    >
      <Page
        scale={scale}
        onRenderSuccess={onPageRenderSuccess}
        onLoadSuccess={onPageLoadSuccess}
        onRenderError={onPageRenderError}
        pageIndex={pageNumber}
        renderAnnotationLayer
      />
    </div>
  );
};

interface VirtualizedPDFProps {
  file: PdfDocument;
  scale: number;
  setIndex: (n: number) => void;
  setScaleFit: (n: number) => void;
  setNumPages: (n: number) => void;
  type: string;
}
export interface PdfFocusHandler {
  scrollToPage: (page: number) => void;
}

const VirtualizedPDF = forwardRef<PdfFocusHandler, VirtualizedPDFProps>(
  ({ file, scale, setIndex, setScaleFit, setNumPages, type }, ref) => {
    const { setPdfFocusState } = usePdfFocus();
    const { apiResponse, activeQuery, activeChunkIndex } = useQuestionStore();
    const [loading, setLoading] = useState(true);

    const windowWidth = useWindowWidth();
    const windowHeight = useWindowHeight();
    const height = (windowHeight || 0) - PDF_HEADER_SIZE_PX;
    const newWidthPx =
      PDF_WIDTH_PERCENTAGE * 0.01 * (windowWidth || 0) -
      PDF_SIDEBAR_SIZE_PX -
      HORIZONTAL_GUTTER_SIZE_PX;

    const [pdf, setPdf] = useState<PdfType | null>(null);
    const listRef = useRef<List>(null);

    useEffect(() => {
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
      }
    }, [scale]);

    function onDocumentLoadSuccess(nextPdf: PdfType) {
      setPdf(nextPdf);
    }
    function getPageHeight(): number {
      const actualHeight = (PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) * scale;
      return actualHeight;
    }
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!pdf) {
        return;
      }
      async function loadFirstPage() {
        if (pdf) {
          await pdf
            .getPage(1)
            .then(
              (page: {
                getViewport: (arg0: { scale: number }) => { width: number };
              }) => {
                const pageViewport = page.getViewport({ scale: 1 });
                const pageWidth = pageViewport.width;
                const computedScaleFit = newWidthPx / pageWidth;
                setScaleFit(computedScaleFit);
              }
            );
        }
      }
      loadFirstPage().catch(() => console.log("page load error"));
      setNumPages(pdf.numPages);
    }, [pdf, setNumPages, setScaleFit, newWidthPx]);

    React.useImperativeHandle(ref, () => ({
      scrollToPage: (page: number) => {
        onItemClick({ pageNumber: page });
      },
    }));

    const onItemClick = ({ pageNumber: itemPageNumber }: { pageNumber: number }) => {
      const fixedPosition =
        itemPageNumber * (PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) * scale;
      if (listRef.current) {
        listRef.current.scrollTo(fixedPosition);
      }
    };

    useEffect(() => {
      if (activeChunkIndex !== null) {
        const chunk = apiResponse[activeQuery]?.chunks[activeChunkIndex];
        if (chunk) {
          onItemClick({ pageNumber: chunk.pageno - 1 });
          const citation = {
            documentId: file.id,
            snippet: chunk.chunk,
            pageNumber: chunk.pageno,
            highlightColor: "yellow",
          };
          setPdfFocusState({ documentId: file.id, pageNumber: chunk.pageno, citation });
        }
      }
    }, [activeChunkIndex, apiResponse, activeQuery, file.id, setPdfFocusState]);

    const loadingDiv = () => {
      return (
        <div className={`flex h-[calc(100vh-44px)] w-[56vw] items-center justify-center`}>
          Loading
        </div>
      );
    };

    return (
      <div>
        <div className={`border-gray-pdf bg-gray-pdf relative h-[calc(100vh-44px)] w-full`}>
          {type === "pdf" ? (
            <Document
              key={file.filename}
              file={file.url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={loadingDiv}
            >
              {pdf ? (
                <List
                  ref={listRef}
                  width={newWidthPx + HORIZONTAL_GUTTER_SIZE_PX}
                  height={height}
                  itemCount={pdf.numPages}
                  itemSize={getPageHeight}
                  estimatedItemSize={(PAGE_HEIGHT + VERTICAL_GUTTER_SIZE_PX) * scale}
                >
                  {({ index, style }) => (
                    <PageRenderer
                      file={file}
                      key={`page-${index}`}
                      pageNumber={index}
                      style={style}
                      scale={scale}
                      listWidth={newWidthPx}
                      setPageInView={setIndex}
                    />
                  )}
                </List>
              ) : null}
            </Document>
          ) : (
            <div className="px-4 py-4 overflow-y-scroll h-[90%]">
              <p className="text-[14px]">no pdf file</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const MemoizedVirtualizedPDF = memo(VirtualizedPDF);

MemoizedVirtualizedPDF.displayName = "VirtualizedPDF";

export default MemoizedVirtualizedPDF;
