"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, BookOpen, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function CourseOverviewPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        axiosInstance.get(`/learning/courses/${courseId}`),
        axiosInstance.get('/learning/progress')
      ]);
      setCourse(courseRes.data);
      setProgress(progressRes.data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load course details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = (lessonId) => {
    return progress.some(p => p.lesson_id === lessonId && p.status === 'completed');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-text">Course not found</h3>
        <button onClick={() => router.back()} className="text-accent mt-4">Go Back</button>
      </div>
    );
  }

  const lessons = course.course_lessons || [];
  const completedCount = lessons.filter(l => isCompleted(l.id)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Back Button */}
      <button 
        onClick={() => router.push('/student/learn')}
        className="flex items-center gap-2 text-text-muted hover:text-text transition-colors text-sm font-semibold uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
      </button>

      {/* Course Header */}
      <div className="bg-card border border-border-soft rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 aspect-video bg-accent/5 rounded-xl border border-border-soft flex items-center justify-center overflow-hidden shrink-0">
             {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-12 h-12 text-accent/40" />
              )}
          </div>
          <div className="flex-grow space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-text">{course.title}</h1>
            <p className="text-text-muted">{course.description}</p>
            
            {/* Progress Bar */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm font-semibold text-text">
                <span>Course Progress</span>
                <span className="text-accent">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-bg rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden rounded-full">
                    <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[stripes_1s_linear_infinite]" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-muted">{completedCount} of {lessons.length} lessons completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text mb-6">Course Curriculum</h2>
        
        {lessons.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border-soft">
            <p className="text-text-muted">No lessons available for this course yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lessons.map((lesson, index) => {
              const completed = isCompleted(lesson.id);
              return (
                <Link href={`/student/courses/${course.id}/lesson/${lesson.id}`} key={lesson.id}>
                  <div className="flex items-center p-4 bg-card hover:bg-card-hover border border-border-soft hover:border-accent/30 rounded-xl transition-all duration-300 cursor-pointer group">
                    <div className="flex-shrink-0 w-10 text-text-muted font-mono font-bold text-sm">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-shrink-0 mr-4">
                      {lesson.type === 'video' ? (
                        <PlayCircle className={`w-5 h-5 ${completed ? 'text-accent' : 'text-text-muted'}`} />
                      ) : (
                        <FileText className={`w-5 h-5 ${completed ? 'text-accent' : 'text-text-muted'}`} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className={`font-semibold ${completed ? 'text-text-muted line-through' : 'text-text group-hover:text-accent'} transition-colors`}>
                        {lesson.title}
                      </h4>
                    </div>
                    {completed && (
                      <div className="flex-shrink-0 ml-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
