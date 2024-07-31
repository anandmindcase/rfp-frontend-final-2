import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { useQuestionStore } from "~/utils/store/questionStore";
import { ChunkDisplay } from "./ChunkDisplay"; // Corrected import
import { backendClient } from "~/api/backend";
import { Textarea } from "../ui/textarea";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid"; // Import Heroicons
import { PdfData } from "~/pages/documents";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider"; // Import the updated Slider component correctly

const AccordionComponent = () => {
  const queries = useQuestionStore((state) => state.queries);
  const responses = useQuestionStore((state) => state.responses);
  const setActiveQuery = useQuestionStore((state) => state.setActiveQuery);
  const activeQuery = useQuestionStore((state) => state.activeQuery);
  const apiResponse = useQuestionStore((state) => state.apiResponse);
  const changeResponse = useQuestionStore((state) => state.changeResponse);
  const changeQueryatIndex = useQuestionStore((state) => state.changeQueryatIndex);
  const changeApiResponse = useQuestionStore((state) => state.changeApiResponse);

  const [isEditing, setIsEditing] = useState(false);
  const [indexWithEditQuestion, setIndexWithEditQuestion] = useState(-1);
  const [editableResponse, setEditableResponse] = useState("");
  const [editableQuestion, setEditableQuestion] = useState("");
  const setActiveChunk = useQuestionStore((state) => state.setActiveChunk);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuesHovered, setIsQuesHovered] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false); // New state for response edit mode
  const emptyResponseAtIndex = useQuestionStore((state) => state.emptyResponseAtIndex);
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number | null>(null);

  useEffect(() => {
    const initialScores = queries.map((_, index) =>
      apiResponse[index]?.confidence_score || 80
    );
    setScores(initialScores);
  }, [queries, apiResponse]);

  const handleScoreChange = (index: number, newScore: number) => {
    setScores((prevScores) => {
      const newScores = [...prevScores];
      newScores[index] = newScore;
      return newScores;
    });
  };

  const handleSaveResponse = async (): Promise<void> => {
    if (queries[activeQuery] && editableResponse !== "") {
      try {
        await backendClient.saveQna(
          "/save-qna/",
          queries[activeQuery] || "",
          editableResponse
        );
        setIsEditing(false);
        setIsEditingResponse(false);
        setIsHovered(false);
      } catch (e) {
        console.log("error saving response", e);
      }
    }
  };

  const handleQueryWithScore = async (index: number): Promise<void> => {
    if (queries[index]) {
      try {
        setLoading(true);
        const res = await backendClient.fetchQueryWithScore(
          "/processquery/",
          queries[index] || "",
          scores[index] || 80
        );
        if (res) {
          const apiRes = {
            reponseMessage: res.message,
            confidence_score: scores[index],
            chunks: res.Chunks,
            files: res.pdf_data.map((data: PdfData) => {
              return({
              id: data.pdf_name,
              filename: data.pdf_name,
              url: data.url,
              type: data.type,
            })}),
          };
          changeApiResponse(index, apiRes);
          changeResponse(index, res.message);
        }
      } catch (e) {
        console.log("error saving response", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQueryWithQuesChange = async (index: number): Promise<void> => {
    changeQueryatIndex(index, editableQuestion);
    emptyResponseAtIndex(index);
    setIndexWithEditQuestion(-1);

    try {
      setLoading(true);
      const res = await backendClient.fetchQueryWithScore(
        "/processquery/",
        editableQuestion || "",
        scores[index] || 80
      );
      if (res) {
        const apiRes = {
          reponseMessage: res.message,
          confidence_score: scores[index],
          chunks: res.Chunks,
          files: res.pdf_data.map((data: PdfData) => {
            return ({
            id: data.pdf_name,
            filename: data.pdf_name,
            url: data.url,
            type: data.type,
          })}),
        };
        changeApiResponse(index, apiRes);
        changeResponse(index, res.message);
      }
    } catch (e) {
      console.log("error saving response", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setIsEditingResponse(false);
    setIsHovered(false);
    setIndexWithEditQuestion(-1);
  };

  // New function for search icon click
  const handleSearchIconClick = async () => {
    if (queries[activeQuery]) {
      try {
        setLoading(true);
        const res = await backendClient.fetchQueryWithScore(
          "/processquery/",
          queries[activeQuery] || "",
          scores[activeQuery] ?? 80
        );
        if (res) {
          const apiRes = {
            reponseMessage: res.message,
            confidence_score: scores[activeQuery],
            chunks: res.Chunks,
            files: res.pdf_data.map((data: PdfData) => {
              return({
              id: data.pdf_name,
              filename: data.pdf_name,
              url: data.url,
              type: data.type,
            })}),
          };
          changeApiResponse(activeQuery, apiRes);
          changeResponse(activeQuery, res.message);
        }
      } catch (e) {
        console.log("error saving response", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChunkClick = (chunkIndex: number) => {
    setActiveChunkIndex(chunkIndex);
    const chunk = apiResponse[activeQuery]?.chunks[chunkIndex]?.chunk;
    setActiveChunk(chunk || "");
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="flex flex-col gap-y-1"
      defaultValue={`item-0`}
    >
      {queries.map((query, i) => (
        <AccordionItem
          value={`item-${i}`}
          className={
            responses[i] ? "bg-gray-50 text-left" : "bg-gray-50 text-left"
          }
          key={i}
        >
          <AccordionTrigger
            className={responses[i] ? "p-[10px] text-left" : "p-[10px] text-left"}
            onMouseEnter={() => {
              if (activeQuery === i) {
                setIsQuesHovered(true);
              }
            }}
            onMouseLeave={() => setIsQuesHovered(false)}
            onClick={() => {
              if (indexWithEditQuestion === -1) {
                setActiveQuery(i);
                setActiveChunk(apiResponse[i]?.chunks[0]?.chunk || "");
              }
            }}
          >
            {indexWithEditQuestion === i ? (
              <div className="flex justify-between relative w-full">
                <Input
                  className="flex-grow"
                  value={editableQuestion}
                  onChange={(e) => setEditableQuestion(e.target.value)}
                />
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white flex items-center justify-center">
                  <PaperAirplaneIcon
                    onClick={() => {
                      handleQueryWithQuesChange(i).catch((error) => {
                        console.error("Failed to save response", error);
                      });
                    }}
                    className="h-5 w-5 bg-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-between relative w-full">
                <h1 className="flex-grow text-left">{query}</h1>
                {isQuesHovered && activeQuery === i && (
                  <div
                    className="absolute right-0 top-[2px] hover:cursor-pointer z-20"
                    onClick={() => {
                      setIndexWithEditQuestion(i);
                      setEditableQuestion(query || "");
                    }}
                  >
                    <PencilSquareIcon className="h-5 w-5 bg-transparent" />
                  </div>
                )}
              </div>
            )}
          </AccordionTrigger>
          <AccordionContent className="mb-1 bg-white p-[10px] text-gray-700 rounded-md border shadow-md">
            {!loading ? (
              <>
                {responses[i] ? (
                  <>
                    {!isEditing ? (
                      <>
                        <div
                          className="relative flex w-full rounded-xl border bg-slate-100"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          <ReactMarkdown className="p-2 flex-grow">
                            {responses[i]}
                          </ReactMarkdown>
                          {isHovered && (
                            <div
                              className="absolute right-[8px] bottom-[8px] hover:cursor-pointer z-20"
                              onClick={() => {
                                setIsEditing(true);
                                setEditableResponse(responses[i] || "");
                                setIsEditingResponse(true); // Show the check and cross icons
                              }}
                            >
                              <PencilSquareIcon className="h-5 w-5 bg-transparent" />
                            </div>
                          )}
                          {isEditingResponse && (
                            <div className="absolute bottom-[8px] right-[8px] flex gap-x-1">
                              <CheckCircleIcon
                                onClick={() => {
                                  changeResponse(activeQuery, editableResponse);
                                  handleSaveResponse().catch((error) => {
                                    console.error("Failed to save response", error);
                                  });
                                  setIsEditingResponse(false); // Hide the check and cross icons
                                }}
                                className="h-5 w-5 hover:cursor-pointer bg-transparent"
                              />
                              <XCircleIcon
                                onClick={handleCancelEditing}
                                className="h-5 w-5 hover:cursor-pointer bg-transparent"
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 mb-12 flex justify-between items-center w-full"> {/* Updated for Slider and Icon */}
                          <Slider
                            value={[scores[i] ?? 80]} // Ensure each value is of type `number`
                            max={100}
                            step={1}
                            onValueChange={(value) => handleScoreChange(i, value[0] || 50)}
                            displayValue={scores[i]} // Add this prop to display the current score
                            className="w-11/12" // Set the width of the slider to 90%
                          />
                          <PaperAirplaneIcon
                            onClick={() => { void handleSearchIconClick(); }} // Reuse the search icon click handler inside a function
                            className="h-5 w-5 bg-transparent ml-4" // Center the icon vertically and add margin
                          />
                        </div>
                      </>
                    ) :
                      <div className="relative w-full">
                        <Textarea
                          className="w-full p-2 h-40" // Increase the height of the Textarea
                          value={editableResponse}
                          onChange={(e) => setEditableResponse(e.target.value)}
                          onFocus={(e) => e.target.classList.add("no-focus-outline")}
                          onBlur={(e) => e.target.classList.remove("no-focus-outline")}
                        />
                        <div className="absolute bottom-[8px] right-[8px] flex gap-x-1"> {/* Move to the bottom right */}
                          <CheckCircleIcon
                            onClick={() => {
                              changeResponse(activeQuery, editableResponse);
                              handleSaveResponse().catch((error) => {
                                console.error("Failed to save response", error);
                              });
                              setIsEditingResponse(false); // Hide the check and cross icons
                            }}
                            className="h-5 w-5 hover:cursor-pointer bg-transparent"
                          />
                          <XCircleIcon
                            onClick={handleCancelEditing}
                            className="h-5 w-5 hover:cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>
                    }
                  </>
                ) : (
                  <div className="flex w-full items-center justify-center">
                    <h1 className="text-[14px] font-medium text-gray-700">
                      Loading...
                    </h1>
                  </div>
                )}
              </>
            ) : (
              <div className="flex w-full items-center justify-center">
                <h1 className="text-[14px] font-medium text-gray-700">
                  Loading...
                </h1>
              </div>
            )}
            <ChunkDisplay/>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionComponent;
