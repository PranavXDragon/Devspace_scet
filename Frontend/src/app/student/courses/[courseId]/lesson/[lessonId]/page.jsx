"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Circle, PlayCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/hooks/use-toast";

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchData();
    }
  }, [courseId, lessonId]);

  const fetchData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        axiosInstance.get(`/learning/courses/${courseId}`),
        axiosInstance.get('/learning/progress')
      ]);
      
      const courseData = courseRes.data;
      setCourse(courseData);
      
      const currentLesson = courseData.course_lessons?.find(l => l.id === lessonId);
      setLesson(currentLesson);

      const progressData = progressRes.data || [];
      const completed = progressData.some(p => p.lesson_id === lessonId && p.status === 'completed');
      setIsCompleted(completed);

    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load lesson.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async () => {
    try {
      setCompleting(true);
      const newStatus = isCompleted ? 'incomplete' : 'completed';
      await axiosInstance.post('/learning/progress', {
        courseId,
        lessonId,
        status: newStatus
      });
      setIsCompleted(!isCompleted);
      
      if (!isCompleted) {
        toast({
          title: "Awesome!",
          description: "Lesson marked as complete.",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update progress.",
        variant: "destructive"
      });
    } finally {
      setCompleting(false);
    }
  };

  const navigateToLesson = (id) => {
    router.push(`/student/courses/${courseId}/lesson/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-text">Lesson not found</h3>
        <button onClick={() => router.back()} className="text-accent mt-4">Go Back</button>
      </div>
    );
  }

  const allLessons = course?.course_lessons || [];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-bg">
      
      {/* Sidebar - Curriculum */}
      <div className="w-full lg:w-80 border-r border-border-soft bg-card overflow-y-auto shrink-0 flex flex-col">
        <div className="p-4 border-b border-border-soft sticky top-0 bg-card z-10 flex flex-col gap-2">
          <button 
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="flex items-center gap-2 text-text-muted hover:text-text transition-colors text-xs font-semibold uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Course
          </button>
          <h3 className="font-bold text-text line-clamp-2">{course?.title}</h3>
        </div>
        
        <div className="flex-1 p-2 space-y-1">
          {allLessons.map((l, idx) => {
            const active = l.id === lessonId;
            // Note: We don't have global completion state for ALL lessons here since we only tracked current lesson in state, 
            // but for MVP we can just show the current lesson's active state visually.
            return (
              <button
                key={l.id}
                onClick={() => navigateToLesson(l.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  active ? 'bg-accent/10 border border-accent/20' : 'hover:bg-card-hover border border-transparent'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-xs font-mono text-text-muted w-4">{idx + 1}.</div>
                <div className="flex-grow">
                  <span className={`text-sm font-medium line-clamp-2 ${active ? 'text-accent' : 'text-text'}`}>
                    {l.title}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                     {l.type === 'video' ? <PlayCircle className="w-3 h-3" /> : null}
                     <span className="capitalize">{l.type}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24">
          
          <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">{lesson.title}</h1>

          {/* Video Player (if type is video) */}
          {lesson.type === 'video' && lesson.video_url && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-border-soft shadow-lg relative">
              {/* For MVP we render an iframe if it looks like youtube, or video tag. Assuming generic iframe for now. */}
              <iframe 
                src={lesson.video_url.includes('youtube') ? lesson.video_url.replace('watch?v=', 'embed/') : lesson.video_url} 
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Markdown Content */}
          {lesson.content && (
            <div className="prose prose-invert max-w-none prose-headings:text-text prose-p:text-text-muted prose-a:text-accent prose-code:text-accent prose-pre:bg-card prose-pre:border prose-pre:border-border-soft">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-8 border-t border-border-soft flex items-center justify-between">
            <button
              onClick={toggleComplete}
              disabled={completing}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all ${
                isCompleted 
                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20' 
                  : 'bg-accent text-bg hover:opacity-90 shadow-[0_0_15px_rgba(46,197,212,0.3)]'
              }`}
            >
              {isCompleted ? (
                <><CheckCircle className="w-5 h-5" /> Completed</>
              ) : (
                <><Circle className="w-5 h-5" /> Mark as Complete</>
              )}
            </button>

            {/* Next Lesson Logic could go here */}
            {(() => {
              const currentIdx = allLessons.findIndex(l => l.id === lessonId);
              const nextLesson = allLessons[currentIdx + 1];
              if (nextLesson) {
                return (
                  <button
                    onClick={() => navigateToLesson(nextLesson.id)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm bg-card hover:bg-card-hover text-text border border-border-soft transition-colors"
                  >
                    Next Lesson <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                )
              }
              return null;
            })()}
          </div>
        </div>
      </div>

    </div>
  );
}
