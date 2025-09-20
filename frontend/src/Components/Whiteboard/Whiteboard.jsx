import { useState, useLayoutEffect, useEffect } from "react";
import rough from "roughjs";
import { useAppContext } from "../../context/AppContext";

const roughGenerator = rough.generator();

const Whiteboard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  canDraw,
  roomId,
}) => {
  const { socket } = useAppContext();
  const [isDrawing, setIsDrawing] = useState(false);

  // ✨ NEW: Listeners for the live-drawing channel
  useEffect(() => {
    // This runs when another user starts drawing a new line
    const handleStartDrawing = (element) => {
      setElements((prev) => [...prev, element]);
    };

    // This runs when another user is actively drawing their line
    const handleDrawMove = (newPath) => {
      setElements((prev) => {
        const newElements = [...prev];
        // Update the path of the last element being drawn
        newElements[newElements.length - 1].path = newPath;
        return newElements;
      });
    };

    socket.on("startDrawing", handleStartDrawing);
    socket.on("drawMove", handleDrawMove);

    return () => {
      socket.off("startDrawing", handleStartDrawing);
      socket.off("drawMove", handleDrawMove);
    };
  }, [socket, setElements]);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctxRef.current = ctx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const roughCanvas = rough.canvas(canvas);
      elements.forEach((element) => {
        if (element.type === "pencil") {
          roughCanvas.linearPath(element.path, {
            stroke: element.stroke,
            strokeWidth: 5,
            roughness: 0,
          });
        }
      });
    }
  }, [elements, color, canvasRef, ctxRef]);

  const handleMouseDown = (e) => {
    if (!canDraw) return;
    const { offsetX, offsetY } = e.nativeEvent;

    // Create the new element and update local state immediately
    const newElement = {
      type: "pencil",
      offsetX,
      offsetY,
      path: [[offsetX, offsetY]],
      stroke: color,
    };
    setElements((prev) => [...prev, newElement]);

    // ✨ EMIT: Tell other clients a new line has started
    socket.emit("startDrawing", { roomId, element: newElement });

    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!canDraw || !isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    let updatedPath;
    setElements((prev) => {
      const newElements = [...prev];
      const lastElement = newElements[newElements.length - 1];
      // Append the new point to the path
      lastElement.path = [...lastElement.path, [offsetX, offsetY]];
      updatedPath = lastElement.path;
      return newElements;
    });

    // ✨ EMIT: Broadcast the updated path to other clients
    if (updatedPath) {
      socket.emit("drawMove", { roomId, newPath: updatedPath });
    }
  };

  const handleMouseUp = () => {
    if (!canDraw) return;
    setIsDrawing(false);

    // ✨ EMIT: Send the final, complete drawing data to be saved in the database
    socket.emit("whiteboardData", { roomId, elements });
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`border border-black dark:border-gray-600 w-full h-full overflow-hidden rounded-md bg-white ${
        !canDraw ? "cursor-not-allowed" : "cursor-crosshair"
      }`}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Whiteboard;
