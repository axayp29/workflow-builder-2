import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const buttonStyle: React.CSSProperties = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  border: '1px solid #d32f2f',
  borderRadius: '50%',
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#d32f2f',
  fontWeight: 'bold',
  zIndex: 10,
  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
};

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, data }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const onEdgeDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    if (data && data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <foreignObject
        width={40}
        height={40}
        x={labelX - 20}
        y={labelY - 20}
        requiredExtensions="http://www.w3.org/1999/xhtml"
        style={{ overflow: 'visible' }}
      >
        <button style={buttonStyle} onClick={onEdgeDelete} title="Delete connection">
          ×
        </button>
      </foreignObject>
    </>
  );
} 