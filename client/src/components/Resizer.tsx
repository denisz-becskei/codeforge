interface ResizerProps {
  onDrag: (newWidth: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const Resizer: React.FC<ResizerProps> = ({ onDrag, onDragStart, onDragEnd }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart?.();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    onDrag(e.clientX);
  };

  const handleMouseUp = () => {
    onDragEnd?.();
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return <div className="resizer" onMouseDown={handleMouseDown} style={{ cursor: "col-resize" }} />;
};

export default Resizer;