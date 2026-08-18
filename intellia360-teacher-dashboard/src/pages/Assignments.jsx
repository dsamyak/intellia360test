import { useMemo, useState } from "react";
import { Plus, Calendar, Users2, Trash2 } from "lucide-react";
import { useData } from "../context/DataContext";
import { Card, StatusPill, Button, Select, Pill } from "../components/ui";
import CreateAssignmentModal from "../components/modals/CreateAssignmentModal";

const COLUMNS = ["Not Started", "In Progress", "Completed", "Overdue"];

export default function Assignments() {
  const { assignments, classes, updateAssignmentStatus, deleteAssignment, notify } = useData();
  const [classFilter, setClassFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete the assignment "${title}"?`)) {
      deleteAssignment(id);
      notify(`Assignment "${title}" deleted`, "info");
    }
  };

  const filtered = useMemo(
    () => assignments.filter((a) => classFilter === "all" || a.classId === classFilter),
    [assignments, classFilter]
  );

  const className = (id) => classes.find((c) => c.id === id)?.name.split(" — ")[0] || "—";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="w-auto min-w-[180px]">
          <option value="all">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name.split(" — ")[0]}</option>)}
        </Select>
        <Button onClick={() => setShowCreate(true)}><Plus size={15} /> New assignment</Button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((status) => {
          const items = filtered.filter((a) => a.status === status);
          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <p className="text-[12px] font-bold uppercase tracking-wide text-ink/50">{status}</p>
                <span className="text-[11px] font-mono font-semibold bg-black/[0.06] rounded-full px-1.5 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-2.5 min-h-[60px]">
                {items.map((a) => (
                  <Card key={a.id} className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium leading-tight">{a.title}</p>
                      <Pill tone="ink" className="shrink-0">{a.type}</Pill>
                    </div>
                    <p className="text-[11px] text-ink/40 mt-1.5 flex items-center gap-1"><Users2 size={11} /> {className(a.classId)}</p>
                    <p className="text-[11px] text-ink/40 flex items-center gap-1 mt-0.5"><Calendar size={11} /> {a.due}</p>

                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10.5px] text-ink/40 mb-1">
                        <span>Submitted</span><span className="font-mono">{a.submitted}/{a.total}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                        <div className="h-full bg-jade rounded-full" style={{ width: `${a.total ? (a.submitted / a.total) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={a.status}
                        onChange={(e) => updateAssignmentStatus(a.id, e.target.value)}
                        className="w-full text-[11.5px] font-medium border border-black/10 rounded-lg px-2 py-1.5 bg-canvas outline-none focus:border-violet"
                      >
                        {COLUMNS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="p-1.5 rounded-lg border border-black/10 text-coral hover:bg-coral-tint hover:border-coral/25 transition-colors cursor-pointer shrink-0"
                        title="Delete assignment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                ))}
                {items.length === 0 && (
                  <p className="text-[12px] text-ink/30 border border-dashed border-black/10 rounded-xl py-6 text-center">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateAssignmentModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
