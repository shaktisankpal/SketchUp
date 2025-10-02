import { useState, useLayoutEffect, useEffect, useRef } from "react";
import rough from "roughjs";
import { useAppContext } from "../../context/AppContext";

const roughGenerator = rough.generator();

const Whiteboard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  color,
  canDraw,
  roomId,
}) => {
  const { socket } = useAppContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef(null);

  // Listen for live-drawing events from other users
  useEffect(() => {
    if (!socket) return;
    const handleStartDrawing = (element) =>
      setElements((prev) => [...prev, element]);
    const handleDrawMove = (newPath) => {
      setElements((prev) => {
        const newElements = [...prev];
        // Ensure there's an element to update before trying
        if (newElements.length > 0) {
          newElements[newElements.length - 1].path = newPath;
        }
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

  // Redraw canvas when elements change
  const redrawCanvas = (canvas) => {
    const roughCanvas = rough.canvas(canvas);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      if (element.type === "pencil") {
        roughCanvas.linearPath(element.path, {
          stroke: element.stroke,
          // ✨ FIX: Increased stroke width for better visibility
          strokeWidth: 5,
          // ✨ FIX: Set roughness to 0 for a smooth, stable line
          roughness: 0,
        });
      }
    });
  };

  // Initial draw and resize handler setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      const { width, height } = entry.contentRect;
      canvas.width = width;
      canvas.height = height;
      redrawCanvas(canvas);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [elements]); // Rerun if elements change to redraw correctly

  // We use useLayoutEffect to draw immediately after DOM mutations
  useLayoutEffect(() => {
    if (canvasRef.current) {
      redrawCanvas(canvasRef.current);
    }
  });

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (!canDraw) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const newElement = {
      type: "pencil",
      offsetX,
      offsetY,
      path: [[offsetX, offsetY]],
      stroke: color,
    };
    setElements((prev) => [...prev, newElement]);
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
      lastElement.path = [...lastElement.path, [offsetX, offsetY]];
      updatedPath = lastElement.path;
      return newElements;
    });
    if (updatedPath) {
      socket.emit("drawMove", { roomId, newPath: updatedPath });
    }
  };

  const handleMouseUp = () => {
    if (!canDraw) return;
    setIsDrawing(false);
    // Send the final state to be saved in DB
    socket.emit("whiteboardData", { roomId, elements });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`w-full h-full overflow-hidden bg-white rounded-lg ${
        !canDraw ? "cursor-not-allowed" : "cursor-crosshair"
      }`}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Whiteboard;
