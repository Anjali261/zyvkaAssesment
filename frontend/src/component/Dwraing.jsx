
import React, { useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Group } from 'react-konva';

const Drawing = () => {
  const [drawings, setDrawings] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedDrawingIndex, setSelectedDrawingIndex] = useState(null);
  const [isAnnotationVisible, setIsAnnotationVisible] = useState(true);
  const [isResizing, setIsResizing] = useState(false);


  const API_BASE_URL = 'http://localhost:4000/api';

  const saveDrawingToDatabase = async (newDrawing) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drawings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDrawing),
      });

      if (!response.ok) {
        throw new Error('Failed to save drawing to the database.');
      }

      const result = await response.json();
      setDrawings((prevDrawings) => [...prevDrawings, result]);
    } catch (error) {
      console.error('Error saving drawing:', error.message);
    }
  };


  const handleResize = (event, index) => {
    if (!isResizing) {
      setIsResizing(true);
      return;
    }

    const stage = event.target.getStage();
    const pointerPos = stage.getPointerPosition();

    setDrawings((prevDrawings) => {
      const newDrawings = [...prevDrawings];
      const drawing = newDrawings[index];

      // Calculate new dimensions based on the difference between the current pointer position
      // and the initial position where the resize started
      drawing.dimensions.length = pointerPos.x - drawing.coordinates.x;
      drawing.dimensions.breadth = pointerPos.y - drawing.coordinates.y;

      updateDatabase(index, drawing);

      return newDrawings;
    });

    setIsResizing(false);
  };

  const handleToggleResize = () => {
    setIsResizing(!isResizing);
  };
 
  const updateDatabase = async (index, updatedDrawing) => {
    try {
        const response = await fetch(`http://localhost:4000/api/drawings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedDrawing),
        });

        if (!response.ok) {
            throw new Error('Failed to update drawing in the database.');
        }

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error updating drawing:', error.message);
    }
};

 

  const handleDraw = (event) => {
    // Check if resizing is in progress
    if (isResizing) {
      return;
    }
  
    const stage = event.target.getStage();
  
    const existingShape = drawings.find(
      (drawing) =>
        stage.getPointerPosition().x >= drawing.coordinates.x &&
        stage.getPointerPosition().x <= drawing.coordinates.x + drawing.dimensions.length &&
        stage.getPointerPosition().y >= drawing.coordinates.y &&
        stage.getPointerPosition().y <= drawing.coordinates.y + drawing.dimensions.breadth
    );
  
    if (existingShape) {
      if (selectedTool === 'delete') {
        const newDrawings = drawings.filter((drawing) => drawing !== existingShape);
        setDrawings(newDrawings);
        updateDatabase(newDrawings);
      } else {
        setSelectedDrawingIndex(drawings.indexOf(existingShape));
      }
    } else {
      if (selectedTool === 'delete' && selectedDrawingIndex !== null) {
        const newDrawings = drawings.slice();
        newDrawings.splice(selectedDrawingIndex, 1);
        setDrawings(newDrawings);
        updateDatabase(newDrawings);
        setSelectedDrawingIndex(null);
      } else {
        const newDrawing = {
          shape: selectedTool,
          coordinates: {
            x: stage.getPointerPosition().x,
            y: stage.getPointerPosition().y,
          },
          dimensions: {
            length: 80,
            breadth: 30,
          },
          annotation: getAnnotation(selectedTool),
        };
        saveDrawingToDatabase(newDrawing);
  
        setDrawings((prevDrawings) => {
          const updatedDrawings = [...prevDrawings, newDrawing];
          updateDatabase(updatedDrawings);
          return updatedDrawings;
        });
      }
    }
  };
  


  const handleDragMove = (event, index) => {
    const stage = event.target.getStage();
    const pointerPos = stage.getPointerPosition();

    setDrawings((prevDrawings) => {
      const newDrawings = [...prevDrawings];
      const drawing = newDrawings[index];

      drawing.coordinates.x = pointerPos.x - drawing.dimensions.length / 2;
      drawing.coordinates.y = pointerPos.y - drawing.dimensions.breadth / 2;

      updateDatabase(newDrawings);

      return newDrawings;
    });
  };


  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setSelectedDrawingIndex(null);
  };

  const handleSelectDrawing = (index) => {
    setSelectedDrawingIndex(index);
  };

  const handleToggleAnnotation = () => {
    setIsAnnotationVisible(!isAnnotationVisible);
  };

  const getAnnotation = (shape) => {
    switch (shape) {
      case 'rectangle':
        return 'Rectangle Annotation';
      case 'line':
        return 'Line Annotation';
      case 'circle':
        return 'Circle Annotation';
      default:
        return ' ';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
      <div style={{ margin: '10px' }}>
        <button onClick={() => handleSelectTool('rectangle')} style={{padding:"1rem", }}>Rectangle</button>
        <button onClick={() => handleSelectTool('line')} style={{padding:"1rem", }}>Line</button>
        <button onClick={() => handleSelectTool('circle')} style={{padding:"1rem", }}>Circle</button>
        <button onClick={() => handleSelectTool('delete')}style={{padding:"1rem", }}>Delete</button>
        <button onClick={handleToggleAnnotation} style={{padding:"1rem", }}>
          {isAnnotationVisible ? 'Hide Annotation' : 'Show Annotation'}
        </button>
        <button onClick={handleToggleAnnotation} style={{padding:"1rem", }}>
          {isAnnotationVisible ? 'start Resize' : ' Stop Resize'}
        </button>
        
      </div>
      <Stage width={800} height={600} onMouseDown={handleDraw} onTouchStart={handleDraw}>
        <Layer>
          <Rect x={0} y={0} width={800} height={600} fill="lightgray" />
          {drawings.map((drawing, index) => (
            <Group key={index} draggable onDragMove={(event) => handleDragMove(event, index)}>

{drawing.shape === 'rectangle' && (
  <React.Fragment>
    <Rect
      x={drawing.coordinates.x}
      y={drawing.coordinates.y}
      width={drawing.dimensions.length}
      height={drawing.dimensions.breadth}
      fill="magenta"
      onClick={() => handleSelectDrawing(index)}
      onTransformEnd={(event) => handleResize(event, index)} // Add onTransformEnd for resize
      draggable
      onDragMove={(event) => handleDragMove(event, index)}
    />
  </React.Fragment>
)}
              {drawing.shape === 'line' && (
                <React.Fragment>
                  <Line
                    points={[
                      drawing.coordinates.x,
                      drawing.coordinates.y,
                      drawing.coordinates.x + drawing.dimensions.length,
                      drawing.coordinates.y + drawing.dimensions.breadth,
                    ]}
                    stroke="red"
                    strokeWidth={6}
                    onClick={() => handleSelectDrawing(index)}
                  />
                </React.Fragment>
              )}

              {drawing.shape === 'circle' && (
                <React.Fragment>
                  <Circle
                    x={drawing.coordinates.x}
                    y={drawing.coordinates.y}
                    radius={Math.sqrt(
                      Math.pow(drawing.dimensions.length, 2) +
                        Math.pow(drawing.dimensions.breadth, 2)
                    )}
                    fill={selectedDrawingIndex === index ? 'grey' : 'green'}
                    onClick={() => handleSelectDrawing(index)}
                  />
                </React.Fragment>
              )}

              {isAnnotationVisible && drawing.annotation && (
                <Text
                  x={drawing.coordinates.x}
                  y={drawing.coordinates.y - 10}
                  text={drawing.annotation}
                />
              )}
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Drawing;



