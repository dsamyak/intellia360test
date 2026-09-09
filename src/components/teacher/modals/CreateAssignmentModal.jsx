"use client";

import { useState } from "react";
import Modal from "../Modal";
import { Button, Input, Label, Select } from "../ui";
import { useData } from "@/context/TeacherDataContext";
import { ClipboardList } from "lucide-react";

const TYPES = ["Homework", "Worksheet", "Quiz", "Practice", "Project"];

export default function CreateAssignmentModal({ open, onClose, defaultClassId }) {
  const { classes, addAssignment, notify } = useData();
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState(defaultClassId || classes[0]?.id);
  const [type, setType] = useState("Homework");
  const [due, setDue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addAssignment({ title: title.trim(), classId, type, due: due || "No due date" });
    notify("Assignment created and assigned to the class");
    setTitle(""); setDue("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create assignment" subtitle="Assign homework, a worksheet, or practice set to a class.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input placeholder="e.g. Decimals Practice Set" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Class</Label>
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name.split(" — ")[0]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
        </div>
        <div>
          <Label>Due date</Label>
          <Input placeholder="e.g. Fri, Aug 14" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit"><ClipboardList size={15} /> Assign to class</Button>
        </div>
      </form>
    </Modal>
  );
}
