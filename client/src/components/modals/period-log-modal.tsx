import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PeriodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { startDate: string; endDate?: string }) => void;
  onOpen: () => void;
  children: React.ReactNode;
}

export function PeriodLogModal({ isOpen, onClose, onSave, onOpen, children }: PeriodLogModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const handleSave = () => {
    if (!startDate) return;
    
    onSave({
      startDate,
      endDate: endDate || undefined,
    });
    
    setStartDate("");
    setEndDate("");
    onClose();
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div onClick={onOpen}>
        {children}
      </div>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Log Period
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              Period Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
              Period End Date (Optional)
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={today}
              className="mt-1"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!startDate}
              className="flex-1 btn-primary text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
