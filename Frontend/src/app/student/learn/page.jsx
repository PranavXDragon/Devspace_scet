"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function LearningHubPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await axiosInstance.get('/learning/roadmaps');
      setRoadmaps(res.data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load learning roadmaps.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text">Learning Hub</h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Follow structured paths, build your skills step-by-step, and track your progress in real-time.
        </p>
      </div>

      {/* Roadmaps */}
      {roadmaps.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border-soft">
          <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text">No Roadmaps Found</h3>
          <p className="text-text-muted">Stay tuned, new courses are being added!</p>
        </div>
      ) : (
        <div className="space-y-12">
          {roadmaps.map((roadmap) => (
            <div key={roadmap.id} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border-soft pb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">{roadmap.title}</h2>
                  {roadmap.description && (
                    <p className="text-text-muted text-sm">{roadmap.description}</p>
                  )}
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmap.courses?.map((course) => (
                  <Link href={`/student/courses/${course.id}`} key={course.id}>
                    <div className="group bg-card hover:bg-card-hover border border-border-soft hover:border-accent/30 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col">
                      {/* Thumbnail Placeholder */}
                      <div className="h-32 bg-accent/5 flex items-center justify-center relative overflow-hidden">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-accent/40 group-hover:scale-110 transition-transform duration-300" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-text-muted mt-2 line-clamp-2 mb-4 flex-grow">
                          {course.description || "No description provided."}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                            Start Course
                          </span>
                          <ChevronRight className="w-4 h-4 text-accent transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {(!roadmap.courses || roadmap.courses.length === 0) && (
                  <div className="col-span-full py-8 text-center bg-card/30 rounded-xl border border-dashed border-border-soft">
                    <p className="text-text-muted text-sm">No courses available in this roadmap yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
