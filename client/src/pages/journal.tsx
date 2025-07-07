import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit3, Calendar, Heart, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JournalEntry } from "@shared/schema";

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "",
    tags: [] as string[],
  });

  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal', user?.id],
    enabled: !!user,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/journal', {
        userId: user?.id,
        date: new Date().toISOString().split('T')[0],
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Entry saved!",
        description: "Your journal entry has been saved successfully.",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/journal/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      setIsModalOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({
        title: "Entry updated!",
        description: "Your journal entry has been updated successfully.",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      mood: "",
      tags: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEntry) {
      updateEntryMutation.mutate({
        id: editingEntry.id,
        data: formData,
      });
    } else {
      createEntryMutation.mutate(formData);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title || "",
      content: entry.content,
      mood: entry.mood || "",
      tags: entry.tags || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntryMutation.mutateAsync(id);
    }
  };

  const moodEmojis: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    neutral: "😐",
    excited: "🤗",
    anxious: "😰",
    grateful: "🙏",
    tired: "😴",
    pain: "😣",
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Journal</h2>
            <p className="text-gray-600">Your personal space for thoughts and reflections</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingEntry(null);
                  resetForm();
                }}
                className="btn-primary text-white rounded-full w-12 h-12 p-0"
              >
                <Plus size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Entry" : "New Journal Entry"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your entry a title..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="mood">How are you feeling?</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mood }))}
                        className={`px-3 py-2 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                          formData.mood === mood
                            ? "bg-brand-pink text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="capitalize">{mood}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="content">What's on your mind?</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your thoughts here..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 btn-primary text-white"
                    disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                  >
                    {editingEntry ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Journal Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-4">Write your first journal entry to begin reflecting on your thoughts and feelings.</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-white"
            >
              <Plus size={16} className="mr-2" />
              Create First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        {entry.mood && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm">
                              {moodEmojis[entry.mood]} {entry.mood}
                            </span>
                          </>
                        )}
                      </div>
                      {entry.title && (
                        <h4 className="font-semibold text-gray-800 mb-2">{entry.title}</h4>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                        className="p-1 h-8 w-8"
                      >
                        <Edit3 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-brand-light-pink text-brand-pink text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
