import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface ListColumnProps {
  list: { id: number; title: string };
  children: React.ReactNode;
}

const ListColumn: React.FC<ListColumnProps> = ({ list, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      id={`list-${list.id}`}
      style={{
        width: "300px",
        backgroundColor: isOver ? "#e3f2fd" : "#f4f4f4",
        padding: "1rem",
        borderRadius: "8px",
        minHeight: "600px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxSizing: "border-box",
      }}
    >
      <h3>{list.title}</h3>
      {children}
    </div>
  );
};

export default ListColumn;


