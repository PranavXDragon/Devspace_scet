import React from "react";
import { ShieldCheck, Edit, Trash2, Image as ImageIcon } from "lucide-react";

export const TeamMemberCard = ({
  member,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow w-full">
      {/* Photo Section */}
      <div className="h-56 w-full bg-card-hover border-b border-border-soft relative overflow-hidden flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center bg-card-hover text-text-muted">
          <span className="font-sans font-bold text-lg uppercase tracking-[0.2em] opacity-30 rotate-[-10deg]">PHOTO</span>
        </div>
        {/* Year Badge */}
        <div className="absolute top-3 right-3 bg-card/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-border-soft flex items-center">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
            {member.academicYear}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col items-center text-center">
        <h3
          className="text-lg font-bold text-text mb-1 line-clamp-1 w-full"
          title={member.name}
        >
          {member.name}
        </h3>

        <div className="flex items-center justify-center gap-1.5 text-accent text-sm font-semibold mb-1 w-full">
          <ShieldCheck className="w-4 h-4 shrink-0" />{" "}
          <span className="line-clamp-1">{member.post}</span>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex gap-3 mt-auto pt-4 border-t border-border-soft w-full">
            <button
              onClick={() => onEdit && onEdit(member)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-card-hover hover:bg-accent/10 text-text-text-muted hover:text-accent rounded-lg text-sm font-medium transition-colors border border-border hover:border-accent"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(member._id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-card-hover hover:bg-danger/10 text-text-text-muted hover:text-danger rounded-lg text-sm font-medium transition-colors border border-border hover:border-danger/30"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
