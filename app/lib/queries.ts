import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePuterStore } from "./puter";

// Fetch all user resumes
export function useUserResumesQuery(enabled: boolean = true) {
  const { getUserResumes } = usePuterStore();
  return useQuery({
    queryKey: ["userResumes"],
    queryFn: getUserResumes,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch a single resume by ID
export function useResumeDetailsQuery(
  id: string | undefined,
  enabled: boolean = true
) {
  const { getResumeById } = usePuterStore();
  return useQuery({
    queryKey: ["resumeDetails", id],
    queryFn: () => (id ? getResumeById(id) : Promise.resolve(null)),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

// Fetch a resume image blob and return a blob URL
export function useResumeImageQuery(
  path: string | undefined,
  enabled: boolean = true
) {
  const { fs } = usePuterStore();
  return useQuery({
    queryKey: ["resumeImage", path],
    queryFn: async () => {
      if (!path) return "";
      const blob = await fs.read(path);
      if (!blob) return "";
      return URL.createObjectURL(blob);
    },
    enabled: !!path && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

// Generic fs.read
export function useFSRead(path: string | undefined, enabled: boolean = true) {
  const { fs } = usePuterStore();
  return useQuery({
    queryKey: ["fsRead", path],
    queryFn: () => (path ? fs.read(path) : Promise.resolve(undefined)),
    enabled: !!path && enabled,
    staleTime: 1000 * 60 * 5,
  });
}
